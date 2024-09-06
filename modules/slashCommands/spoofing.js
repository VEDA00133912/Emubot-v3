const { SlashCommandBuilder, PermissionsBitField, WebhookClient } = require('discord.js');
const slashCommandError = require('../error/slashCommandError');
const cooldown = require('../events/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spoofing')
    .setDescription('他のユーザーになりすましできるコマンド')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('メンションまたはユーザーIDでユーザーを指定します')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('送信するメッセージ')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('attachment')
        .setDescription('送信する画像'))
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('ニックネームを指定')),

  async execute(interaction) {
    try {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;

      await interaction.deferReply({ ephemeral: true });

      if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageWebhooks)) {
        return interaction.editReply('Webhookの管理権限がありません。');
      }

      const targetUser = interaction.options.getUser('target');
      const message = interaction.options.getString('message');
      const attachment = interaction.options.getAttachment('attachment');
      const nickname = interaction.options.getString('nickname');

      const invalidContentChecks = [
        { regex: /@everyone|@here/, error: 'メッセージに@everyoneまたは@hereを含めることはできません。' },
        { regex: /<@&\d+>|<@!\d+>|<@?\d+>/, error: 'メッセージにロールメンションまたはユーザーメンションを含めることはできません。' },
        { regex: /.{501,}/, error: 'メッセージが500文字を超えています。' },
        { regex: /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com\/invite)|discordapp\.com\/invite|dsc\.gg|imgur\.com)\/[^\s]+/, error: '招待リンクやimgurリンクを含むメッセージは送信できません。' },
        { regex: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/, error: 'メッセージにトークンを含めることはできません。' },
        { regex: /\|{4,}/, error: 'メッセージに連続するスポイラーを含めることはできません。' }
      ];

      for (const check of invalidContentChecks) {
        if (check.regex.test(message)) {
          return interaction.editReply(check.error);
        }
      }

      let webhook = (await interaction.channel.fetchWebhooks()).find(wb => wb.name === 'Spoofing Webhook');

      if (!webhook) {
        webhook = await interaction.channel.createWebhook({
          name: 'Spoofing Webhook',
          avatar: 'https://example.com/initial-avatar.png', 
          reason: 'Spoofingコマンドを実行',
        });
      }

      const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
      const displayName = nickname || (member?.nickname || targetUser.displayName);
      const avatarURL = targetUser.displayAvatarURL({ format: null, size: 1024 });

      await webhookClient.edit({ name: displayName, avatar: avatarURL });

      const options = { content: message, files: attachment ? [attachment] : [] };
      await webhookClient.send(options);

      await webhookClient.edit({ name: 'Spoofing Webhook', avatar: 'https://example.com/initial-avatar.png' });

      await interaction.editReply('メッセージを送信しました。');
    } catch (error) {
      console.error('Error creating or sending webhook:', error);
      await slashCommandError(interaction.client, interaction, error);
    }
  },
};
