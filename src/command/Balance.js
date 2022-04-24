const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Time = require('../time.js');
const Embed = require('../model/discord/Embed.js');

class Balance extends Command {
    async main() {
        const { user } = this;

        const retValue = [
            '**Current Balance:**',
            user.getFormattedCurrency(true),
            '',
            '**Game Stats**',
            `**Blackjack Wins:** ${user.blackjackWins}`,
            '',
            '**Streak Stats**',
            `**Hourly Streak:** ${user.hourlyStreak} (*${Time.timeUntilHourly(user.lastHourlyCheckIn)}*)`,
            `**Daily Streak:** ${user.dailyStreak}   (*${Time.timeUntilDaily(user.lastDailyCheckIn)}*)`,
        ].join('\n');
        const embed = new Embed(
            `${user.getName()} Stats`,
            retValue,
            null,
            null,
            user.getAvatarURL(),
        );

        return new InteractionResponse(
            null,
            embed,
            null,
        );
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Get your FBX balance and game stats')
            .toJSON();
    }

    static get commandName() {
        return 'balance';
    }
}

module.exports = Balance;
