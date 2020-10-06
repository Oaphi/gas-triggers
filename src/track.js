const infoToRecord_ = ({ funcName, type, enabled, deleted }) =>
    `${funcName}/${type}/${enabled ? "enabled" : "disabled"}/${deleted ? "deleted" : ""}`;

/**
 * @typedef {{
 *  deleted  : boolean,
 *  enabled  : boolean,
 * } & TriggerInfo} TrackedTriggerInfo
 * 
 * @param {string} record 
 * @param {string} id
 * @returns {TrackedTriggerInfo} 
 */
const recordToInfo_ = (record, id) => {
    const [funcName, type, state, deleted] = record.split("/");
    return {
        funcName,
        type,
        id,
        enabled: state === "enabled",
        deleted: deleted === "deleted"
    };
};

/**
 * @summary enables trigger tracking
 * @param {{
 *  onError? : (err : Error) => void
 * }} 
 * @returns {boolean}
 */
const trackTriggers = ({
    onAlreadyTracking = () => console.log("already tracking"),
    onError = (err) => console.warn(err),
    type = "project"
} = {}) => {

    try {

        if (isTrackingTriggers()) {
            onAlreadyTracking();
            return true;
        }

        const name = getUniquePropName_("triggers");

        const trackingList = {};

        const installedForThisUser = listTriggers({ onError, safe: true, type });

        installedForThisUser.forEach(({ id, ...info }) => trackingList[id] = infoToRecord_(info));

        return setProperty_(name, JSON.stringify(trackingList));

    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary stops tracking any trigger
 * @param {{
 *   onError? : (err : Error) => void
 * }}
 * @returns {boolean} 
 */
const untrackTriggers = ({
    onError = (err) => console.warn(err)
} = {}) => {
    try {

        const key = getTrackingPropertyName_();

        key && deleteProperty_(key);

        return true;

    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary adds a trigger to the list of tracked ones
 * @param {GoogleAppsScript.Script.Trigger} trigger 
 * @returns {GoogleAppsScript.Script.Trigger}
 */
const trackTrigger = (trigger) => {

    const key = getTrackingPropertyName_();
    const trackingList = JSON.parse(getProperty_(key, "{}"));

    const id = trigger.getUniqueId();
    const funcName = trigger.getHandlerFunction();
    const type = trigger.getEventType();

    const typeMap = new Map([
        [ScriptApp.EventType.ON_CHANGE, TriggerTypes.CHANGE],
        [ScriptApp.EventType.CLOCK, TriggerTypes.CLOCK],
        [ScriptApp.EventType.ON_EDIT, TriggerTypes.EDIT],
        [ScriptApp.EventType.ON_FORM_SUBMIT, TriggerTypes.SUBMIT]
    ]);

    const record = infoToRecord_({
        funcName,
        enabled: true,
        type: typeMap.get(type)
    });

    trackingList[id] = record;

    setProperty_(key, JSON.stringify(trackingList));

    return trackingList;
};

/**
 * @summary untracks a trigger
 * @param {{
 *  onError? : (err : Error) => void,
 *  trigger? : GoogleAppsScript.Script.Trigger
 * }}
 * @returns {boolean}
 */
const untrackTrigger = ({
    trigger,
    onError = (err) => console.warn(err),
} = {}) => {

    try {

        const key = getTrackingPropertyName_();
        const trackingList = JSON.parse(getProperty_(key, "{}"));

        const id = trigger.getUniqueId();

        delete trackingList[id];

        return setProperty_(key, JSON.stringify(trackingList));

    }
    catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary gets tracking property name (matches as the name is unique)
 * @returns {?string}
 */
const getTrackingPropertyName_ = () => {
    const store = Dependencies_.properties.getScriptProperties();
    return store.getKeys().find((k) => /triggers\//.test(k));
};

/**
 * @summary checks if triggers are tracked
 * @returns {boolean}
 */
const isTrackingTriggers = () => !!getTrackingPropertyName_();

/**
 * @summary gets tracked trigger info
 * @param {TriggerInfo}
 * @returns {TrackedTriggerInfo}
 */
const getTrackedTriggerInfo = ({
    funcName,
    type,
    tracked = listTrackedTriggers()
}) => {
    return tracked.find(({ funcName: f, type: t }) => (
        funcName !== void 0 ? funcName === f : true &&
            type !== void 0 ? type === t : true
    ));
};

/**
 * @summary updates tracked trigger info
 * @param {{
 *  id       : string,
 *  record   : string,
 *  onError? : (err : Error) => void
 * }}
 * @returns {boolean}
 */
const updateTrackedTriggerInfo = ({
    id,
    record,
    onError = (err) => console.warn(err)
}) => {
    try {

        const key = getTrackingPropertyName_();

        const trackingList = JSON.parse(getProperty_(key, "{}"));

        trackingList[id] = record;

        setProperty_(key, JSON.stringify(trackingList));

        return true;

    }
    catch (error) {
        onError(error);
        return false;
    }
};