const { Client, Intents } = require('discord.js');
const Interaction = require('./model/discord/Interaction.js');
const User = require('./model/discord/User.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('messageCreate', async message => {
    const { member } = message;
    // only care about messages sent in guilds
    if (!member || member.user.bot) {
        return;
    }

    const user = new User(message.member.user);
    // TODO: build triggers properly later
    const { channelId } = message;
    if (channelId !== '723977119746490379' && channelId !== '451772950404792342') {
        return;
    }

    const checks = [
        /(^|\s)(lfg|lf|looking for (someone|group))(\s|$)/i,
        /(up|down) for (hell |)gates/i,
        /(looking for|need) (2v2|1v1|2x2|1x1)/i,
    ];
    let checkMatched = false;
    for (const check of checks) {
        if (check.test(message.content)) {
            checkMatched = true;
            break;
        }
    }

    if (!checkMatched) {
        return;
    }

    const replyMessage = `${user.getMention()} to get access to **Looking for Group** channel, go to <#893560390385041408>`;
    message.reply(replyMessage);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) return;

    const event = new Interaction(interaction);
    console.log(event.getLogMessage());
    const command = event.getCommand();

    try {
        const response = await command.main();
        if ((interaction.isButton() || interaction.isSelectMenu()) && response.shouldEditMessage()) {
            await interaction.update(response.toObject());
        } else {
            await interaction.reply(response.toObject());
        }
    } catch (err) {
        if (process.env.ERROR_USER_ID) {
            const errorUser = client.users.cache.get(process.env.ERROR_USER_ID);
            errorUser.send(`Something is fucked.\nUser: ${event._user.getName()}\nPayload: \`\`\`json\n${JSON.stringify(interaction, null, 4)}\`\`\`\nError: \`\`\`json\n${err.toString()}\`\`\``);
        }
        console.log(err);
    }
});

client.login(process.env.BOT_TOKEN);
