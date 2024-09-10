const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
const { config } = require('dotenv');
const axios = require('axios');
config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('url-viruscheck')
    .setDescription('URLの危険性を判断します')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URLを入力してください')
        .setRequired(true)),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;
    
    const url = interaction.options.getString('url');
    const apiKey = process.env.VIRUSTOTAL_API;

    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('URL Check')
      .setDescription(`Checking the URL: ${url} <a:loading:1259148838929961012>`)
      .setColor('Yellow');

    await interaction.editReply({ embeds: [embed], ephemeral: true });

    try {
      const encodedUrl = Buffer.from(url).toString('base64').replace(/=/g, '');
      const { data } = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
        headers: { 'x-apikey': apiKey }
      });

      const results = Object.entries(data.data.attributes.last_analysis_results || {}).map(([engine, result]) => ({
        engine, result: result.result, category: result.category
      }));

      const detected = results.filter(r => r.result !== 'clean' && r.result !== 'unrated');
      const clean = results.filter(r => r.result === 'clean');
      const unrated = results.filter(r => r.result === 'unrated').slice(0, 5);

      let descriptionMessage = '';
      let color = 'Green'; 

      if (unrated.length === 0) {
        descriptionMessage = 'このURLは安全です <:check:1282141869387550741>';
      } else if (unrated.length <= 2) {
        descriptionMessage = '危険なURLかもしれません <:warn:1282877367110340670>';
        color = 'Yellow'; 
      } else {
        descriptionMessage = 'このURLは危険である可能性が非常に高いです <:danger:1282877371682263101>';
        color = 'Red'; 
      }

      const embedResult = new EmbedBuilder()
        .setTitle('URLチェック完了')
        .setFooter({ text: 'Emubot | url-viruscheck', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription(`診断URL: ${url}\n${descriptionMessage}`)
        .setColor(color);

      [...detected, ...clean, ...unrated].slice(0, 25).forEach(result => {
        embedResult.addFields({ name: result.engine, value: result.result || 'clean', inline: true });
      });

      await interaction.editReply({ embeds: [embedResult], ephemeral: true });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  },
};
