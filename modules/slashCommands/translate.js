const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cooldown = require('../events/cooldown');
const handleSlashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('日本語を他言語に翻訳します。')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('翻訳したいテキストを入力してください。')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('language')
        .setDescription('翻訳したい言語を選択してください。')
        .setRequired(true)
        .addChoices(
          { name: '英語', value: 'en' },
          { name: '中国語', value: 'zh-cn' },
          { name: '韓国語', value: 'ko' },
          { name: 'ロシア語', value: 'ru' }
        )
    ),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;
    await interaction.deferReply();

    const text = interaction.options.getString('text');
    const targetLanguage = interaction.options.getString('language');

    const invalidContentError = containsInvalidContent(text);
    if (invalidContentError) {
      return interaction.editReply({ content: invalidContentError, ephemeral: true });
    }

    try {
      const translatedText = await gasTranslate(text, 'ja', targetLanguage);

      const embed = new EmbedBuilder()
        .setDescription('**翻訳しました！**' + '\n' + '```\n' + `${translatedText}` + '\n```')
        .setTimestamp()
        .setFooter({ text: 'Emubot | translate', iconURL: interaction.client.user.displayAvatarURL() })
        .setColor('#f8b4cb');

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      handleSlashCommandError(interaction.client, interaction, error);
    }
  },
};

function containsInvalidContent(text) {
  const invalidContentChecks = [
    { regex: /<@!?(\d+)>/, error: 'メンションが含まれているため、変換を行いません。' },
    { regex: /https?:\/\/[^\s]+/, error: 'リンクを含むメッセージは送信できません。' },
    { regex: /discord(?:\.gg|\.com\/invite)\/[^\s]+/, error: '招待リンクを含むメッセージは送信できません。' },
    { regex: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/, error: 'トークンを含むメッセージは送信できません。' },
    { regex: /.{201,}/, error: 'メッセージが200文字を超えています。' }
  ];

  for (const check of invalidContentChecks) {
    if (check.regex.test(text)) {
      return check.error;
    }
  }
  return null;
}

function gasTranslate(text, source, target) {
  return axios.get('https://script.google.com/macros/s/AKfycbweJFfBqKUs5gGNnkV2xwTZtZPptI6ebEhcCU2_JvOmHwM2TCk/exec', {
    params: {
      text,
      source,
      target
    }
  }).then(response => {
    return response.data;
  }).catch(error => {
    throw error;
  });
}
