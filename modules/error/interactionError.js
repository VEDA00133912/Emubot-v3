const { EmbedBuilder } = require('discord.js');
const config = require('../../data/config.json');

module.exports = (client, interaction, error) => {
    const channelId = config.errorLogChannelId; 

    const errorEmbed = new EmbedBuilder()
        .setTitle(`Error: ${error.name}`) 
        .setColor('#FF0000')
        .setDescription('An error occurred during interaction processing.')
        .addFields(
            { name: 'Error', value: `\`\`\`${error.message}\`\`\`` },
            { name: 'Interaction Type', value: `${interaction.type}`, inline: true },
            { name: 'Interaction User', value: `${interaction.user.tag}`, inline: true },
            { name: 'Time', value: new Date().toLocaleString(), inline: true }
        )
        .setFooter({ text: `Occurred in ${interaction.guild.name}` })
        .setTimestamp()
        .setFooter({ text: `Emubot | ${interaction.commandName}`, iconURL: client.user.displayAvatarURL() });

    const errorChannel = client.channels.cache.get(channelId);
    if (errorChannel) {
        errorChannel.send({ embeds: [errorEmbed] });
    } else {
        console.error('Error channel not found.');
    }
};
