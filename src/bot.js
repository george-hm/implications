const { Client, Intents } = require('discord.js');
const Interaction = require('./model/discord/Interaction.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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
