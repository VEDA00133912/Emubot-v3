const { SlashCommandBuilder, PermissionsBitField, WebhookClient, ChannelType } = require('discord.js');
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

      await interaction.reply({ content: '<a:loading:1259148838929961012> メッセージ送信準備中...', ephemeral: true });

      if (interaction.channel.type === ChannelType.PublicThread || interaction.channel.type === ChannelType.PrivateThread) {
        return interaction.editReply('<:error:1282141871539490816> スレッドではこのコマンドを実行できません。');
      }

      if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageWebhooks)) {
        return interaction.editReply('<:error:1282141871539490816> botにWebhookの管理権限がありません。');
      }

      const targetUser = interaction.options.getUser('target');
      const message = interaction.options.getString('message');
      const attachment = interaction.options.getAttachment('attachment');
      const nickname = interaction.options.getString('nickname');

      const invalidContentChecks = [
        { regex: /@everyone|@here/, error: '<:error:1282141871539490816> メッセージに@everyoneまたは@hereを含めることはできません。' },
        { regex: /<@&\d+>|<@!\d+>|<@?\d+>/, error: '<:error:1282141871539490816> メッセージにロールメンションまたはユーザーメンションを含めることはできません。' },
        { regex: /.{501,}/, error: '<:error:1282141871539490816> メッセージが500文字を超えています。' },
        { regex: /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com\/invite)|discordapp\.com\/invite|dsc\.gg|imgur\.com)\/[^\s]+/, error: '<:error:1282141871539490816> 招待リンクやimgurリンクを含むメッセージは送信できません。' },
        { regex: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/, error: '<:error:1282141871539490816> メッセージにトークンを含めることはできません。' },
        { regex: /\|{4,}/, error: '<:error:1282141871539490816> メッセージに連続するスポイラーを含めることはできません。' }
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
          avatar: 'https://cdn.discordapp.com/embed/avatars/5.png', 
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

      await webhookClient.edit({ name: 'Spoofing Webhook', avatar: 'https://cdn.discordapp.com/embed/avatars/5.png' });

      await interaction.editReply('<:check:1282141869387550741> メッセージを送信しました。');
    } catch (error) {
      console.error('Error creating or sending webhook:', error);
      await slashCommandError(interaction.client, interaction, error);
    }
  },
};
