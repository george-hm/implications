const { CommandInteractionOptionResolver } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const User = require('../model/discord/User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-application-command-interaction-data-structure
class Command {
    constructor(commandName, customId, options, user, values) {
        if (!(user instanceof User)) {
            throw new Error('User is not model');
        }
        this._commandName = commandName;
        if (options instanceof CommandInteractionOptionResolver) {
            this._options = options;
        }
        if (user instanceof User) {
            this._user = user;
        }
        this._customId = customId;
        this._values = values;
    }

    get values() {
        return this._values || [];
    }

    /**
     * @returns {Promise<InteractionResponse>}
     */
    async main() {
        throw new Error('Main function not implemented');
    }

    get options() {
        return this._options;
    }

    get user() {
        return this._user;
    }

    static toJSON() {
        throw new Error('Not implemented');
    }

    static createIdForCommand(commandName, user) {
        return `${commandName}.${Math.random().toString().slice(-4)}.${user.getUserId()}`;
    }

    createCustomId(name) {
        return `${this.commandName}.${name || Math.random().toString().slice(-4)}.${this.user.getUserId()}`;
    }

    get customIdValue() {
        if (!this._customId) {
            return null;
        }

        return this._customId.split('.')[1];
    }

    validateCustomIdBelongsToUser() {
        if (!this._customId) {
            return false;
        }

        const parts = this._customId.split('.');
        const userId = parts.pop();

        return userId === this._user.getUserId();
    }

    get commandName() {
        return this._commandName;
    }

    static get commandName() {
        throw new Error('Not implemented');
    }
}

module.exports = Command;
