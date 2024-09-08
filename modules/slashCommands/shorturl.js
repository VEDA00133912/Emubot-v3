const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('dotenv');
const axios = require('axios');
const slashCommandError = require('../error/slashCommandError');
const cooldown = require('../events/cooldown');
config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorturl')
        .setDescription('URLを短縮します')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('短縮したいURLを入力してください')
                .setRequired(true)),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        await interaction.deferReply({ ephemeral: true });

        const urlToShorten = interaction.options.getString('url');
        const apiKey = process.env.xgd_API;

        if (!isValidUrl(urlToShorten)) {
            return interaction.editReply('<:error:1282141871539490816> 無効なURLが入力されました。有効なURLを入力してください。');
        }
        
        try {
            const response = await axios.get(`https://xgd.io/V1/shorten?url=${encodeURIComponent(urlToShorten)}&key=${apiKey}`);

            if (response.status === 200 && response.data.status === 200) {
                const Url = response.data.shorturl;
                const shortenedUrl = `<${Url}>`;

                const embed = new EmbedBuilder()
                    .setDescription(`<:check:1282141869387550741> **短縮に成功しました！**\n\n**短縮URL: ${shortenedUrl}**`)
                    .setTimestamp()
                    .setFooter({ text: 'Emubot | shorturl', iconURL: interaction.client.user.displayAvatarURL() })
                    .setColor('#f8b4cb');

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            slashCommandError(interaction.client, interaction, error); 
        }
    },
};

function isValidUrl(string) {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}([\/\w .-]*)*\/?$/;
    return urlPattern.test(string);
}
