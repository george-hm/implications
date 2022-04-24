class Lib {
    static getFormattedCurrencyFBX(value, expand) {
        let currencyString = value.toString();

        const ending = '💸FBX';
        if (expand) {
            return currencyString.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ending;
        }

        let shortValue = '';
        let cutOff = '';
        if (currencyString.length > 6) {
            shortValue = 'M';
            cutOff = currencyString.slice(-6);
            currencyString = currencyString.slice(0, -6);
            if (cutOff.length === 6 && !cutOff.startsWith('0')) {
                currencyString += `.${cutOff.slice(0, 1)}`;
            }
        } else if (currencyString.length > 3) {
            shortValue = 'K';
            cutOff = currencyString.slice(-3);
            currencyString = currencyString.slice(0, -3);
            if (cutOff.length === 3 && !cutOff.startsWith('0')) {
                currencyString += `.${cutOff.slice(0, 1)}`;
            }
        }

        return `${currencyString}${shortValue}💸FBX`;
    }
}

module.exports = Lib;
