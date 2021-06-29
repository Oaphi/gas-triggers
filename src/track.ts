type ErrLoggable<T> = T & { onError?: (err: string | Error) => void };

type TriggerType = "project" | "user";

type EventType =
    | "CLOCK"
    | "ON_OPEN"
    | "ON_EDIT"
    | "ON_CHANGE"
    | "ON_FORM_SUBMIT";

type TriggerInfo = {
    funcName: string;
    id: string;
    type: EventType;
};

type TrackedTriggerInfo = {
    deleted: boolean;
    enabled: boolean;
} & TriggerInfo;

type GetInfoOptions = Partial<TriggerInfo> & {
    tracked?: TrackedTriggerInfo[];
};

type TrackOptions = ErrLoggable<{
    type?: TriggerType;
    onAlreadyTracking?: () => void;
}>;

type UpdateTrackedOptions = ErrLoggable<{ id: string; record: string }>;

type UntrackOptions = ErrLoggable<{
    trigger: GoogleAppsScript.Script.Trigger;
}>;

type UntrackAllOptions = ErrLoggable<{}>;

type InfoToRecordOptions = {
    deleted?: boolean;
    enabled?: boolean;
} & Omit<TriggerInfo, "id">;

/**
 * @private
 */
const infoToRecord_ = ({
    funcName,
    type,
    enabled,
    deleted,
}: InfoToRecordOptions) =>
    `${funcName}/${type}/${enabled ? "enabled" : "disabled"}/${
        deleted ? "deleted" : ""
    }`;

/**
 * @private
 */
const recordToInfo_ = (record: string, id: string): TrackedTriggerInfo => {
    const [funcName, type, state, deleted] = record.split("/");
    return {
        funcName,
        type: <EventType>type,
        id,
        enabled: state === "enabled",
        deleted: deleted === "deleted",
    };
};

/**
 * @summary enables trigger tracking
 */
const trackTriggers = ({
    onAlreadyTracking = () => console.log("already tracking"),
    onError = (err) => console.warn(err),
    type = "project",
}: TrackOptions = {}) => {
    try {
        if (isTrackingTriggers()) {
            onAlreadyTracking();
            return true;
        }

        const name = getUniquePropName_("triggers");

        const trackingList: Record<string, string> = {};

        const installedForThisUser = <TriggerInfo[]>listTriggers({
            onError,
            safe: true,
            type,
        });

        installedForThisUser.forEach(
            ({ id, ...info }) => (trackingList[id] = infoToRecord_(info))
        );

        return setProperty_(name, JSON.stringify(trackingList));
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary stops tracking any trigger
 */
const untrackTriggers = ({
    onError = (err) => console.warn(err),
}: UntrackAllOptions = {}) => {
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
 */
const trackTrigger = (
    trigger: GoogleAppsScript.Script.Trigger,
    onError = (err: Error) => console.warn(err)
) => {
    try {
        const key = getTrackingPropertyName_();
        if (!key) return false;

        const trackingList = JSON.parse(getProperty_(key, "{}"));

        const { id, ...rest } = triggerToInfo_(trigger);

        const record = infoToRecord_({
            enabled: true,
            ...rest,
        });

        trackingList[id] = record;

        return setProperty_(key, JSON.stringify(trackingList));
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary untracks a trigger
 */
const untrackTrigger = ({
    trigger,
    onError = (err) => console.warn(err),
}: UntrackOptions) => {
    try {
        const key = getTrackingPropertyName_();
        if (!key) return false;

        const trackingList = JSON.parse(getProperty_(key, "{}"));

        const id = trigger.getUniqueId();
        delete trackingList[id];

        return setProperty_(key, JSON.stringify(trackingList));
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary gets tracking property name (matches as the name is unique)
 */
const getTrackingPropertyName_ = () => {
    const { properties } = Dependencies_;

    if (!properties) throw new DependencyError("script properties");

    const store = properties.getScriptProperties();
    return store.getKeys().find((k) => /triggers\//.test(k));
};

/**
 * @summary checks if triggers are tracked
 */
const isTrackingTriggers = () => !!getTrackingPropertyName_();

/**
 * @summary gets tracked trigger info
 */
const getTrackedTriggerInfo = ({
    funcName,
    type,
    tracked = listTrackedTriggers(),
}: GetInfoOptions) => {
    return tracked.find(
        ({ funcName: f, type: t }) =>
            (!funcName || funcName === f) && (!type || type === t)
    );
};

/**
 * @summary updates tracked trigger info
 */
const updateTrackedTriggerInfo = ({
    id,
    record,
    onError = (err) => console.warn(err),
}: UpdateTrackedOptions) => {
    try {
        const key = getTrackingPropertyName_();
        if (!key) return false;

        const trackingList = JSON.parse(getProperty_(key, "{}"));

        trackingList[id] = record;

        return setProperty_(key, JSON.stringify(trackingList));
    } catch (error) {
        onError(error);
        return false;
    }
};
