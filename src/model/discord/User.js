const fs = require('fs');
const allUserData = require('../../users.json');
const time = require('../../time.js');
const lib = require('../../lib.js');

// https://discord.com/developers/docs/resources/user#user-object
class User {
    constructor(user) {
        this._id = user.id;
        this._username = user.username;
        this._discriminator = user.discriminator;
        this._avatar = user.avatarURL({ dynamic: true });
        this._bot = user.bot;
        this._system = user.system;
        this._locale = user.locale;
        this._verified = user.verified;
        this._email = user.email;
        this._flags = user.flags;
        this._premiumType = user.premium_type;
        this._publicFlags = user.public_flags;
        this.currency = 0;
        this.lastDailyCheckIn = 0;
        this.lastHourlyCheckIn = 0;
        this.dailyStreak = 0;
        this.hourlyStreak = 0;
        this.blackjackWins = 0;
    }

    save() {
        allUserData[this.getUserId()] = this.getUserDataObject();
        fs.writeFileSync('./users.json', JSON.stringify(allUserData, null, 2));
    }

    static loadUserInfo(rawUser) {
        const builtUser = new User(rawUser);
        const userData = allUserData[builtUser.getUserId()] || {};
        if (!Object.keys(userData).length) {
            builtUser.save();
            return builtUser;
        }

        builtUser.currency = userData.currency;
        builtUser.lastDailyCheckIn = userData.lastDailyCheckIn;
        builtUser.lastHourlyCheckIn = userData.lastHourlyCheckIn;
        builtUser.dailyStreak = userData.dailyStreak;
        builtUser.hourlyStreak = userData.hourlyStreak;
        builtUser.blackjackWins = userData.blackjackWins;

        return builtUser;
    }

    getUserDataObject() {
        return {
            currency: this.currency,
            lastDailyCheckIn: this.lastDailyCheckIn,
            lastHourlyCheckIn: this.lastHourlyCheckIn,
            dailyStreak: this.dailyStreak,
            hourlyStreak: this.hourlyStreak,
            blackjackWins: this.blackjackWins,
        };
    }

    /**
     * Increases player streak
     * Add reward to currency
     * Returns reward value
     *
     * @returns {User}
     * @memberof User
     */
    _grantReward(rewardValue, streakModifier, currentStreak) {
        // reward + (streak modifier * currentStreak)
        const reward = rewardValue + Math.ceil(
            (
                (rewardValue / 100) * streakModifier
            ) * currentStreak,
        );

        this.currency += reward;

        return reward;
    }

    addCurrency(amount) {
        this.currency += amount;
        return this;
    }

    removeCurrency(amount) {
        this.currency -= amount;
        if (this.currency < 0) {
            this.currency = 0;
        }
        this.save();
        return this;
    }

    static get HourlyReward() {
        return 5000;
    }

    static get DailyReward() {
        return 25000;
    }

    grantHourlyReward() {
        const streakModifier = 33;
        this.hourlyStreak = time.hourlyStreakIsValid(this.hourlyStreak, this._lastHourlyCheckin) ?
            this.hourlyStreak : 0;
        const rewardValue = this._grantReward(
            User.HourlyReward,
            streakModifier,
            this.hourlyStreak,
        );
        this.hourlyStreak++;
        return rewardValue;
    }

    grantDailyReward() {
        const streakModifier = 18;
        this.dailyStreak = time.dailyStreakIsValid(this.dailyStreak, this.lastDailyCheckIn) ?
            this.dailyStreak : 0;
        const rewardValue = this._grantReward(
            User.DailyReward,
            streakModifier,
            this.dailyStreak,
        );
        this.dailyStreak++;
        return rewardValue;
    }

    getAvatarURL() {
        return this._avatar;
    }

    getName() {
        return `${this._username}#${this._discriminator}`;
    }

    getFormattedCurrency(expand) {
        return lib.getFormattedCurrencyFBX(this.currency, expand);
    }

    /**
     * @returns {string}
     */
    getUserId() {
        return this._id;
    }

    getMention() {
        return `<@${this._id}>`;
    }
}

module.exports = User;
