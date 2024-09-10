const { EmbedBuilder, Events, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'data', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    const joinChannelId = config.joinChannelId; 
    const totalGuilds = client.guilds.cache.size;
    const serverIconUrl = guild.iconURL() || 'デフォルト画像URLをここに挿入';
    const owner = await guild.fetchOwner();
    const ownerName = owner.user.tag;
    const ownerMention = `<@${owner.user.id}>`;
    const serverCreationDate = guild.createdAt.toDateString();
    const serverMemberCount = guild.memberCount;

    let dmStatus = '成功';
    let embedColor = 'Green';

    try {
      const ownerEmbed = new EmbedBuilder()
        .setTitle('えむBOTの導入ありがとうございます！')
        .setDescription(`"${guild.name}" に導入されました`)
        .addFields(
          { name: '使用方法', value: 'コマンド等の説明は **`/help`** をご覧ください' },
          { name: 'お困りの点・ご提案', value: 'なにかお困りの点、ご提案が有りましたら <@ryo_001339> (ryo_001339) にDMでご相談ください' },
          { name: 'サポートサーバー', value: 'https://discord.gg/Ftz4Tcs8tR' }
        )
        .setThumbnail(serverIconUrl)
        .setFooter({ text: 'Emubot | Thanks for the introduction', iconURL: client.user.displayAvatarURL() })
        .setTimestamp()
        .setColor('Green');

      await owner.send({ embeds: [ownerEmbed] });
    } catch (error) {
      dmStatus = '失敗';
      embedColor = 'Red';
    }

    try {
      const targetChannel = client.channels.cache.get(joinChannelId);
      if (targetChannel) {
        const joinEmbed = new EmbedBuilder()
          .setTitle(`${guild.name} に参加しました！`)
          .setDescription(`現在 ${totalGuilds} サーバーに導入されています`)
          .addFields(
            { name: '鯖主', value: `${ownerMention}\nユーザー名: ${ownerName}\nID: ${owner.user.id}` },
            { name: 'サーバー人数', value: `${serverMemberCount} 人` },
            { name: 'サーバー作成日', value: serverCreationDate },
            { name: 'DM送信ステータス', value: dmStatus }
          )
          .setThumbnail(serverIconUrl)
          .setFooter({ text: 'Emubot | join', iconURL: client.user.displayAvatarURL() })
          .setTimestamp()
          .setColor(embedColor);

        await targetChannel.send({ embeds: [joinEmbed] });
      }
    } catch (error) {
      console.error("参加通知エラーです:", error);
    }
  }
};
