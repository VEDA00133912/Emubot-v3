const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('おみくじを引けます'),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return; 

    const userId = interaction.user.id;

    if (dailyFortunes[userId]) {
      await interaction.reply('今日のおみくじはもう引きました。また明日引いてください！');
      return;
    }

    try {
      const omikujiembed = new EmbedBuilder()
        .setDescription('<a:ID:omikuji> おみくじを引いています...')
        .setTimestamp()
        .setFooter({ text: 'Emubot | omikuji', iconURL: interaction.client.user.displayAvatarURL() })
        .setColor('#f8b4cb');
      
      await interaction.reply({ embeds: [omikujiembed] });

      let result = '';
      do {
        const random = Math.random();
        if (random < 0.01) { 
          result = specialFortune;
        } else {
          result = fortunes[Math.floor(Math.random() * fortunes.length)];
        }
      } while (dailyFortunes[userId]?.result === result); 

      dailyFortunes[userId] = { result };
      saveFortunes();

      const thumbnailPath = path.join(__dirname, '../../data/assets/omikuji.png');
      const specialThumbnailPath = path.join(__dirname, '../../data/assets/special.png');

      const embed = new EmbedBuilder()
        .setTitle('おみくじ結果')
        .setDescription(`今日の<@${userId}>は **${result}** だよ！\nまた明日引いてね！`)
        .setTimestamp()
        .setFooter({ text: 'Emubot | omikuji', iconURL: interaction.client.user.displayAvatarURL() })
        .setThumbnail(`attachment://${result === specialFortune ? 'special.png' : 'omikuji.png'}`)
        .setColor('#f8b4cb');

      await interaction.editReply({
        embeds: [embed],
        files: [{
          attachment: result === specialFortune ? specialThumbnailPath : thumbnailPath,
          name: result === specialFortune ? 'special.png' : 'omikuji.png'
        }]
      });
    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  }
};

const fortuneFilePath = path.join(__dirname, '../../data/omikuji.json');

const fortunes = ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"];
const specialFortune = "わんだほーい！";

let dailyFortunes = {};
if (fs.existsSync(fortuneFilePath)) {
  dailyFortunes = JSON.parse(fs.readFileSync(fortuneFilePath, 'utf-8'));
}

const rule = new schedule.RecurrenceRule();
rule.tz = 'Asia/Tokyo'; 
rule.hour = 21;          
rule.minute = 9;         

schedule.scheduleJob(rule, () => {
  dailyFortunes = {};   
  saveFortunes();        
});

function saveFortunes() {
  fs.writeFileSync(fortuneFilePath, JSON.stringify(dailyFortunes, null, 2), 'utf-8');
}