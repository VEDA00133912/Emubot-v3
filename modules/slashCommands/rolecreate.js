const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const slashCommandError = require('../error/slashCommandError'); 
const cooldown = require('../events/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolecreate')
    .setDescription('新しいロールを作成します。')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('作成するロールの名前')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('作成するロールの色（カラーコードで指定）')
        .setRequired(false)
    ),

  async execute(interaction) {
    const commandName = this.data.name;
    const isCooldown = cooldown(commandName, interaction);
    if (isCooldown) return;

    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({ content: 'あなたにロールを管理する権限がありません。', ephemeral: true });
      }
      if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({ content: 'botにロールを管理する権限がありません。', ephemeral: true });
      }

      const name = interaction.options.getString('name');
      const color = interaction.options.getString('color');
      const roleCount = interaction.guild.roles.cache.size;

      if (roleCount >= 250) {
        return interaction.reply({ content: 'ロールの作成上限のため、実行できませんでした。', ephemeral: true });
      }

      const creatingEmbed = new EmbedBuilder()
        .setColor('#f8b4cb')
        .setTitle('ロール作成中...')
        .setDescription(`<a:loading:1259148838929961012> ロール **\`${name}\`**を作成しています...`)
        .setFooter({ text: 'Emubot | role creating...', iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.reply({ embeds: [creatingEmbed], ephemeral: true });

      let roleColor = color ? color.toUpperCase() : null;

      const createdRole = await interaction.guild.roles.create({
        name: name,
        color: roleColor, 
      });

      const completeEmbed = new EmbedBuilder()
        .setColor(roleColor || '#99AAB5') 
        .setTitle('<:check:1282141869387550741> 作成完了!')
        .setTimestamp()
        .setFooter({ text: 'Emubot | role create', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription(`作成したロール: <@&${createdRole.id}>`);

      await interaction.editReply({ embeds: [completeEmbed] });

    } catch (error) {
      slashCommandError(interaction.client, interaction, error);
    }
  },
};
