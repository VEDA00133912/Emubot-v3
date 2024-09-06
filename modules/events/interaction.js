const { Events } = require('discord.js');
const interactionError = require('../error/interactionError');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            try {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction, client);
            } catch (error) {
                console.error('Error handling slash command interaction:', error);
                interactionError(client, interaction, error);
            }
        }
    },
};
