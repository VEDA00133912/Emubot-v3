const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minecraft-status')
    .setDescription('マイクラサーバーの状態を表示します')
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('サーバーIPアドレスを指定')
        .setRequired(true)),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;

    const ip = interaction.options.getString('ip');
    const fetchingEmbed = new EmbedBuilder()
      .setTitle('Minecraft Server Status')
      .setDescription('<a:minecraft:1282585425717755914> サーバーステータス取得中... <a:minecraft:1282585425717755914>')
      .setColor('#667F33')
      .setTimestamp()
      .setFooter({ text: 'Emubot | mcserver', iconURL: interaction.client.user.displayAvatarURL() });

    const sentMessage = await interaction.reply({ embeds: [fetchingEmbed], fetchReply: true });

    try {
      const serverStatus = await getServerStatus(ip);

      const statusEmbed = new EmbedBuilder()
        .setTitle('<a:minecraft:1282585425717755914> Minecraft Server Status <a:minecraft:1282585425717755914>')
        .setColor('#667F33')
        .setTimestamp()
        .setFooter({ text: 'Emubot | minecraft-status', iconURL: interaction.client.user.displayAvatarURL() })
        .addFields(
          { name: 'Status', value: serverStatus.online ? '<:online:1282208120113987634> Online' : '<:offline:1282208115214782476> Offline' }
        );

      if (serverStatus.online) {
        statusEmbed.addFields(
          { name: 'OnlinePlayers', value: `${serverStatus.players.online}人` }
        );
      }

      await sentMessage.edit({ embeds: [statusEmbed] });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
      await sentMessage.edit({ embeds: [fetchingEmbed.setDescription('<:error:1282141871539490816> エラーが発生しました。再試行してください。')] });
    }
  },
};

async function getServerStatus(ipAddress) {
  try {
    const response = await axios.get(`https://api.mcsrvstat.us/2/${encodeURIComponent(ipAddress)}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching server status');
  }
}
