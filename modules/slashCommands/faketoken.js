const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faketoken')
    .setDescription('フェイクTokenを生成')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('生成する数')
        .setRequired(true)),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;
    
    try {
      await interaction.deferReply({ ephemeral: true });
      const quantity = interaction.options.getInteger('count');
      if (quantity > 10) {
        return interaction.followUp('生成する数は10以下にしてください');
      }

      const tokens = getRandomMemberIds(interaction.guild.members.cache, quantity)
        .map(generateToken);

      const embed = new EmbedBuilder()
        .setColor('#7289da')
        .setTitle('Token')
        .setTimestamp()
        .setFooter({ text: 'Emubot | faketoken', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription(tokens.join('\n'));

      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error); 
    }
  },
};

function getRandomMemberIds(members, count) {
  return Array.from({ length: count }, () => members.random().id);
}
function generateToken(memberId) {
  const base64Id = Buffer.from(memberId).toString('base64');
  const randomSegment = length => Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-'.charAt(Math.floor(Math.random() * 64))).join('');
  return `${base64Id}.${randomSegment(6)}.${randomSegment(32)}`;
}
