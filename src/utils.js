/**
 * @typedef {{
 *  value : any,
 *  values : any[]
 * }} ClosestConfig
 * 
 * @summary finds closest value in the array
 * @param {ClosestConfig} [config]
 */
const closestValue = (config = {}) => {

    if (!("value" in config)) {
        return null;
    }

    const { value, values = [] } = config;

    if (!values.length) {
        return null;
    }

    let closestIndex = 0, currClosest = Math.abs(value - values[0]);

    values.forEach((val, i) => {
        const diff = Math.abs(value - val);

        if (currClosest > diff) {
            closestIndex = i;
            currClosest = diff;
        }
    });

    return values[closestIndex];
};