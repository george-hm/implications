const Command = require('./Command.js');
const Example = require('./Example.js');

const mapping = {
    [Example.commandName]: Example,
};

module.exports.getCommand = (commandName, customId, options, user, values) => {
    if (!commandName && !customId) {
        throw new Error('Missing commandName and customId');
    }

    if (!commandName) {
        // eslint-disable-next-line no-param-reassign
        commandName = customId.split('.').shift();
    }

    const mappedCommand = mapping[commandName];
    if (!mappedCommand || typeof mappedCommand !== 'function') {
        return null;
    }

    const commandInstance = new mappedCommand(
        commandName,
        customId,
        options,
        user,
        values,
    );
    if (!(commandInstance instanceof Command)) {
        throw new Error('Command is not instanceof command');
    }

    return commandInstance;
};

module.exports.mapping = mapping;
