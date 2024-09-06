const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const slashCommandError = require('../error/slashCommandError');
const cooldown = require('../events/cooldown');
const fs = require('fs');
const interaction = require('../events/interaction');
const timersFilePath = './data/timers.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('指定した時間後に通知するタイマーを起動します。')
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('分を指定してください。')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('秒を指定してください。')
        .setRequired(false)),

  async execute(interaction) {
    try {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;

      const minutes = interaction.options.getInteger('minutes');
      const seconds = interaction.options.getInteger('seconds') || 0;

      if (!validateTime(minutes, seconds)) {
        return interaction.reply('時間は最大60分以内、秒は0〜59秒の範囲内にしてください。');
      }

      const totalSeconds = (minutes * 60) + seconds;

      await interaction.reply(`タイマーを ${minutes} 分 ${seconds} 秒で起動します。`);
      saveTimer(interaction.user.id, interaction.channel.id, totalSeconds);
      startTimer(interaction, minutes, seconds, totalSeconds);
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  },
};

function startTimer(interaction, minutes, seconds, totalSeconds) {
  setTimeout(() => {
    const embed = createTimerEmbed(minutes, seconds);
    interaction.channel.send({ content: `${interaction.user}`, embeds: [embed] });
    removeTimer(interaction.user.id);
  }, totalSeconds * 1000);
}

function createTimerEmbed(minutes, seconds) {
  return new EmbedBuilder()
    .setColor('#f8b4cb')
    .setTitle('時間になりました')
    .setTimestamp()
    .setFooter({ text: 'Emubot | timer', iconURL: interaction.client.user.displayAvatarURL() })
    .setDescription(`${minutes}分${seconds}秒が経過しました！`);
}

function validateTime(minutes, seconds) {
  return minutes >= 0 && minutes <= 60 && seconds >= 0 && seconds < 60;
}

function saveTimer(userId, channelId, totalSeconds) {
  const timers = loadTimers();
  timers[userId] = { channelId, timeLeft: totalSeconds, startTime: Date.now() };
  fs.writeFileSync(timersFilePath, JSON.stringify(timers, null, 2));
}

function removeTimer(userId) {
  const timers = loadTimers();
  delete timers[userId];
  fs.writeFileSync(timersFilePath, JSON.stringify(timers, null, 2));
}

function loadTimers() {
  if (fs.existsSync(timersFilePath)) {
    return JSON.parse(fs.readFileSync(timersFilePath, 'utf8'));
  }
  return {};
}

function resumeTimers(client) {
  const timers = loadTimers();
  Object.keys(timers).forEach(async (userId) => {
    const timer = timers[userId];
    const elapsedTime = Math.floor((Date.now() - timer.startTime) / 1000);
    const remainingTime = timer.timeLeft - elapsedTime;

    if (remainingTime > 0) {
      setTimeout(async () => {
        const channel = await client.channels.fetch(timer.channelId);
        const embed = createTimerEmbed(Math.floor(timer.timeLeft / 60), timer.timeLeft % 60);
        channel.send({ content: `<@${userId}>`, embeds: [embed] });
        removeTimer(userId);
      }, remainingTime * 1000);
    } else {
      removeTimer(userId); 
    }
  });
}

module.exports.resumeTimers = resumeTimers;
