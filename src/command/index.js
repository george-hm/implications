const Command = require('./Command.js');
const Blackjack = require('./Blackjack.js');
const DailyCheckIn = require('./DailyCheckIn.js');
const HourlyCheckIn = require('./HourlyCheckIn.js');
const Balance = require('./Balance.js');
const Flip = require('./Flip.js');

const mapping = {
    [Blackjack.commandName]: Blackjack,
    [DailyCheckIn.commandName]: DailyCheckIn,
    [HourlyCheckIn.commandName]: HourlyCheckIn,
    [Balance.commandName]: Balance,
    [Flip.commandName]: Flip,
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
