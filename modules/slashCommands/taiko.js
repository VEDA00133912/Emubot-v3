const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError'); 
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taiko')
    .setDescription('太鼓の達人の曲をランダムに選択します。')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('選曲オプションを選択します。')
        .setRequired(true)
        .addChoices(
          { name: '全曲', value: 'all' },
          { name: '★10', value: 'level10' },
        ))
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('選択する曲の数を指定します。')
        .setRequired(true)),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;
    
    await interaction.deferReply(); 

    const option = interaction.options.getString('action');
    const count = interaction.options.getInteger('count');
    const dataFilePath = path.join(__dirname, '..', '..', 'data', 'random', 'taiko', `${option}.txt`);

    if (count < 1 || count > 20) {
      return interaction.editReply('曲数は1から20の間で指定してください。');
    }

    try {
      const songList = fs.readFileSync(dataFilePath, 'utf8')
        .split('\n')
        .map(song => song.trim())
        .filter(song => song !== '');

      if (songList.length === 0) {
        return interaction.editReply('指定されたオプションに対応する曲が見つかりませんでした。');
      }

      const selectedSongs = [];
      while (selectedSongs.length < count) {
        const randomSong = songList[Math.floor(Math.random() * songList.length)];
        if (!selectedSongs.includes(randomSong)) {
          selectedSongs.push(randomSong);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`ランダム選曲の結果 (${selectedSongs.length} 曲)`)
        .setDescription(selectedSongs.join('\n'))
        .setTimestamp()
        .setFooter({ text: 'Emubot | taiko', iconURL: interaction.client.user.displayAvatarURL() })
        .setColor('#ff7c04');

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  },
};
