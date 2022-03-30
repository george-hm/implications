const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Card = require('../model/Card.js');
const Embed = require('../model/discord/Embed.js');
const Component = require('../model/discord/Component.js');

const openGames = {};

const actionHit = 'hit';
const actionStand = 'stand';

class Blackjack extends Command {
    async main() {
        const { customIdValue } = this;
        if (this.user.getUserId() !== '129416238916042752' && this.user.getUserId() !== '84005689822810112') {
            return new InteractionResponse(
                'You are not authorized to use this command',
                null,
                null,
                true,
            );
        }
        if (!openGames[this.user.getUserId()]) {
            return this.start();
        }

        if (customIdValue === actionHit) {
            return this.hit();
        }

        if (customIdValue === actionStand) {
            return this.stand();
        }

        return this.start();
    }

    start() {
        if (openGames[this.user.getUserId()]) {
            return this.getResponse();
        }

        openGames[this.user.getUserId()] = {
            deck: Card.getRandomDeck(),
            player: [],
            dealer: [],
        };

        openGames[this.user.getUserId()].player.push(openGames[this.user.getUserId()].deck.pop());
        openGames[this.user.getUserId()].dealer.push(openGames[this.user.getUserId()].deck.pop());
        openGames[this.user.getUserId()].player.push(openGames[this.user.getUserId()].deck.pop());
        openGames[this.user.getUserId()].dealer.push(openGames[this.user.getUserId()].deck.pop());

        const totals = this.getTotals(openGames[this.user.getUserId()]);
        if (totals.player === 21 || totals.dealer === 21) {
            return this.end();
        }

        return this.getResponse();
    }

    hit() {
        const game = openGames[this.user.getUserId()];
        game.player.push(game.deck.pop());
        const totals = this.getTotals(game);
        if (totals.player > 21) {
            return this.end();
        }

        return this.getResponse();
    }

    stand() {
        const game = openGames[this.user.getUserId()];
        const totals = this.getTotals(game);
        if (totals.player > 21) {
            return this.end();
        }

        while (totals.dealer < 17) {
            game.dealer.push(game.deck.pop());
            totals.dealer += game.dealer[game.dealer.length - 1].getValue();
        }

        return this.end();
    }

    end() {
        const game = openGames[this.user.getUserId()];
        const totals = this.getTotals(game);
        const playerTotal = totals.player;
        const dealerTotal = totals.dealer;
        const playerWon = playerTotal > 21 ? false : playerTotal > dealerTotal || dealerTotal > 21;
        const textResponse = `**${this.user.getName()}**: ${playerTotal}\n**Dealer**: ${dealerTotal}`;
        const embedToReturn = new Embed(
            'Blackjack',
            textResponse,
        );

        const buttons = [
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_PRIMARY,
                'Play again',
                null,
                this.createCustomId(actionHit),
            ),
        ];

        const container = new Component(
            Component.TYPE_CONTAINER,
        );
        container.setComponents(buttons);

        delete openGames[this.user.getUserId()];
        return new InteractionResponse(
            null,
            [embedToReturn],
            buttons,
        );
    }

    /**
     * Gets the totals represented as <player|dealer>: int
     *
     * @param {*} game the blackjack game
     */
    getTotals(game) {
        const totals = {};
        const playerTotal = game.player.reduce((total, card) => total + card.getValue(), 0);
        const dealerTotal = game.dealer.reduce((total, card) => total + card.getValue(), 0);
        totals.player = playerTotal;
        totals.dealer = dealerTotal;
        return totals;
    }

    getResponse(editMessage) {
        const game = openGames[this.user.getUserId()];
        const playerCards = game.player;
        const playerCardsString = `${playerCards.map(card => card.getSummary()).join(' ')}`;
        const dealerCards = game.dealer;
        const dealerStart = dealerCards.length === 2;
        let dealerCardsString = `${dealerCards.slice(0, dealerCards.length - 1).map(card => card.getSummary()).join(' ')}`;
        if (dealerStart) {
            // need a space for discord formatting
            dealerCardsString += ` ${Card.emptySummary()}`;
        } else {
            dealerCardsString += ` ${game.dealer[game.dealer.length - 1].getSummary()}`;
        }

        const playerTotal = Card.getTotalValue(playerCards);
        const dealerTotal = Card.getTotalValue(
            dealerStart ? dealerCards.slice(0, dealerCards.length - 1) : dealerCards,
        );

        const textResponse = `**${this.user.getName()}**: ${playerTotal}\n${playerCardsString}\n**Dealer**: ${dealerTotal}\n${dealerCardsString}`;

        const embedToReturn = new Embed(
            'Blackjack',
            textResponse,
            '#0000ff',
        );

        const buttons = [
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_PRIMARY,
                'Hit',
                null,
                this.createCustomId(actionHit),
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_DANGER,
                'Stand',
                null,
                this.createCustomId(actionStand),
            ),
        ];

        const btnContainer = new Component(
            Component.TYPE_CONTAINER,
        );
        btnContainer.setComponents(buttons);

        return new InteractionResponse(
            'Blackjack',
            [embedToReturn],
            btnContainer,
            false,
            editMessage,
        );
    }

    static get commandName() {
        return 'blackjack';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Play blackjack')
            .toJSON();
    }
}

module.exports = Blackjack;
