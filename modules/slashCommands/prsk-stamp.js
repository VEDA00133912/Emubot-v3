const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prsk-stamp')
    .setDescription('プロセカのスタンプをランダムに送信します'),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;
    
    try {
      await interaction.deferReply();

      const { data } = await axios.get('https://pjsekai-souco.com/illustration/stamp/');
      const $ = cheerio.load(data);
      const stampUrls = $('img')
        .map((_, element) => $(element).attr('src'))
        .get()
        .filter(src => src && src.includes('/wp-content/uploads/') && !src.includes('スタンプ一覧改'));

      if (stampUrls.length === 0) {
        return interaction.editReply('スタンプが見つかりませんでした。');
      }

      const randomStampUrl = stampUrls[Math.floor(Math.random() * stampUrls.length)];

      const embed = new EmbedBuilder()
        .setImage(randomStampUrl)
        .setTimestamp()
        .setFooter({ text: 'Emubot | prsk-stamp', iconURL: interaction.client.user.displayAvatarURL() })
        .setColor('#f8b4cb');

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await slashCommandError(interaction.client, interaction, error);  
    }
  },
};
