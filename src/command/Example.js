const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');

class Example extends Command {
    async main() {
        return new InteractionResponse(
            'Example command',
        );
    }

    static get commandName() {
        return 'example';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Example command')
            .toJSON();
    }
}

module.exports = Example;
