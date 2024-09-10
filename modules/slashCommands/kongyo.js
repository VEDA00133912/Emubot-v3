const { SlashCommandBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kongyo')
    .setDescription('コンギョを送信します。'),
  async execute(interaction) {
    try {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;
      
      await interaction.reply("[コンギョー](https://www.youtube.com/watch?v=IkOEbH7lawI)");
    } catch (error) {
    slashCommandError(interaction.client, interaction, error);
    }
  },
};