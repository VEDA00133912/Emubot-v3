const { EmbedBuilder } = require('discord.js');
const config = require('../../data/config.json');

module.exports = async function sendButtonErrorLog(client, interaction, error, commandName, fileName) {
    try {
        const errorEmbed = new EmbedBuilder()
            .setTitle(`Error: ${error.name}`)
            .setColor('Red')
            .setDescription(`ボタン操作中にエラーが発生しました`)
            .addFields(
                { name: 'Error', value: `\`\`\`${error.message}\`\`\`` },
                { name: 'Command', value: `${commandName || 'N/A'}`, inline: true },
                { name: 'File', value: `${fileName || 'N/A'}`, inline: true },
                { name: 'Server', value: interaction.guild ? interaction.guild.name : 'N/A', inline: true },
                { name: 'Channel', value: `${interaction.channel.name}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Emubot | Error`, iconURL: client.user.displayAvatarURL() });

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: `<:error:1282141871539490816> ボタン操作中にエラーが発生しました。`,
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `<:error:1282141871539490816> ボタン操作中にエラーが発生しました。`,
                ephemeral: true
            });
        }

        const errorChannelId = config.errorLogChannelId;
        const errorChannel = client.channels.cache.get(errorChannelId);

        if (errorChannel) {
            await errorChannel.send({ embeds: [errorEmbed] });
        } else {
            console.error('エラーログチャンネルが見つかりません。');
        }

    } catch (logError) {
        console.error('エラーログの送信に失敗しました:', logError);
    }

    console.error('ボタン操作中にエラーが発生しました:', error);
};
