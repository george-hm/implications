const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Embed = require('../model/discord/Embed.js');
const Component = require('../model/discord/Component.js');
const lib = require('../lib.js');

const optionAmount = 'amount';
const optionChoice = 'side';
const optionChoiceHeads = 'heads';
const optionChoiceTails = 'tails';

class Flip extends Command {
    async main() {
        if (this.user.getUserId() !== '129416238916042752' && this.user.getUserId() !== '84005689822810112' && this.user.getUserId() !== '126415597578878987') {
            return new InteractionResponse(
                'You are not authorized to use this command',
                null,
                null,
                true,
            );
        }

        if (this.getChoice()) {
            return this.play();
        }
    }

    play() {
        const betAmount = this.getGambleAmount();
        if (typeof betAmount !== 'number') {
            return new InteractionResponse(
                `Invalid bet of ${betAmount}FBX, try again`,
                null,
                null,
                true,
            );
        }

        if (betAmount > this.user.currency) {
            return new InteractionResponse(
                `You don't have enough funbux to bet ${betAmount}`,
                null,
                null,
                true,
            );
        }

        this.user.removeCurrency(betAmount);

        // check if the user has won (give the house a higher chance to win)
        const userWins = Math.random() < 0.47;
        const userChoice = this.getChoice();
        const oppositeChoice = userChoice === optionChoiceHeads ? optionChoiceTails : optionChoiceHeads;

        let response = `Coin landed on ${userWins ? userChoice : oppositeChoice}!`;
        const wonCurrency = userWins ? betAmount * (2) : 0;

        const buttons = [
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                `Play Again (${lib.getFormattedCurrencyFBX(this.user.currency)})`,
                null,
                this.createCustomId(userChoice, betAmount),
            ),
        ];

        if (userWins) {
            this.user.addCurrency(wonCurrency);
            response = `${response} You won ${lib.getFormattedCurrencyFBX(wonCurrency, true)}`;
        } else {
            response = `${response} You lost ${lib.getFormattedCurrencyFBX(betAmount, true)}\nBetter luck next time cogster`;
        }

        const embed = new Embed(
            `Flip Result: ${userWins ? userChoice : oppositeChoice}`,
            response,
            userWins ? '#00ff00' : '#ff0000',
        );
        return new InteractionResponse(
            response,
            embed,
            new Component(
                Component.TYPE_CONTAINER,
                null,
                null,
                null,
                null,
                null,
                null,
                buttons,
            ),
        );
    }

    getModifier() {
        return this._customId?.split('.')[5] || 1;
    }

    getGambleAmount() {
        return this.options?.getInteger(optionAmount) ||
            this._customId?.split('.')[3] ||
            null;
    }

    getChoice() {
        return this.options?.getString(optionChoice) ||
            this._customId?.split('.')[4] ||
            null;
    }

    createCustomId(choice, betAmount, modifier) {
        let customId = Command.createIdForCommand(
            this.commandName,
            this.user,
        );
        customId += `.${betAmount}.${choice}.${modifier}`;

        return customId;
    }

    static get commandName() {
        return 'blackjack';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Flip for a chance to double your money')
            .addIntegerOption(option => option.setName(optionAmount)
                .setDescription('How much you want to gamble')
                .setRequired(true))
            .addStringOption(option => option.setName(optionChoice)
                .setDescription('Will the coin land on heads or tails?')
                .addChoice(optionChoiceHeads, optionChoiceHeads)
                .addChoice(optionChoiceTails, optionChoiceTails)
                .setRequired(true))
            .toJSON();
    }
}

module.exports = Flip;
