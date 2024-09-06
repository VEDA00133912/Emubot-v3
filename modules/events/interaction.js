const slashCommandError = require('../error/interactionError');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            try {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction, client);
            } catch (error) {
                console.error('Error handling slash command interaction:', error);
                slashCommandError(client, interaction, error);
            }
        }
    },
};
