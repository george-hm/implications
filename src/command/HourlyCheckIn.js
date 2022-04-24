const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Time = require('../time.js');
const lib = require('../lib.js');

class HourlyCheckIn extends Command {
    async main() {
        const { user } = this;
        const { lastHourlyCheckIn } = user;
        console.log(user);
        if (!Time.eligableForHourly(lastHourlyCheckIn)) {
            const timeUntilHourly = Time.timeUntilHourly(lastHourlyCheckIn);
            return new InteractionResponse(
                `Sorry, hourly check-in available in **${timeUntilHourly}**\nStreak: **${user.hourlyStreak}**`,
            );
        }

        const rewardValue = user.grantHourlyReward();
        user.lastHourlyCheckIn = Time.getTime();
        user.save();

        return new InteractionResponse(
            `${lib.getFormattedCurrencyFBX(rewardValue, true)} given, eh it's alright I guess\nStreak: **${user.hourlyStreak}**`,
        );
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Do your hourly check-in and earn currency (1 hour cooldown)')
            .toJSON();
    }

    static get commandName() {
        return 'hourly';
    }
}

module.exports = HourlyCheckIn;
