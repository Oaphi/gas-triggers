type HourlyRangeOptions = {
    hour?: number;
    start?: number;
    end?: number;
};

type AtOptions = {
    at?: number | string | Date;
    atHour?: number;
    atMinute?: number;
};

type AfterTimeOptions = {
    after?: number;
    afterSeconds?: number;
    afterMinutes?: number;
};

type PeriodOptions = {
    minutely?: number;
    hourly?: number;
    days?: number;
    weeks?: number;
};

type TimeInstallerOptions = ErrLoggable<
    PeriodOptions &
        AfterTimeOptions &
        AtOptions & {
            weekDay?: GoogleAppsScript.Base.Weekday;
            timezone?: string;
        }
>;

const timedTriggerInstaller =
    ({
        after,
        afterSeconds,
        afterMinutes,
        at,
        atHour,
        atMinute,
        minutely,
        hourly,
        days,
        weeks,
        weekDay,
        timezone = Session.getScriptTimeZone(),
        onError = (err) => console.warn(err),
    }: TimeInstallerOptions) =>
    ({ callbackName }: CommonInstallOptions) => {
        try {
            const builder = ScriptApp.newTrigger(callbackName)
                .timeBased()
                .inTimezone(timezone);

            //only valid values are 1, 5, 10, 15, 30
            if (!hourly && !at && minutely) {
                const validatedMinutely = closestValue({
                    value: minutely,
                    values: [1, 5, 10, 15, 30],
                });

                builder.everyMinutes(validatedMinutely);
            }

            if (weeks) {
                builder
                    .everyWeeks(weeks)
                    .onWeekDay(weekDay || ScriptApp.WeekDay.SUNDAY);
            }

            if (days && !weeks) {
                const atDate = new Date(at || Date.now());
                builder
                    .everyDays(days)
                    .atHour(atHour !== void 0 ? atHour : atDate.getHours())
                    .nearMinute(
                        atMinute !== void 0
                            ? atMinute || 1
                            : atDate.getMinutes() || 1
                    );
            }

            if (hourly && !at && !minutely) builder.everyHours(hourly);

            if (!hourly && !days && at && !minutely) builder.at(new Date(at));

            if (weekDay && !weeks) builder.onWeekDay(weekDay);

            if (afterMinutes || afterSeconds || after) {
                const minuteMs = (afterMinutes || 0) * 60 * 1e3;
                const secondMs = (afterSeconds || 0) * 1e3;
                builder.after(minuteMs + secondMs + (after || 0));
            }

            return builder.create();
        } catch (error) {
            onError(`failed to install clock trigger: ${error}`);
            return null;
        }
    };

/**
 * @summary checks if the trigger is in range
 */
var isInHourlyRange = ({
    hour = new Date().getHours(),
    start = 0,
    end = 23,
}: HourlyRangeOptions = {}) => {
    const validEnd = end > 23 ? 23 : end < 0 ? 0 : end;
    const validStart = start > 23 ? 23 : start < 0 ? 0 : start;
    return hour <= validEnd && hour >= validStart;
};
