/**
 * @typedef {{
 *  funcName : string,
 *  id       : string,
 *  type     : string
 * }} TriggerInfo
 */


/**
 * @summary utility for filtering triggers
 * @param {TriggerInfo}
 */
const makeTriggerFilter_ = ({ funcName, id, type } = {}) =>

    /**
     * @param {GoogleAppsScript.Script.Trigger} trigger
     * @returns {boolean}
     */
    (trigger) => {
        const i = trigger.getUniqueId();
        const f = trigger.getHandlerFunction();
        const t = trigger.getEventType();

        const sameFunc = funcName ? funcName === f : true;
        const sameType = type ? TriggerTypes[type] === t : true;
        const sameId = id ? id === i : false;

        return (sameFunc && sameType) || sameId;
    };

/**
 * @summaryutility for filtering trigger info
 * @param {Partial<TriggerInfo>}
 */
const makeTriggerInfoFilter_ = ({ funcName, id, type } = {}) => 

    /**
     * @param {TriggerInfo} info
     * @returns {boolean}
     */
    (info) => {
        const { funcName : f, id : i, type: t } = info;

        const sameFunc = funcName ? funcName === f : true;
        const sameType = type ? type === t : true;
        const sameId = id ? id === i : true;

        return sameFunc && sameType && sameId;
    };

/**
 * @summary lists tracked triggers
 * @returns {TrackedTriggerInfo[]}
 */
const listTrackedTriggers = () => {
    const key = getTrackingPropertyName_();
    const tracked = JSON.parse(getProperty_(key, "{}"));
    return Object.entries(tracked).map(([id, record]) => recordToInfo_(record, id));
};

/**
 * 
 * @summary lists all available triggers for a user
 * 
 * @param {{
 *  onError?: (err : Error) => void,
 *  safe?   : boolean,
 *  type?   : "project"|"user"
 * }}
 * 
 * @returns {(GoogleAppsScript.Script.Trigger|TriggerInfo)[]}
 */
const listTriggers = ({
    onError = console.warn,
    safe = false,
    type = "project"
} = {}) => {

    try {

        const typeMap = new Map([
            ["project", ScriptApp.getProjectTriggers],
            ["user", ScriptApp.getUserTriggers]
        ]);

        const params = [];
        if (type === "user") {
            params.push(getActiveDoc_({ type, onError }));
        }

        const tgs = typeMap.get(type).apply(ScriptApp, params);

        const triggersInfo = safe ? tgs.map((tgr) => ({
            funcName: tgr.getHandlerFunction(),
            id: tgr.getUniqueId(),
            type: JSON.stringify(tgr.getEventType())
        })) : tgs;

        return triggersInfo;

    } catch (error) {
        onError(error);
        return [];
    }
};