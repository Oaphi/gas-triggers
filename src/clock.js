/**
 * @typedef {{
 *  at : (number|string|Date|undefined),
 *  days : (number|undefined),
 *  hourly : (number|undefined),
 *  minutely : (number|undefined),
 *  weeks : (number|undefined),
 *  weekDay : (GoogleAppsScript.Base.Weekday|undefined),
 *  timezone : string
 * }} TimedTriggerInstallConfig
 * 
 * @param {TimedTriggerInstallConfig} 
 */
const timedTriggerInstaller = ({
    at,
    minutely, hourly,
    days, weeks, weekDay,
    timezone = Session.getScriptTimeZone()
}) =>

    /**
     * @param {{
     *  callbackName : string
     * }}
     * @returns {GoogleAppsScript.Script.Trigger}
     */
    ({ callbackName }) => {

        try {

            const builder = ScriptApp.newTrigger(callbackName).timeBased();

            //only valid values are 1, 5, 10, 15, 30
            if (!hourly && !at && minutely) {

                const validatedMinutely = closestValue({
                    value: minutely,
                    values: [1, 5, 10, 15, 30]
                });

                builder.everyMinutes(validatedMinutely);
            }

            if (hourly && !at && !minutely) {
                builder.everyHours(hourly);
            }

            if (!hourly && at && !minutely) {
                builder.at(new Date(at));
            }

            if (days && !weeks) {
                const atDate = new Date(at || Date.now());
                builder.everyDays(days).atHour(atDate.getHours());
            }

            if (weekDay && !weeks) {
                builder.onWeekDay(weekDay);
            }

            if (weeks) {
                builder.everyWeeks(weeks).onWeekDay(weekDay || ScriptApp.WeekDay.SUNDAY);
            }

            builder.inTimezone(timezone);

            return builder.create();

        } catch (error) {
            console.warn(error);
        }

    };