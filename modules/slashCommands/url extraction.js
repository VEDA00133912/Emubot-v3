const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('extracturls')
        .setDescription('テキストまたはファイルからURLを抽出します')
        .addStringOption(option => option.setName('text').setDescription('抽出するテキスト'))
        .addBooleanOption(option => option.setName('remove').setDescription('重複を削除しますか？'))
        .addBooleanOption(option => option.setName('domainonly').setDescription('ドメインのみを抽出しますか？'))
        .addAttachmentOption(option => option.setName('file').setDescription('URLを抽出するファイル')),

    async execute(interaction) {
      const commandName = this.data.name;
      const isCooldown = cooldown(commandName, interaction);
      if (isCooldown) return;
      
        const text = interaction.options.getString('text');
        const file = interaction.options.getAttachment('file');
        let urls = text ? text.match(/https?:\/\/[^\s]+/g) : [];

        if (file) {
            const fileContent = await (await fetch(file.url)).text();
            urls = urls.concat(fileContent.match(/https?:\/\/[^\s]+/g) || []);
        }

        if (urls.length) {
            if (interaction.options.getBoolean('domainonly')) urls = urls.map(url => new URL(url).origin);
            if (interaction.options.getBoolean('remove')) urls = [...new Set(urls)];

            const filePath = path.join(__dirname, 'urls.txt');
            fs.writeFileSync(filePath, urls.join('\n'), 'utf8');
            const fileUpload = new AttachmentBuilder(filePath);

            await interaction.reply({ content: "抽出完了！", files: [fileUpload], ephemeral: true });
            fs.unlinkSync(filePath);
        } else {
            slashCommandError(interaction.client, interaction, error);
        }
    }
};
