const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('google')
        .setDescription('Google検索を行います')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('検索ワード')
                .setRequired(true)),
    
    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const searchUrl = `https://www.google.co.jp/search?q=${encodeURIComponent(query)}`;

        try {
            const { data } = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(data);
            const searchResults = [];
            $('div.g').each((i, elem) => {
                if (i >= 5) return;  

                const title = $(elem).find('h3').text();
                const link = $(elem).find('a').attr('href');

                if (title && link) {
                    searchResults.push({ title, link });
                }
            });
            
            if (searchResults.length === 0) {
                return interaction.editReply('検索結果が見つかりませんでした。');
            }

            const embed = new EmbedBuilder()
                .setTitle(`Google検索結果: ${query}`)
                .setColor('#f8b4cb')
                .setTimestamp()
                .setFooter({ text:'Emubot | google', iconURL: interaction.client.user.displayAvatarURL() })
            searchResults.forEach(result => {
                embed.addFields({ name: result.title, value: result.link });
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            slashCommandError(interaction.client, interaction, error);
        }
    }
};
