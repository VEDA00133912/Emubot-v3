const { ActivityType } = require('discord.js');
const { resumeTimers } = require('../slashCommands/timer');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', '..', 'data', 'config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online!`);
        resumeTimers(client);

        let config;
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('Error reading config file:', error);
            return;
        }

        const nickname = config.nickname;

        if (nickname) {
            await Promise.all(client.guilds.cache.map(async guild => {
                try {
                    await guild.members.me.setNickname(nickname);
                } catch (error) {
                    console.error(`Failed to change nickname in guild: ${guild.name}`);
                }
            }));
        }
        
        client.user.setStatus('online');
        client.user.setActivity(`/help || ping: ${client.ws.ping}ms`, { type: ActivityType.Playing });

        console.log('Bot is ready and status & activity is set.');
    },
};
