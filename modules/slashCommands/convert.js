const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const { generate: generateGenhera } = require('genhera');
const { generate: generateCjp } = require('cjp');
const conversionData = require(path.join(__dirname, '..', '..', 'data', 'convert.json'));
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('文字列を指定形式に変換します。')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('変換タイプを選択します。')
        .setRequired(true)
        .addChoices(
          { name: 'ルーン文字', value: 'rune' },
          { name: 'フェニキア文字', value: 'phoenicia' },
          { name: 'ヒエログリフ', value: 'hieroglyphs' },
          { name: '逆読み', value: 'reverse' },
          { name: 'アナグラム', value: 'anagram' },
          { name: 'ﾒﾝﾍﾗ文生成', value: 'genhera' },
          { name: '怪しい日本語生成', value: 'cjp' },
        ))
    .addStringOption(option =>
      option.setName('text')
        .setDescription('変換するテキストを入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const type = interaction.options.getString('type');
      const text = interaction.options.getString('text');

      const invalidReason = getInvalidReason(text);
      if (invalidReason) {
        await interaction.reply({ content: invalidReason, ephemeral: true });
        return;
      }

      await interaction.deferReply();

      const convertedText = convertText(type, text);

      const embed = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTitle('変換完了！')
        .setDescription(`\`\`\`${convertedText}\`\`\``)
        .setTimestamp()
        .setFooter({ text: `Emubot | convert ${type}`, iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
       slashCommandError(interaction.client, interaction, error);
    }
  },
};

function getInvalidReason(text) {
  const prohibitedPatterns = [
    { regex: /^<@!?(\d+)>$/, message: 'メンションが含まれているため、変換できません。' }, 
    { regex: /^<@&(\d+)>$/, message: 'ロールメンションが含まれているため、変換できません。' }, 
    { regex: /(https?:\/\/)?(www\.)?(discord\.(gg|com|app\.com)\/invite\/\w+)/g, message: 'Discord招待リンクが含まれているため、変換できません。' }, // 招待リンク
    { regex: /(https?:\/\/[^\s]+)/g, message: 'リンクが含まれているため、変換できません。' }, 
    { regex: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g, message: 'トークンが含まれているため、変換できません。' }, 
    { regex: /@everyone|@here/, message: '@everyone または @here が含まれているため、変換できません。' },
  ];
  if (text.length > 400) {
    return 'テキストが400文字を超えているため、変換できません。';
  }

  for (const pattern of prohibitedPatterns) {
    if (pattern.regex.test(text)) {
      return pattern.message;
    }
  }
  return null;
}

function convertText(type, text) {
  const conversionFunctions = {
    'rune': () => convertUsingMap(text, conversionData.rune),
    'phoenicia': () => convertUsingMap(text, conversionData.phoenicia),
    'hieroglyphs': () => convertUsingMap(text, conversionData.hieroglyphs),
    'reverse': () => text.split('').reverse().join(''),
    'anagram': () => text.split('').sort(() => Math.random() - 0.5).join(''),
    'genhera': () => generateGenhera(text),
    'cjp': () => generateCjp(text),
  };

  return conversionFunctions[type] ? conversionFunctions[type]() : 'エラーが発生しました。';
}

function convertUsingMap(text, map) {
  return text.toUpperCase().split('').map(char => map[char] || char).join('');
}
