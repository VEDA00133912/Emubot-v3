const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        client.user.setStatus('online');
        client.user.setActivity(`/help || ping: ${client.ws.ping}ms`, { type: ActivityType.Playing });

        console.log('Bot is ready and status/activity is set.');
    },
};
