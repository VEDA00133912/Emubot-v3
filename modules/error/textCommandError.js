const { EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require('../../data/config.json');

module.exports = async function handleTextCommandError(client, message, error, fileName) {
    try {
        await message.channel.send('<:error:1282141871539490816> エラーが発生しました');

        const FileName = path.basename(fileName);

        const errorEmbed = new EmbedBuilder()
            .setTitle('Text Command Error')
            .setColor('Red')
            .setDescription(`${FileName}テキストコマンドの実行中にエラーが発生しました。`)
            .addFields(
                { name: 'Error', value: `\`\`\`${error.message}\`\`\`` },
                { name: 'command', value: FileName, inline: true },
                { name: 'server', value: message.guild.name, inline: true },
                { name: 'channel', value: message.channel.name, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Emubot`, iconURL: client.user.displayAvatarURL() });

        const errorChannelId = config.errorLogChannelId;
        const errorChannel = client.channels.cache.get(errorChannelId);

        if (errorChannel) {
            await errorChannel.send({ embeds: [errorEmbed] });
        } else {
            console.error('エラーログチャンネルが見つかりません。');
        }

        console.error(`[${message.content}] テキストコマンド実行中にエラーが発生しました:`, error);
    } catch (followUpError) {
        console.error('エラーハンドリングの実行中にエラーが発生しました:', followUpError);
    }
};
