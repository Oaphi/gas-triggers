/**
 * @summary deletes tracked trigger
 * @param {{
 *  source?  : "project" | "user",
 *  onError? : (err : Error) => void
 * } & TriggerInfo}
 */
const deleteTracked = ({
    source = "project",
    onError = console.warn,
    ...triggerInfo
} = {}) => {
    try {

        /** @type {GoogleAppsScript.Script.Trigger[]} */
        const triggers = listTriggers({
            onError,
            type: source,
            safe: false
        });

        if(!triggers.length) { return true; }

        const filter = makeTriggerFilter_(triggerInfo);
        const trigger = triggers.find(filter);

        if (!trigger) { return false; }

        const status = untrackTrigger({ trigger, onError });

        if (!status) { return false; }

        ScriptApp.deleteTrigger(trigger);
        return true;

    }
    catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary deletes all tracked triggers
 * @param {{
 *  onError? : (err : Error) => void
 * }}
 */
const deleteAllTracked = ({
    onError = (err) => console.warn(err)
} = {}) => {
    try {
        const triggerInfo = listTrackedTriggers();
        return triggerInfo.reduce((acc,{ id }) => acc && deleteTracked({ onError, id }), true);
    }
    catch(error) {
        onError(error);
        return false;
    }
};