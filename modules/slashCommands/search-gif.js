const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('dotenv');
const axios = require('axios');
const slashCommandError = require('../error/slashCommandError');
const cooldown = require('../events/cooldown');
config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search-gif')
    .setDescription('指定したワードに関するGIFを送信します')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('検索したいワード')
        .setRequired(true)),
  async execute(interaction) {
    try {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;

      await interaction.deferReply();
      const apiKey = process.env.tenorAPI;
      const query = interaction.options.getString('query');

      const response = await axios.get(`https://tenor.googleapis.com/v2/search?q=${query}&key=${apiKey}&random=true`);
      const gifUrl = response.data.results[0].media_formats.gif.url;

      const embed = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTimestamp()
        .setFooter({ text: 'Emubot | search-GIF', iconURL: interaction.client.user.displayAvatarURL() })
        .setTitle(`${query}のGIFです！`)
        .setImage(gifUrl);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
       slashCommandError(interaction.client, interaction, error);
    }
  },
};
