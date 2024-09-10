const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const cooldown = require('../events/cooldown');
const slashCommandError = require('../error/slashCommandError');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image-to-link')
        .setDescription('画像をリンクに変換します')
        .addAttachmentOption(option => 
            option.setName('image')
                .setDescription('リンクにしたい画像をアップロード')
                .setRequired(true)),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        const attachment = interaction.options.getAttachment('image');

        if (!attachment.contentType || !attachment.contentType.startsWith('image/')) {
            await interaction.reply({
                content: '<:error:1282141871539490816> 画像ファイルをアップロードしてください。', ephemeral: true});
            return;
        }

        const embedProcessing = new EmbedBuilder()
            .setColor('#f8b4cb')
            .setDescription('<a:loading:1259148838929961012> リンクを画像に変換します...')
            .setTimestamp();

        await interaction.reply({ embeds: [embedProcessing], ephemeral: true });

        const imagePath = path.join(__dirname, attachment.name);

        try {
            const writer = fs.createWriteStream(imagePath);
            const response = await axios.get(attachment.url, { responseType: 'stream' });
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const form = new FormData();
            form.append('files', fs.createReadStream(imagePath));

            const uploadResponse = await axios.post('https://hm-nrm.h3z.jp/uploader/work.php', form, {
                headers: {
                    ...form.getHeaders(),
                    'Accept': 'application/json'
                }
            });

            const uploadData = uploadResponse.data;
            if (uploadData.files && uploadData.files.length > 0) {
                const imageUrl = uploadData.files[0].url;

                const embed = new EmbedBuilder()
                    .setColor('#f8b4cb')
.setTitle('<:check:1282141869387550741> リンクに変換しました！')
                    .setTimestamp()
                    .setFooter({ text: 'Embot | image-to-link' })
                    .setDescription(`画像のリンク: ${imageUrl}`)
                    .setImage(imageUrl);

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            slashCommandError(interaction.client, interaction, error);
        } finally {
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
    },
};
