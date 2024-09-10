const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const slashCommandError = require('../error/slashCommandError');
const cooldown = require('../events/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('ランダム文字生成')
    .addIntegerOption(option =>
      option.setName('length')
        .setDescription('生成したい文字数')
        .setRequired(true)
    ),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;

    const length = interaction.options.getInteger('length');

    if (length > 1000) {
      try {
        await interaction.reply('1000以下にしてください');
      } catch (error) {
        slashCommandError(interaction.client, interaction, error); 
      }
    } else {
      const randomString = Array.from({ length }, () => Math.random().toString(36).charAt(2)).join("");

      const embed = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTitle('ランダムな文字列')
        .setTimestamp()
        .setFooter({ text:'Emubot | random', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription('```\n' + randomString + '\n```');

      try {
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        slashCommandError(interaction.client, interaction, error); 
      }
    }
  },
};
