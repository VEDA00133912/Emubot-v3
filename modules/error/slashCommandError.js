const { EmbedBuilder } = require('discord.js');
const config = require('../../data/config.json');

module.exports = async function handleSlashCommandError(client, interaction, error) {
    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
        } else {
            await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
        }
    } catch (followUpError) {
        console.error('followupメッセージの送信に失敗しました:', followUpError);
    }

    const errorEmbed = new EmbedBuilder()
        .setTitle(`Error: ${error.name}`)
        .setColor('#FF0000')
        .setDescription(`**/${interaction.commandName}**の実行中にエラーが発生しました`)
        .addFields(
            { name: 'error', value: `\`\`\`${error.message}\`\`\`` },
            { name: 'command', value: `${interaction.commandName}`, inline: true },
            { name: 'interactionUser', value: `${interaction.user.tag}`, inline: true },
            { name: 'channel', value: `${interaction.channel.name}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Emubot | ${interaction.commandName}`, iconURL: client.user.displayAvatarURL() });

    const errorChannelId = config.errorLogChannelId;
    const errorChannel = client.channels.cache.get(errorChannelId);

    if (errorChannel) {
        await errorChannel.send({ embeds: [errorEmbed] });
    } else {
        console.error('エラーログチャンネルが見つかりません。');
    }

    console.error(`[${interaction.commandName}] コマンド実行中にエラーが発生しました:`, error);
};
