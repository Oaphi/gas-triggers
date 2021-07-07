"use strict";
const timedTriggerInstaller = ({ after, afterSeconds, afterMinutes, at, atHour, atMinute, minutely, hourly, days, weeks, weekDay, timezone = Session.getScriptTimeZone(), onError = (err) => console.warn(err), }) => ({ callbackName }) => {
    try {
        const builder = ScriptApp.newTrigger(callbackName)
            .timeBased()
            .inTimezone(timezone);
        if (!hourly && !at && minutely) {
            const validatedMinutely = closestValue_({
                value: minutely,
                values: [1, 5, 10, 15, 30],
            });
            builder.everyMinutes(validatedMinutely || 30);
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
                .nearMinute(atMinute !== void 0
                ? atMinute || 1
                : atDate.getMinutes() || 1);
        }
        if (hourly && !at && !minutely)
            builder.everyHours(hourly);
        if (!hourly && !days && at && !minutely)
            builder.at(new Date(at));
        if (weekDay && !weeks)
            builder.onWeekDay(weekDay);
        if (afterMinutes || afterSeconds || after) {
            const minuteMs = (afterMinutes || 0) * 60 * 1e3;
            const secondMs = (afterSeconds || 0) * 1e3;
            builder.after(minuteMs + secondMs + (after || 0));
        }
        return builder.create();
    }
    catch (error) {
        onError(`failed to install clock trigger: ${error}`);
        return null;
    }
};
var isInHourlyRange = ({ hour = new Date().getHours(), start = 0, end = 23, } = {}) => {
    const validEnd = end > 23 ? 23 : end < 0 ? 0 : end;
    const validStart = start > 23 ? 23 : start < 0 ? 0 : start;
    return hour <= validEnd && hour >= validStart;
};
Object.assign(this, {
    timedTriggerInstaller,
    isInHourlyRange,
});
const deleteTracked = ({ source = "project", onError = console.warn, ...triggerInfo } = {}) => {
    try {
        const triggers = listTriggers({
            onError,
            type: source,
            safe: false,
        });
        if (!triggers.length)
            return true;
        const filter = makeTriggerFilter_(triggerInfo);
        const trigger = triggers.find(filter);
        if (!trigger)
            return false;
        const status = untrackTrigger({ trigger, onError });
        if (!status)
            return false;
        ScriptApp.deleteTrigger(trigger);
        ScriptApp.invalidateAuth();
        return true;
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const deleteAllTracked = ({ onError = (err) => console.warn(err), } = {}) => {
    try {
        const triggerInfo = listTrackedTriggers();
        return triggerInfo.every(({ id }) => deleteTracked({ onError, id }));
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const deleteAllIf = ({ email, onError = (err) => console.warn(err), onDelete = () => void 0, }) => {
    try {
        const del = email && Session.getEffectiveUser().getEmail() === email;
        if (!del)
            return;
        const trgs = ScriptApp.getProjectTriggers();
        trgs.forEach((trigger) => ScriptApp.deleteTrigger(trigger));
        return onDelete(email);
    }
    catch (error) {
        return onError(error);
    }
};
Object.assign(this, {
    deleteTracked,
    deleteAllTracked,
    deleteAllIf,
});
const findTrackedTrigger = (info) => {
    const tracked = listTrackedTriggers();
    return tracked.find(makeTriggerInfoFilter_(info)) || null;
};
Object.assign(this, {
    findTrackedTrigger,
});
const guardTracked = (eventObject, callback) => {
    const { name } = callback;
    const { id, enabled, deleted } = getTrackedTriggerInfo({ funcName: name }) || {};
    if (deleted && id)
        return deleteTracked({ id });
    if (!enabled)
        return;
    return callback(eventObject);
};
const disableTracked = ({ funcName, type, onError = (err) => console.warn(err), }) => {
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
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const enableTracked = ({ funcName, type, onError = (err) => console.warn(err), }) => {
    try {
        const info = getTrackedTriggerInfo({ funcName, type });
        if (!info)
            return false;
        const { enabled, ...rest } = info;
        if (enabled)
            return true;
        const record = infoToRecord_({ ...rest, enabled: true });
        const { id } = info;
        return updateTrackedTriggerInfo({ id, record, onError });
    }
    catch (error) {
        onError(error);
        return false;
    }
};
Object.assign(this, {
    guardTracked,
    disableTracked,
    enableTracked,
});
class DependencyError extends Error {
    constructor(dep) {
        super(`missing dependency "${typeof dep === "string" ? dep : dep.name}"`);
    }
}
const Dependencies_ = {
    properties: null,
};
const use = (service) => {
    if ("getScriptProperties" in service)
        Dependencies_.properties = service;
};
Object.assign(this, { use, DependencyError });
var TriggerTypes;
(function (TriggerTypes) {
    TriggerTypes["CLOCK"] = "CLOCK";
    TriggerTypes["EDIT"] = "ON_EDIT";
    TriggerTypes["CHANGE"] = "ON_CHANGE";
    TriggerTypes["SUBMIT"] = "ON_FORM_SUBMIT";
})(TriggerTypes || (TriggerTypes = {}));
const installTrigger_ = ({ installerConfig, unique = false, type, onError, onInstall, onInstallFailure, installer, callbackName, }) => {
    if (unique) {
        const alreadyInstalled = getTrackedTriggerInfo({
            funcName: callbackName,
            type,
        });
        if (alreadyInstalled)
            return null;
    }
    const installed = installer({ callbackName, onError });
    if (installed && isTrackingTriggers())
        trackTrigger(installed, { onError, installerConfig });
    installed
        ? onInstall(installed)
        : onInstallFailure({
            callbackName,
            type,
            unique,
        });
    return installed;
};
const getOrInstallTrigger = ({ unique = false, callbackName, id, installer, installerConfig = {}, onError = console.warn, onInstall = (trg) => console.log(`installed: ${trg.getHandlerFunction()}`), onInstallFailure = (msg) => console.warn(`failed to install: ${msg}`), onGet = (trg) => console.log(`found handler: ${trg.getHandlerFunction()}`), type = TriggerTypes.CLOCK, }) => {
    try {
        const triggers = ScriptApp.getProjectTriggers();
        const installersMap = new Map([
            [TriggerTypes.SUBMIT, formSubmitTriggerInstaller(installerConfig)],
            [TriggerTypes.CHANGE, changeTriggerInstaller(installerConfig)],
            [TriggerTypes.CLOCK, timedTriggerInstaller(installerConfig)],
            [TriggerTypes.EDIT, editTriggerInstaller(installerConfig)],
        ]);
        const info = { id, type, funcName: callbackName };
        const oldTrigger = triggers.find(makeTriggerFilter_(info));
        if (oldTrigger) {
            const isTracking = !!findTrackedTrigger(info);
            isTracking ||
                trackTrigger(oldTrigger, { onError, installerConfig });
            return onGet(oldTrigger);
        }
        return installTrigger_({
            installerConfig,
            id,
            unique,
            type,
            installer: installer || installersMap.get(type),
            callbackName,
            onInstall,
            onInstallFailure,
            onError,
        });
    }
    catch (error) {
        onError(`error during trigger check ${error}`);
        return null;
    }
};
Object.assign(this, {
    getOrInstallTrigger,
});
const makeTriggerFilter_ = ({ funcName, id, type }) => (trigger) => {
    const { funcName: f, type: t, id: i } = triggerToInfo_(trigger);
    const sameFunc = !funcName || funcName === f;
    const sameType = !type || type === t.replace(/"/g, "");
    const sameId = !id || id === i;
    return [sameFunc, sameType, sameId].every(Boolean);
};
const makeTriggerInfoFilter_ = ({ funcName, id, type }) => (info) => {
    const { funcName: f, id: i, type: t } = info;
    const sameFunc = !funcName || funcName === f;
    const sameType = !type || type === t.replace(/"/g, "");
    const sameId = !id || id === i;
    return [sameFunc, sameType, sameId].every(Boolean);
};
const listTrackedTriggers = () => {
    const key = getTrackingPropertyName_();
    if (!key)
        return [];
    const tracked = JSON.parse(getProperty_(key, "{}"));
    return Object.entries(tracked).map(([id, record]) => recordToInfo_(record, id));
};
const triggerToInfo_ = (trg, installerConfig = {}) => ({
    funcName: trg.getHandlerFunction(),
    id: trg.getUniqueId(),
    type: JSON.stringify(trg.getEventType()),
    installerConfig,
});
const listTriggers = ({ onError = console.warn, safe = false, type = "project", } = {}) => {
    try {
        const typeMap = new Map([
            ["project", ScriptApp.getProjectTriggers],
            ["user", ScriptApp.getUserTriggers],
        ]);
        const params = [];
        if (type === "user")
            params.push(getActiveDoc_({ onError }));
        const tgs = typeMap.get(type).apply(ScriptApp, params);
        return safe ? tgs.map((t) => triggerToInfo_(t)) : tgs;
    }
    catch (error) {
        onError(error);
        return [];
    }
};
Object.assign(this, {
    listTrackedTriggers,
    listTriggers,
});
const getOrReinstallTrigger = ({ callbackName, type = "CLOCK", id, onError = (err) => console.warn(err), ...rest }) => {
    try {
        const deleted = deleteTracked({
            onError,
            id,
            type,
            funcName: callbackName,
        });
        if (!deleted)
            return false;
        return !!getOrInstallTrigger({
            onError,
            callbackName,
            ...rest,
        });
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const getOrReinstallTriggerIf = ({ comparator, onError = (err) => console.warn(err), ...rest }) => {
    try {
        const trigger = getOrInstallTrigger({ onError, ...rest });
        if (!trigger || !comparator(triggerToInfo_(trigger)))
            return false;
        return getOrReinstallTrigger({ onError, ...rest });
    }
    catch (error) {
        onError(error);
        return false;
    }
};
Object.assign(this, {
    getOrReinstallTrigger,
    getOrReinstallTriggerIf,
});
const editTriggerInstaller = ({ spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), onError = (err) => console.warn(err), } = {}) => ({ callbackName }) => {
    try {
        return ScriptApp.newTrigger(callbackName)
            .forSpreadsheet(spreadsheet)
            .onEdit()
            .create();
    }
    catch (error) {
        onError(`failed to install edit trigger: ${error}`);
        return null;
    }
};
const changeTriggerInstaller = ({ spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), onError = (err) => console.warn(err), } = {}) => ({ callbackName }) => {
    try {
        return ScriptApp.newTrigger(callbackName)
            .forSpreadsheet(spreadsheet)
            .onChange()
            .create();
    }
    catch (error) {
        onError(`failed to install change trigger: ${error}`);
        return null;
    }
};
const formSubmitTriggerInstaller = ({ spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), onError = (err) => console.warn(err), } = {}) => ({ callbackName }) => {
    try {
        return ScriptApp.newTrigger(callbackName)
            .forSpreadsheet(spreadsheet)
            .onFormSubmit()
            .create();
    }
    catch (error) {
        onError(`failed to install form submit trigger: ${error}`);
        return null;
    }
};
Object.assign(this, {
    editTriggerInstaller,
    changeTriggerInstaller,
    formSubmitTriggerInstaller,
});
const infoToRecord_ = ({ funcName, type, enabled, deleted, installerConfig, }) => `${funcName}/${type}/${enabled ? "enabled" : "disabled"}/${deleted ? "deleted" : ""}/${JSON.stringify(installerConfig)}`;
const recordToInfo_ = (record, id) => {
    const [funcName, type, state, deleted, config] = record.split("/");
    return {
        funcName,
        type: type,
        id,
        enabled: state === "enabled",
        deleted: deleted === "deleted",
        installerConfig: JSON.parse(config || "{}"),
    };
};
const trackTriggers = ({ onAlreadyTracking = () => console.log("already tracking"), onError = (err) => console.warn(err), type = "project", } = {}) => {
    try {
        if (isTrackingTriggers()) {
            onAlreadyTracking();
            return true;
        }
        const name = getUniquePropName_("triggers");
        const trackingList = {};
        const installedForThisUser = listTriggers({
            onError,
            safe: true,
            type,
        });
        installedForThisUser.forEach(({ id, ...info }) => (trackingList[id] = infoToRecord_(info)));
        return setProperty_(name, JSON.stringify(trackingList));
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const untrackTriggers = ({ onError = (err) => console.warn(err), } = {}) => {
    try {
        const key = getTrackingPropertyName_();
        key && deleteProperty_(key);
        return true;
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const trackTrigger = (trigger, { onError = (err) => console.warn(err), installerConfig = {}, }) => {
    try {
        const key = getTrackingPropertyName_();
        if (!key)
            return false;
        const trackingList = JSON.parse(getProperty_(key, "{}"));
        const { id, ...rest } = triggerToInfo_(trigger, installerConfig);
        const record = infoToRecord_({
            enabled: true,
            ...rest,
        });
        trackingList[id] = record;
        return setProperty_(key, JSON.stringify(trackingList));
    }
    catch (error) {
        onError(error);
        return false;
    }
};
const untrackTrigger = ({ trigger, onError = (err) => console.warn(err), }) => {
    try {
        const key = getTrackingPropertyName_();
        if (!key)
            return false;
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
const getTrackingPropertyName_ = () => {
    const { properties } = Dependencies_;
    if (!properties)
        throw new DependencyError("script properties");
    const store = properties.getScriptProperties();
    return store.getKeys().find((k) => /triggers\//.test(k));
};
const isTrackingTriggers = () => !!getTrackingPropertyName_();
const getTrackedTriggerInfo = ({ funcName, type, tracked = listTrackedTriggers(), }) => {
    return tracked.find(({ funcName: f, type: t }) => (!funcName || funcName === f) && (!type || type === t));
};
const updateTrackedTriggerInfo = ({ id, record, onError = (err) => console.warn(err), }) => {
    try {
        const key = getTrackingPropertyName_();
        if (!key)
            return false;
        const trackingList = JSON.parse(getProperty_(key, "{}"));
        trackingList[id] = record;
        return setProperty_(key, JSON.stringify(trackingList));
    }
    catch (error) {
        onError(error);
        return false;
    }
};
Object.assign(this, {
    trackTrigger,
    trackTriggers,
    untrackTrigger,
    untrackTriggers,
    isTrackingTriggers,
    getTrackedTriggerInfo,
    updateTrackedTriggerInfo,
});
var DocTypes;
(function (DocTypes) {
    DocTypes["SPREADSHEET"] = "spreadsheet";
    DocTypes["PRESENTATION"] = "presentation";
    DocTypes["FORM"] = "form";
    DocTypes["DOCUMENT"] = "document";
})(DocTypes || (DocTypes = {}));
const isCorrectUIgetter_ = (getter) => {
    try {
        return !!getter();
    }
    catch (error) {
        return false;
    }
};
const getActiveDoc_ = ({ type = DocTypes.SPREADSHEET, onError = console.warn, } = {}) => {
    const ActiveDocMap = new Map();
    ActiveDocMap.set(DocTypes.DOCUMENT, DocumentApp.getActiveDocument);
    ActiveDocMap.set(DocTypes.FORM, FormApp.getActiveForm);
    ActiveDocMap.set(DocTypes.SPREADSHEET, SpreadsheetApp.getActiveSpreadsheet);
    ActiveDocMap.set(DocTypes.PRESENTATION, SlidesApp.getActivePresentation);
    const getter = ActiveDocMap.get(type);
    try {
        const valid = isCorrectUIgetter_(getter)
            ? getter
            : [...ActiveDocMap.values()].find(isCorrectUIgetter_);
        return valid();
    }
    catch (error) {
        onError(error);
        return null;
    }
};
const closestValue_ = ({ value, values = [] } = {}) => {
    if (typeof value === "undefined")
        return null;
    if (!values.length)
        return null;
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
const getProperty_ = (key, def) => {
    const { properties } = Dependencies_;
    if (!properties)
        throw new DependencyError("script properties");
    const store = properties.getScriptProperties();
    const prop = store.getProperty(key);
    return prop || def;
};
const setProperty_ = (key, val) => {
    try {
        const { properties } = Dependencies_;
        if (!properties)
            throw new DependencyError("script properties");
        const store = properties.getScriptProperties();
        store.setProperty(key, val);
        return true;
    }
    catch (error) {
        console.warn(error);
        return false;
    }
};
const deleteProperty_ = (key) => {
    try {
        const { properties } = Dependencies_;
        if (!properties)
            throw new DependencyError("script properties");
        const store = properties.getScriptProperties();
        store.deleteProperty(key);
        return true;
    }
    catch (error) {
        console.warn(error);
        return false;
    }
};
const getUniquePropName_ = (key, store) => {
    const { properties } = Dependencies_;
    if (!properties)
        throw new DependencyError("script properties");
    const names = (store || properties.getScriptProperties()).getKeys();
    let uniqueName = `${key}/${Utilities.getUuid()}`;
    while (names.includes(uniqueName)) {
        uniqueName = getUniquePropName_(key, store);
    }
    return uniqueName;
};
