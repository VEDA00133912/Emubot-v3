const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const cooldown = require('../events/cooldown');
const handleSlashCommandError = require('../error/slashCommandError'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yahoonews')
        .setDescription('Yahooニュースリンクを送信します'),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        await interaction.deferReply();

        const url = 'https://www.yahoo.co.jp/';

        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const newsLinks = [];

            $('a[href*="news.yahoo.co.jp/pickup"]').each((i, el) => {
                newsLinks.push($(el).attr('href'));
            });

            if (newsLinks.length > 0) {
                const randomLink = newsLinks[Math.floor(Math.random() * newsLinks.length)];
                await interaction.editReply({ content: randomLink });
            } else {
                await interaction.editReply('ニュースが見つかりません');
            }
        } catch (error) {
handleSlashCommandError(interaction.client, interaction, error);
        }
    }
};
