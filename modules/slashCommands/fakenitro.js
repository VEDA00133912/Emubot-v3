const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fakenitro')
        .setDescription('フェイクのNitroリンクの生成')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('リンクの種類を選択')
                .setRequired(true)
                .addChoices(
                    { name: 'Nitroギフト形式', value: 'nitro' },
                    { name: 'プロモNitro形式', value: 'promo' }))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('生成する数')
                .setRequired(true)),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        try {
            await interaction.deferReply();

            const quantity = interaction.options.getInteger('count');
            if (quantity > 10) {
                return interaction.editReply('生成する数は10以下にしてください');
            }

            const type = interaction.options.getString('type');
            const nitroLinks = generateNitroLinks(quantity, type);

            const embed = new EmbedBuilder()
                .setColor('#f47fff')
                .setTimestamp()
                .setFooter({ text: 'Emubot | fake nitro', iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`<a:boost:1282164483665428541> **Fake ${type === 'nitro' ? 'Nitro Gift' : 'Promo Nitro'} Links** <a:boost:1282164483665428541>\n${type === 'nitro' ? 'Nitroギフトリンク' : 'プロモNitroリンク'}\n${nitroLinks.join('\n')}`);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
        slashCommandError(interaction.client, interaction, error);
        }
    },
};

function generateNitroLinks(quantity, type) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nitroLinks = [];

    for (let j = 0; j < quantity; j++) {
        let code = Array.from({ length: type === 'nitro' ? 16 : 24 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');

        if (type === 'promo') {
            code = code.match(/.{1,4}/g).join('-');
        }

        const baseUrl = type === 'nitro' ? 'https://discord.gift/' : 'https://discord.com/billing/promotions/';
        nitroLinks.push(`${baseUrl}${code}`);
    }
    return nitroLinks;
}
