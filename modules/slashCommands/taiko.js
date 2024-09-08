const { SlashCommandBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const random = require('../events/random');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taiko')
    .setDescription('太鼓の達人の曲をランダムに選択します。')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('選曲オプションを選択します。')
        .setRequired(true)
        .addChoices(
          { name: '全曲', value: 'all' },
          { name: '★10', value: 'level10' },
        ))
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('選択する曲の数を指定します。')
        .setRequired(true)),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;

    await interaction.deferReply();

    const option = interaction.options.getString('action');
    const count = interaction.options.getInteger('count');
    const embedColor = '#ff7c04';  

    await random.getRandomSongs(interaction, commandName, 'taiko', option, count, embedColor);
  },
};
