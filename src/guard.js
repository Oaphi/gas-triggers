/**
 * @summary wraps around the triggered function to enable cross-user deletion and disable/enable behaviour
 * @param {GoogleAppsScript.Events.AppsScriptEvent} eventObject 
 * @param {function (GoogleAppsScript.Events.AppsScriptEvent) : any} callback 
 */
const guardTracked = (eventObject, callback) => {

    const { name } = callback;

    const { id, enabled, deleted } = getTrackedTriggerInfo({ funcName: name });

    if (!enabled) { return; }

    if(deleted) {

       const status = deleteTracked({ id });

       console.log(`Deleted: ${status}`);

    }

    return callback(eventObject);
};

/**
 * @summary disables tracked trigger
 * @param {{
 *  funcName : string,
 *  onError? : (err : Error) => void
 * }}
 * @returns {boolean}
 */
const disableTracked = ({
    funcName,
    type,
    onError = (err) => console.warn(err)
}) => {
    try {

        const info = getTrackedTriggerInfo({ funcName, type });

        if (!info) { return false; }

        const { enabled, ...rest } = info;

        if (!enabled) { return true; }

        const record = infoToRecord_({ ...rest, enabled: false });

        const { id } = info;

        return updateTrackedTriggerInfo({ id, record, onError });

    }
    catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary enables tracked trigger
 * @param {{
 *  funcName : string,
 *  onError? : (err : Error) => void
 * }}
 * @returns {boolean}
 */
const enableTracked = ({
    funcName,
    type,
    onError = (err) => console.warn(err)
}) => {

    try {

        const info = getTrackedTriggerInfo({ funcName, type });

        if (!info) { return false; }

        const { enabled, ...rest } = info;

        if (enabled) { return true; }

        const record = infoToRecord_({ ...rest, enabled: true });

        const { id } = info;

        return updateTrackedTriggerInfo({ id, record, onError });

    } catch (error) {
        onError(error);
        return false;
    }

};