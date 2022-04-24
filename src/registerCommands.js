/* eslint-disable no-await-in-loop */
require('dotenv').config({ path: '../process.env' });
// eslint-disable-next-line import/extensions
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const commandList = require('./command/index.js').mapping;

const { BOT_TOKEN, APPLICATION_ID } = process.env;
// leave this null if you want to update commands globally
const GUILD_ID = process.argv[2] || null;

console.log(`Updating commands for ${GUILD_ID ? 'guild' : 'global'} ${GUILD_ID || ''}`);

const commands = Object.values(commandList).map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

const routeToUse = GUILD_ID ?
    Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID) :
    Routes.applicationCommands(APPLICATION_ID);

rest.put(routeToUse, { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
