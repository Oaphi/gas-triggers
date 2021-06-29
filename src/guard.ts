type EnableOptions = ErrLoggable<Omit<TriggerInfo, "id">>;

/**
 * @summary wraps around the trigger callback to enable cross-user deletion and disabling/enabling
 */
const guardTracked = (
    eventObject: GoogleAppsScript.Events.AppsScriptEvent,
    callback: (event: GoogleAppsScript.Events.AppsScriptEvent) => any
) => {
    const { name } = callback;

    const { id, enabled, deleted } =
        getTrackedTriggerInfo({ funcName: name }) || {};

    if (deleted && id) return deleteTracked({ id });

    if (!enabled) return;

    return callback(eventObject);
};

/**
 * @summary disables tracked trigger
 */
const disableTracked = ({
    funcName,
    type,
    onError = (err) => console.warn(err),
}: EnableOptions) => {
    try {
        const info = getTrackedTriggerInfo({ funcName, type });

        if (!info) {
            return false;
        }

        const { enabled, ...rest } = info;

        if (!enabled) {
            return true;
        }

        const record = infoToRecord_({ ...rest, enabled: false });

        const { id } = info;

        return updateTrackedTriggerInfo({ id, record, onError });
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary enables tracked trigger
 */
const enableTracked = ({
    funcName,
    type,
    onError = (err) => console.warn(err),
}: EnableOptions) => {
    try {
        const info = getTrackedTriggerInfo({ funcName, type });

        if (!info) return false;

        const { enabled, ...rest } = info;

        if (enabled) return true;

        const record = infoToRecord_({ ...rest, enabled: true });

        const { id } = info;

        return updateTrackedTriggerInfo({ id, record, onError });
    } catch (error) {
        onError(error);
        return false;
    }
};

Object.assign(this, {
    guardTracked,
    disableTracked,
    enableTracked,
});
