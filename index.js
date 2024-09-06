const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
client.contextMenuCommands = new Collection();

const commandFiles = fs.readdirSync('./modules/slashCommands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./modules/slashCommands/${file}`);
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./modules/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./modules/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

const textCommandFiles = fs.readdirSync('./modules/textCommands').filter(file => file.endsWith('.js'));
for (const file of textCommandFiles) {
    const textCommand = require(`./modules/textCommands/${file}`);
    client.on(textCommand.name, (...args) => textCommand.execute(...args, client));
}

client.login(process.env.TOKEN);
