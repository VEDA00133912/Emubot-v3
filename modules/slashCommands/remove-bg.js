const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('dotenv');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
const axios = require('axios');
config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('画像の背景透過')
    .addAttachmentOption(option => option.setName('image').setDescription('背景を削除したい画像を選択').setRequired(true)),

  async execute(interaction) {
    try {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;
                
      const processingEmbed = new EmbedBuilder()
        .setDescription('<a:loading:1259148838929961012> **背景透過中...**')
        .setFooter({ text: 'Emubot | removing...', iconURL: interaction.client.user.displayAvatarURL() })
        .setColor('Yellow')
        .setTimestamp();

      await interaction.reply({ embeds: [processingEmbed] });

      const image = interaction.options.getAttachment('image');

      const errorEmbed = new EmbedBuilder()
        .setTitle('エラーが発生しました')
        .setFooter({ text: 'Emubot | remove error', iconURL: interaction.client.user.displayAvatarURL() })
        .setColor('Red')  
        .setTimestamp();

      if (!image.contentType.startsWith('image/')) {
        errorEmbed.setDescription('<:error:1282141871539490816> **画像ファイルをアップロードしてください。**');
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      if (image.contentType === 'image/webp') {
        errorEmbed.setDescription('<:error:1282141871539490816> **この画像形式 (webp) は対応していません。**\n**PNG、JPEG、またはJPGに変換してください。**');
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const apiKey = process.env.removebg_API;

      const response = await axios.post('https://api.remove.bg/v1.0/removebg',
        {
          image_url: image.proxyURL,
          size: 'auto'
        },
        {
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const buffer = Buffer.from(response.data, 'binary');
      const attachment = new AttachmentBuilder(buffer, { name: 'removebg.png' });

      const embed = new EmbedBuilder()
        .setDescription('<:check:1282141869387550741> 背景を透過しました！')
        .setColor('#f8b4cb')
        .setTimestamp()
        .setFooter({ text: 'Emubot | remove', iconURL: interaction.client.user.displayAvatarURL() })
        .setImage('attachment://removebg.png');

      await interaction.editReply({ embeds: [embed], files: [attachment] });

    } catch (error) {
        slashCommandError(interaction.client, interaction, error);
    }
  },
};
