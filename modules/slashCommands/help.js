const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const buttonPages = require("../events/pagination");
const cooldown = require('../events/cooldown');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('ヘルプを表示します。'),

    async execute(interaction) {
        const commandName = this.data.name;
        const isCooldown = cooldown(commandName, interaction);
        if (isCooldown) return;

        const commands = await interaction.client.application.commands.fetch();
        const commandMap = new Map(commands.map(cmd => [cmd.name, cmd.id]));

        const embed1 = new EmbedBuilder()
            .setColor('#f8b4cb')
            .setTimestamp()
            .setDescription('**えむbot｜help**')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .addFields(
              { name: 'えむbotについて', value: '暇な音ゲーマーの作ってる多機能botです' },
              { name: 'helpの操作方法', value: 'ボタンを押すことでコマンド一覧等が見れます' },
              { name: 'Make it a Quote機能', value: 'メッセージの返信のときにBOTをメンションするとMake it a Quote画像を生成します' },
              { name: 'サイト', value: 'htpps://emubot.glitch.me'}
              { name: 'サポート等', value: '<:twitter:1282701797353459799> [twitter](https://twitter.com/ryo_001339)  <:discord:1282701795000320082> [Discord](https://discord.gg/j2gM7d2Drp)  <:github:1282850416085827584> [Github](https://github.com/VEDA00133912/Emubot-v3)' },
              { name: '制作者', value: '<@1095869643106828289> (ryo_001339)' }
            );

        const getCommandField = (name, description) => {
            const commandId = commandMap.get(name);
            return { name: `</${name}:${commandId}>`, value: description };
        };

        const embed2 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 1]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('help', 'helpメッセージを表示するコマンド'),
                getCommandField('spoofing', '他ユーザーに自由になりすましできるコマンド(画像添付可能)'),
                getCommandField('taiko', '太鼓の達人ランダム選曲コマンド(全曲、★10)'),
                getCommandField('prsk', 'プロセカランダム選曲コマンド(MASTER、APPEND)'),
                getCommandField('chunithm', 'CHUNITHMランダム選曲コマンド(全曲、ORIGINAL、WE&ULTIMA)'),
                getCommandField('maimai', 'maimaiランダム選曲コマンド(全曲、maimaiフォルダ、宴譜面)')
            )
            .setTimestamp()
            .setColor('#f8b4cb');

        const embed3 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 2]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('5000choyen', '5000兆円欲しい！画像生成コマンド'),
                getCommandField('omikuji', 'おみくじを引けるコマンド'),
                getCommandField('serverinfo', 'サーバー情報の表示コマンド'),
                getCommandField('userinfo', 'ユーザー情報表示コマンド'),
                getCommandField('totsu-shi', '突然の死ジェネレーターコマンド'),
                getCommandField('timer', 'タイマーコマンド')
            )
            .setTimestamp()
            .setColor('#f8b4cb');

              const embed4 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 3]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('rolecreate', 'ロールの作成コマンド(色指定可能)'),
                getCommandField('qr', 'URLをQRコードに変換するコマンド'),
                getCommandField('icon', '指定したユーザーのアイコン画像を表示するコマンド'),
                getCommandField('fakenitro', '偽Nitroを生成するコマンド(gift形式、プロモ形式)'),
                getCommandField('faketoken', '偽Tokenを生成するコマンド'),
                getCommandField('convert', 'メッセージを変換するコマンド\n(ルーン文字、フェニキア文字、ヒエログリフ、逆読み、アナグラム、メンヘラ文、怪しい日本語)')
            )
            .setTimestamp()
            .setColor('#f8b4cb');
                          
            const embed5 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 4]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('delete', 'メッセージ削除コマンド(ユーザー指定可能)'),
                getCommandField('dot', 'ドット絵変換コマンド'),
                getCommandField('dice', 'サイコロを振るコマンド'),
                getCommandField('search-gif', 'GIFを検索するコマンド'),
                { name: `</info ip:1282491239970635827>`, value: 'IPアドレスの情報を表示するコマンド' },
                { name: `</info whois:1282491239970635827>`, value: 'whois情報を表示するコマンド' } 
            )
            .setTimestamp()
            .setColor('#f8b4cb');

              const embed6 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 5]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('shorturl', 'URL短縮コマンド'),
                getCommandField('rate', 'USD/JPY、EUR/JPY、日経平均株価を表示できるコマンド'),
                getCommandField('prsk-stamp', 'プロセカのスタンプをランダムに送信するコマンド'),
                getCommandField('ping', 'BOTのping値を表示するコマンド'),
                getCommandField('prime', '素数判定を行うコマンド'),
                getCommandField('kongyo', 'コンギョの動画を送信するコマンド')
            )
            .setTimestamp()
            .setColor('#f8b4cb');

              const embed7 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 6]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('bancount', 'サーバーのBANユーザー数を表示するコマンド'),
                getCommandField('image-to-link', '画像をリンクへ変換するコマンド'),
                getCommandField('minecraft-status', 'マイクラサーバーIPのステータスを調べるコマンド'),
                getCommandField('translate', 'Google翻訳コマンド(日本語→英語、韓国語、中国語、ロシア語)'),
                getCommandField('yahoonews', 'yahooニュースリンクを取得するコマンド'),
                getCommandField('expand-settings', 'メッセージリンクの自動展開のオンオフを設定するコマンド')
            )
            .setTimestamp()
            .setColor('#f8b4cb');
      
            const embed8 = new EmbedBuilder()
            .setDescription('**えむbot | help [コマンド一覧 7]**')
            .setFooter({ text: 'Emubot | help', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                getCommandField('ticket', 'チケットコマンド(プライベートチャンネルの作成)'),
                getCommandField('remove-bg', '画像の背景透過コマンド'),
                getCommandField('url-viruscheck', 'URLの危険性を判断するコマンド'),
                getCommandField('google', 'Google検索コマンド'),
                getCommandField('random', 'ランダムな英数字の文字列生成コマンド(パスワード等)')
            )
            .setTimestamp()
            .setColor('#f8b4cb');
                    
            const pages = [embed1, embed2, embed3, embed4, embed5, embed6, embed7, embed8];
            await buttonPages(interaction, pages);
    },
};
