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
            return new InteractionResponse(
                'You already have a blackjack game in progress',
                null,
                null,
                true,
            );
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

        if (playerWon) {
            embedToReturn.setColor('#00ff00');
            embedToReturn.setTitle('You won!');
        } else {
            embedToReturn.setColor('#ff0000');
            embedToReturn.setTitle('You lost!');
        }

        // handle updating credits here - call method on user model

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

    getResponse() {
        const game = openGames[this.user.getUserId()];
        const playerCards = `**${this.user.getName()}**: ${game.player.map(card => card.getSummary()).join(' ')}`;
        const dealerStart = game.dealer.length === 2;
        let dealerCards = `**Dealer**: ${game.dealer.slice(0, game.dealer.length - 1).map(card => card.getSummary()).join(' ')}`;
        if (dealerStart) {
            dealerCards += Card.emptySummary();
        } else {
            dealerCards += ` **${game.dealer[game.dealer.length - 1].getSummary()}**`;
        }

        const textResponse = `${playerCards}\n${dealerCards}`;

        const embedToReturn = new Embed(
            'Blackjack',
            textResponse,
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

        return new InteractionResponse(
            null,
            [embedToReturn],
            buttons,
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
