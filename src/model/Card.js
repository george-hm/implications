const SUITES = ['clubs', 'diamonds', 'hearts', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class Card {
    constructor(suite, rank) {
        this.suite = suite;
        this.rank = rank;
        this.value = Number.parseInt(rank) || 10;
    }

    getSuiteArt() {
        switch (this.suite) {
            case 'clubs':
                return '♣';
            case 'diamonds':
                return '♦';
            case 'hearts':
                return '♥';
            case 'spades':
                return '♠';
            default:
                return '?';
        }
    }

    getSummary() {
        return `\`${this.rank}${this.getSuiteArt()}\``;
    }

    getValue() {
        return this.value;
    }

    static emptySummary() {
        return '\`??\`';
    }

    static getRandomDeck() {
        const cards = [];
        SUITES.forEach(suite => {
            RANKS.forEach(rank => {
                cards.push(new Card(suite, rank));
            });
        });
        const shuffledDeck = [];
        while (cards.length > 0) {
            const index = Math.floor(Math.random() * cards.length);
            shuffledDeck.push(cards[index]);
            cards.splice(index, 1);
        }
        return shuffledDeck;
    }

    static getTotalValue(cards) {
        const total = cards.reduce((acc, card) => acc + card.value, 0);
        const includesAce = cards.some(card => card.rank === 'A');
        if (includesAce && total > 21) {
            return total - 9;
        }
        return total;
    }
}

module.exports = Card;
