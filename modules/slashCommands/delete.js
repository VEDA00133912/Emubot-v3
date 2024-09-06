const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('メッセージを削除します')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('削除したいメッセージの数(100以下)')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('メッセージを削除したいユーザー')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.editReply('あなたにメッセージ削除権限が有りません。');
    }
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.editReply('BOTにメッセージを管理する権限がありません。');
    }
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ReadMessageHistory)) {
      return interaction.editReply('BOTにメッセージ履歴を読む権限がありません。');
    }
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewChannel)) {
      return interaction.editReply('BOTにチャンネルを見る権限がありません。');
    }

    const count = interaction.options.getInteger('count');
    const user = interaction.options.getUser('user');
    const channel = interaction.channel;
    if (count > 100) {
      return interaction.editReply('一度に削除できるメッセージ数は 100 件までです。');
    }

    try {
      const messages = await channel.messages.fetch({ limit: count });
      const userMessages = user ? messages.filter(m => m.author.id === user.id) : messages;

      if (userMessages.size === 0) {
        return interaction.editReply('ユーザーが見つかりません。');
      }

      const twoWeeksAgo = Date.now() - 1209600000; 
      const oldMessages = userMessages.filter(m => m.createdTimestamp < twoWeeksAgo);
      if (oldMessages.size > 0) {
        return interaction.editReply('2週間以上前のメッセージは削除できません。');
      }

      const deletedMessages = await channel.bulkDelete(userMessages.first(count), true);

      const embed = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTitle('削除完了！')
        .setTimestamp()
        .setFooter({ text:'Emubot | Delete', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription(`削除したメッセージ数: ${deletedMessages.size}`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  },
};
