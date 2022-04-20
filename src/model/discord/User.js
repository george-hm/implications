const fs = require('fs');
const allUserData = require('../../users.json');
const time = require('../../time.js');

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
        this._currency = 0;
        this.lastDailyCheckin = 0;
        this.lastHourlyCheckin = 0;
        this.dailyStreak = 0;
        this.hourlyStreak = 0;
    }

    static save() {
        allUserData[this.getUserId()] = this.getUserDataObject();
        fs.writeFileSync('./users.json', JSON.stringify(allUserData, null, 2));
    }

    save() {
        return User.save();
    }

    static loadUserInfo(rawUser) {
        const builtUser = new User(rawUser);
        const userData = allUserData[builtUser.getUserId()];
        if (!userData) {
            User.save();
        }

        builtUser._currency = userData.currency;
        builtUser.lastDailyCheckin = userData.lastDailyCheckin;
        builtUser.lastHourlyCheckin = userData.lastHourlyCheckin;
        builtUser.dailyStreak = userData.dailyStreak;
        builtUser.hourlyStreak = userData.hourlyStreak;

        return builtUser;
    }

    getUserDataObject() {
        return {
            currency: this._currency,
            lastDailyCheckin: this.lastDailyCheckin,
            lastHourlyCheckin: this.lastHourlyCheckin,
            dailyStreak: this.dailyStreak,
            hourlyStreak: this.hourlyStreak,
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

        this._currency += reward;

        return reward;
    }

    get currency() {
        return this._currency;
    }

    addCurrency(amount) {
        this._currency += amount;
        return this;
    }

    removeCurrency(amount) {
        this._currency -= amount;
        if (this._currency < 0) {
            this._currency = 0;
        }
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
        this._hourlyStreak = time.hourlyStreakIsValid(this._hourlyStreak, this._lastHourlyCheckin) ?
            this._hourlyStreak : 0;
        const rewardValue = this._grantReward(
            User.HourlyReward,
            streakModifier,
            this._hourlyStreak,
        );
        this._hourlyStreak++;
        return rewardValue;
    }

    grantDailyReward() {
        const streakModifier = 18;
        this.dailyStreak = time.dailyStreakIsValid(this.dailyStreak, this.lastDailyCheckin) ?
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
