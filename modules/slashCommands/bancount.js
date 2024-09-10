const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bancount')
        .setDescription('BANされているユーザーのカウント'),

    async execute(interaction) {
        try {
            const commandName = this.data.name;
            const isCooldown = cooldown(commandName, interaction);
            if (isCooldown) return;
            
　　　　　　await interaction.deferReply();

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.editReply({ content: 'botにBAN権限がないため、実行できません', ephemeral: true });
            }

            const bannedUsers = await interaction.guild.bans.fetch();
            const bannedUsersCount = bannedUsers.size;

            const embed = new EmbedBuilder()
                .setColor('#f8b4cb')
                .setTitle('<:dnd:1282208118486601778> Banned Users')
                .setTimestamp()
                .setFooter({ text: 'Emubot | bancount', iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`このサーバーのBANユーザー数: ${bannedUsersCount}`);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            slashCommandError(interaction.client, interaction, error);
        }
    },
};
