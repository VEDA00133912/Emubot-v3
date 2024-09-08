const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('ユーザーの検索')
        .addUserOption(option => 
          option.setName('user')
          .setDescription('ユーザーIDかメンションを入力してください')
          .setRequired(true)),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        try {
            await interaction.deferReply();

            const user = interaction.options.getUser('user');
            const member = user ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;
            const avatarURL = member?.displayAvatarURL({ size: 1024 }) || user.displayAvatarURL({ size: 1024 });
            const joinedAt = member ? member.joinedAt : null;
            const daysSinceJoined = joinedAt ? Math.floor((new Date() - joinedAt) / (1000 * 60 * 60 * 24)) : null;
            const joinedAtFormatted = joinedAt ? joinedAt.toLocaleString('ja-JP') : '未参加';

            const embed = new EmbedBuilder()
                .setColor('#f8b4cb')
                .setDescription(`${user} のユーザー情報`) 
                .setThumbnail(avatarURL)
                .setFooter({ text: 'Emubot | userinfo', iconURL: interaction.client.user.displayAvatarURL() })
                .addFields(
                    { name: 'ユーザー名', value: user.tag },
                    { name: 'ユーザーID', value: `\`\`\`\n${user.id}\n\`\`\`` },
                    { name: 'アカウント作成日', value: user.createdAt ? user.createdAt.toLocaleString('ja-JP') : '不明', inline: true },
                    { name: 'サーバー参加日', value: joinedAt ? `${joinedAtFormatted} (${daysSinceJoined}日前)` : '未参加',inline: true },
                    { name: 'アカウント', value: user.bot ? 'BOT 🤖' : 'USER <:user:1254362184272707676>', inline: true }
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            slashCommandError(interaction.client, interaction, error);
        }
    },
};
