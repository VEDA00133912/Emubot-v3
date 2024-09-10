const { EmbedBuilder, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'data', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

module.exports = {
  name: Events.GuildDelete,
  async execute(guild, client) {
    const joinChannelId = config.joinChannelId;
    const totalGuilds = client.guilds.cache.size; 

    try {
      const targetChannel = client.channels.cache.get(joinChannelId);
      if (targetChannel) {
        const leaveEmbed = new EmbedBuilder()
          .setTitle(`${guild.name} を脱退しました`)
          .setDescription(`現在 ${totalGuilds} サーバーに導入されています`)
          .setThumbnail(client.user.displayAvatarURL)
          .setFooter({ text: 'Emubot | leave', iconURL: client.user.displayAvatarURL() })
          .setTimestamp()
          .setColor('Red');

        await targetChannel.send({ embeds: [leaveEmbed] });
      }
    } catch (error) {
      console.error("脱退通知エラーです:", error);
    }
  }
};
