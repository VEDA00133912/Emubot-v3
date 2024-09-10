const { EmbedBuilder, Events } = require('discord.js');
const axios = require('axios');
const textCommandError = require('../error/textCommandError');

module.exports = {
    name: Events.MessageCreate, 
    async execute(message, client) {
        const mentionPattern = new RegExp(`<@!?${client.user.id}>`);

        if (!mentionPattern.test(message.content) || message.author.bot) {
            return;
        }

        try {
            const referencedMessage = message.reference
                ? await message.channel.messages.fetch(message.reference.messageId)
                : null;

            if (!referencedMessage) {
                return;
            }

            const displayName = referencedMessage.member
                ? referencedMessage.member.displayName
                : referencedMessage.author.username;
            const username = referencedMessage.author.username;
            const text = referencedMessage.content;
            const avatar = referencedMessage.author.displayAvatarURL({ format: 'png', dynamic: true });

            let color = false;
            if (message.content.toLowerCase().includes('color')) {
                color = true;
            }

            const payload = {
                username: username,
                display_name: displayName,
                text: text,
                avatar: avatar,
                color: color,
            };

            const loadingMessage = await message.channel.send('画像生成中です...<a:load:1259148838929961012>');


            const response = await axios.post('https://api.voids.top/fakequote', payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const resultImageUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setColor('#f8b4cb')
                .setTimestamp()
                .setFooter({ text:'Emubot | make it a quote', iconURL: message.client.user.displayAvatarURL() })
                .setImage(resultImageUrl);

            await loadingMessage.edit({ content: '', embeds: [embed] });
        } catch (error) {
            textCommandError(client, message, error, __filename);
        }
    },
};