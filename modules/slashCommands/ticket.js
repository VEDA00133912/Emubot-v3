const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('チケットを作成します'),

  async execute(interaction) {
    try {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;
      
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ content: 'あなたにチャンネル管理権限が有りません。', ephemeral: true });
      }
      
      await interaction.deferReply();
      const create = new ButtonBuilder()
        .setCustomId('create')
        .setStyle(ButtonStyle.Primary)
        .setLabel('チケットを作成する');

      const embed1 = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTimestamp()
        .setFooter({ text:'Emubot | ticket create', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription('チケットを作成するには下のボタンを押してください');

      await interaction.editReply({
        embeds: [embed1],
        components: [new ActionRowBuilder().addComponents(create)],
      });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  },
};
