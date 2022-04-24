const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Time = require('../time.js');
const lib = require('../lib.js');

class DailyCheckIn extends Command {
    async main() {
        const { user } = this;
        const { lastDailyCheckIn } = user;
        if (!Time.eligableForDaily(lastDailyCheckIn)) {
            const timeUntilDaily = Time.timeUntilDaily(lastDailyCheckIn);
            return new InteractionResponse(
                `Sorry, daily check-in available in **${timeUntilDaily}**\nStreak: **${user.dailyStreak}**`,
            );
        }

        const rewardValue = user.grantDailyReward();
        user.lastDailyCheckIn = Time.getTime();
        await user.save();

        return new InteractionResponse(
            `${lib.getFormattedCurrencyFBX(rewardValue, true)} credited, holy\nStreak: **${user.dailyStreak}**`,
        );
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Do your daily check-in and earn currency (24 hour cooldown)')
            .toJSON();
    }

    static get commandName() {
        return 'daily';
    }
}

module.exports = DailyCheckIn;
