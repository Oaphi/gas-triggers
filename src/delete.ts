type DeleteOptions = ErrLoggable<
    {
        source?: TriggerType;
    } & Partial<TriggerInfo>
>;

type SearchDeleteOptions = ErrLoggable<{
    email?: string;
    onDelete?: (email?: string) => unknown;
}>;

type DeleteAllOptions = ErrLoggable<{}>;

/**
 * @summary deletes tracked trigger
 */
const deleteTracked = ({
    source = "project",
    onError = console.warn,
    ...triggerInfo
}: DeleteOptions = {}) => {
    try {
        const triggers = <GoogleAppsScript.Script.Trigger[]>listTriggers({
            onError,
            type: source,
            safe: false,
        });

        if (!triggers.length) return true;

        const filter = makeTriggerFilter_(triggerInfo);
        const trigger = triggers.find(filter);

        if (!trigger) return false;

        const status = untrackTrigger({ trigger, onError });

        if (!status) return false;

        ScriptApp.deleteTrigger(trigger);
        ScriptApp.invalidateAuth();
        return true;
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary deletes all tracked triggers
 */
const deleteAllTracked = ({
    onError = (err) => console.warn(err),
}: DeleteAllOptions = {}) => {
    try {
        const triggerInfo = listTrackedTriggers();
        return triggerInfo.every(({ id }) => deleteTracked({ onError, id }));
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary deletes all tracked triggers on match
 */
const deleteAllIf = ({
    email,
    onError = (err) => console.warn(err),
    onDelete = () => void 0,
}: SearchDeleteOptions) => {
    try {
        const del = email && Session.getEffectiveUser().getEmail() === email;

        if (!del) return;

        const trgs = ScriptApp.getProjectTriggers();
        trgs.forEach((trigger) => ScriptApp.deleteTrigger(trigger));

        return onDelete(email);
    } catch (error) {
        return onError(error);
    }
};

Object.assign(this, {
    deleteTracked,
    deleteAllTracked,
    deleteAllIf,
});
