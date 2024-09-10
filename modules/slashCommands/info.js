const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('dotenv');
const axios = require('axios');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('IPまたはWHOIS情報の表示')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ip')
                .setDescription('IP情報の表示')
                .addStringOption(option =>
                    option.setName('ip')
                        .setDescription('調べたいIP')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('whois')
                .setDescription('WHOIS情報の表示')
                .addStringOption(option =>
                    option.setName('domain')
                        .setDescription('調べたいドメイン')
                        .setRequired(true))),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        const subcommand = interaction.options.getSubcommand();
        const ip2_API = process.env.info_API;

        if (subcommand === 'ip') {
            const ip = interaction.options.getString('ip');
            await interaction.deferReply({ ephemeral: true });

            if (!isValidIP(ip)) {
                await interaction.editReply('<:error:1282141871539490816> 無効なIPアドレスです。正しい形式のIPアドレスを入力してください。');
                return;
            }

            try {
                const response = await axios.get(`https://api.ip2location.io/?key=${ip2_API}&ip=${ip}`);
                const data = response.data;

                const embed = new EmbedBuilder()
                    .setTitle(`<:check:1282141869387550741> IP Lookup for ${ip}`)
                    .addFields(
                        { name: '国', value: data.country_name || 'None', inline: true },
                        { name: '地域', value: data.region_name || 'None', inline: true },
                        { name: '都市', value: data.city_name || 'None', inline: true },
                        { name: '緯度', value: data.latitude ? data.latitude.toString() : 'None', inline: true },
                        { name: '経度', value: data.longitude ? data.longitude.toString() : 'None', inline: true },
                        { name: 'タイムゾーン', value: data.time_zone || 'None', inline: true },
                        { name: 'ASN', value: data.asn || 'None', inline: true },
                        { name: 'ISP', value: data.isp || 'None', inline: true }
                    )
                    .setColor('#f8b4cb')
                    .setTimestamp()
                    .setFooter({ text: 'Emubot | info ip', iconURL: interaction.client.user.displayAvatarURL() });

                await interaction.editReply(
                    { embeds: [embed] }
                );
            } catch (error) {
                slashCommandError(interaction.client, interaction, error);
            }

        } else if (subcommand === 'whois') {
            let domain = interaction.options.getString('domain');
            domain = cleanDomainURL(domain); 
            await interaction.deferReply({ ephemeral: true });

            try {
                const response = await axios.get(`https://api.ip2whois.com/v2?key=${ip2_API}&domain=${domain}`);
                const data = response.data;

                const embed = new EmbedBuilder()
                    .setTitle(`<:check:1282141869387550741> WHOIS Lookup for ${domain}`)
                    .addFields(
                        { name: '作成日', value: data.create_date || 'None' },
                        { name: '更新日', value: data.update_date || 'None' },
                        { name: '有効期限', value: data.expire_date || 'None' },
                        { name: '登録者名', value: data.registrant.name || 'None' },
                        { name: '登録者地域', value: data.registrant.city || 'None' },
                        { name: 'email', value: data.registrant.email || 'None' }
                    )
                    .setColor('#f8b4cb')
                    .setTimestamp()
                    .setFooter({ text: 'Emubot | WHOIS Lookup', iconURL: interaction.client.user.displayAvatarURL() });

                await interaction.editReply(
                    { embeds: [embed] }
                );
            } catch (error) {
                slashCommandError(interaction.client, interaction, error);
            }
        }
    },
};

function isValidIP(ip) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^[a-fA-F0-9:]+$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function cleanDomainURL(domain) {
    return domain.replace(/^https?:\/\//, '');
}
