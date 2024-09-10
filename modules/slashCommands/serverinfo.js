const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const slashCommandError = require('../error/slashCommandError');
const cooldown = require('../events/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('サーバー情報の表示'),
  async execute(interaction) {
    try {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;

      await interaction.deferReply();

      const guild = interaction.guild;
      const serverIconUrl = guild.iconURL({ size: 1024 });
      const defaultIconUrl = `https://cdn.discordapp.com/embed/avatars/1.png`;
      const thumbnailUrl = serverIconUrl || defaultIconUrl;
      const textChannelsCount = guild.channels.cache.filter(c => c.type === 0).size;
      const voiceChannelsCount = guild.channels.cache.filter(c => c.type === 2).size;
      const boostLevel = boost(interaction.guild.premiumSubscriptionCount);
      const userCount = guild.members.cache.filter(m => !m.user.bot).size;
      const botCount = guild.members.cache.filter(m => m.user.bot).size;
      const totalMemberCount = userCount + botCount;
      const bans = await guild.bans.fetch();
      const bannedCount = bans.size;

      const embed = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTimestamp()
        .setDescription(`**${interaction.guild.name}の情報**`)
        .setFooter({ text: 'Emubot | serverinfo', iconURL: interaction.client.user.displayAvatarURL() })
        .setThumbnail(thumbnailUrl)
        .addFields(
          { name: 'サーバーID', value: '```\n' + `${guild.id}` + '\n```' },
          { name: '鯖主 👑', value: `<@${guild.ownerId}> (${guild.ownerId})` },
          { name: 'サーバーブースト <a:boost:1282164483665428541>', value: `${interaction.guild.premiumSubscriptionCount}ブースト(${boostLevel}レベル)` },
          { name: 'チャンネル数', value: `TEXT : ${textChannelsCount}  VC: ${voiceChannelsCount} ` },
          { name: 'メンバー数', value: `メンバー ${totalMemberCount}人 (ユーザー：${userCount}人  BOT：${botCount}人)\nロール数: **${guild.roles.cache.size}**` },
          { name: 'BANユーザー数', value: `${bannedCount}人` }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  }
};

function boost(count) {
  if (count >= 14) {
    return 3;
  } else if (count >= 7) {
    return 2;
  } else if (count >= 2) {
    return 1;
  } else {
    return 0;
  }
}