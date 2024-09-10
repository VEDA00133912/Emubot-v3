const { EmbedBuilder, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const SETTINGS_FILE = path.join(__dirname, '..', '..', 'data', 'msglink.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return;

    const urls = message.content.match(/(https?:\/\/[^\s]+)/g);
    if (!urls) return;

    let settings = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      } catch (error) {
        console.error('設定ファイルの読み取りまたは解析中にエラーが発生しました:', error);
      }
    }

    const shouldExpandLinks = settings[message.guild.id] ?? true;
    if (!shouldExpandLinks) return;

    for (const url of urls) {
      if (!url.includes('discord.com/channels/')) continue;

      const [guildId, channelId, messageId] = url.split('/').slice(-3);

      try {
        const fetchedMessage = await client.guilds.cache.get(guildId)?.channels.cache.get(channelId)?.messages.fetch(messageId);
        if (!fetchedMessage) continue;

        const { content, embeds, attachments, author, createdTimestamp, guild } = fetchedMessage;
        const displayName = guild.members.cache.get(author.id)?.displayName || author.tag;

        if (!content && embeds.length) continue;

        const embed = new EmbedBuilder()
          .setColor(0xf8b4cb)
          .setTimestamp(createdTimestamp)
          .setAuthor({ name: displayName, iconURL: author.displayAvatarURL() })
          .setDescription(content || '');

        if (attachments.size) {
          const attachment = attachments.first();
          if (attachment.contentType.startsWith('image/')) {
            embed.setImage(attachment.proxyURL);
          } else if (attachment.contentType.startsWith('video/')) {
            embed.addFields({ name: 'Video', value: `[動画ファイル](${attachment.proxyURL})` });
          } else {
            embed.addFields({ name: 'File', value: `[${attachment.name}](${attachment.proxyURL})` });
          }
        }

        message.channel.send({ embeds: [embed] });

      } catch (error) {
        console.error('メッセージの取得中にエラーが発生しました:', error);
      }
    }
  }
};
