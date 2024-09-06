const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dot')
        .setDescription('ドット絵に変換します')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('画像をアップロード')
                .setRequired(true)),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        await interaction.deferReply();

        const attachment = interaction.options.getAttachment('image');
        if (!attachment) {
            return interaction.editReply('画像がアップロードされていません');
        }

        const validFormats = ['jpg', 'jpeg', 'png'];
        const url = new URL(attachment.url);
        const fileExtension = url.pathname.split('.').pop().toLowerCase();

        if (!validFormats.includes(fileExtension)) {
            return interaction.editReply('このフォーマットは対応していません。jpg、jpeg、pngのどれかを使用してください。');
        }

        const imageUrl = attachment.url;
        const apiUrl = `https://pixel-image.vercel.app/api?image=${encodeURIComponent(imageUrl)}&size=4&k=8`;

        try {
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const resultImageUrl = response.request.res.responseUrl;

            const embed = new EmbedBuilder()
                .setTitle('ドット絵に変換しました！')
                .setColor('#f8b4cb')
                .setFooter({ text: 'Emubot | dot', iconURL: interaction.client.user.displayAvatarURL() })
                .setImage(resultImageUrl)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            slashCommandError(interaction.client, interaction, error);
        }
    },
};
