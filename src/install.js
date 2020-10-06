/// <reference types="../index" />

const installTrigger_ = ({
    unique = false,
    type,
    onError,
    onInstall,
    onInstallFailure,
    installer,
    callbackName
}) => {

    if (unique) {
        const alreadyInstalled = getTrackedTriggerInfo({ funcName: callbackName, type });
        if (alreadyInstalled) { return null; }
    }

    const installed = installer({ callbackName, onError });

    if (installed && isTrackingTriggers()) {
        trackTrigger(installed);
    }

    installed ?
        onInstall(installed) :
        onInstallFailure({
            callbackName,
            type,
            unique
        });

    return installed;
};

/**
 * @type {{
 *  CLOCK  : string,
 *  EDIT   : string,
 *  CHANGE : string,
 *  SUBMIT : string
 * }}
 */
var TriggerTypes = ((e) => {
    const {
        EventType: {
            CLOCK,
            ON_EDIT,
            ON_CHANGE,
            ON_FORM_SUBMIT
        }
    } = ScriptApp;

    e[e.CLOCK = "clock"] = CLOCK;
    e[e.EDIT = "edit"] = ON_EDIT;
    e[e.CHANGE = "change"] = ON_CHANGE;
    e[e.SUBMIT = "submit"] = ON_FORM_SUBMIT;
    return e;
})({});

/**
 * @summary finds or installs a self-rescheduling trigger
 * @param {GoogleAppsScript.Triggers.TriggerInstallOptions}
 */
const getOrInstallSelfRescheduling_ = ({
    callbackName,
    id,
    installer,
    installerConfig,
    unique = false,
    onError = (err) => console.warn(err)
}) => {

    try {



    }
    catch (error) {
        onError(error);
    }

};

/**
 * @summary gets ore installs a trigger
 * @param {GoogleAppsScript.Triggers.TriggerInstallOptions}
 */
const getOrInstallTrigger = ({
    unique = false,
    callbackName,
    id,
    installer,
    installerConfig = {},
    onError = console.warn,
    onInstall = (trg) => console.log(`installed: ${trg.getHandlerFunction()}`),
    onInstallFailure = (msg) => console.warn(`failed to install trigger: ${msg}`),
    onGet = (trg) => console.log(`found handler: ${trg.getHandlerFunction()}`),
    type = TriggerTypes.CLOCK
} = {}) => {

    try {
        const triggers = ScriptApp.getProjectTriggers();

        const installersMap = new Map([
            [TriggerTypes.SUBMIT, formSubmitTriggerInstaller(installerConfig)],
            [TriggerTypes.CHANGE, changeTriggerInstaller(installerConfig)],
            [TriggerTypes.CLOCK, timedTriggerInstaller(installerConfig)],
            [TriggerTypes.EDIT, editTriggerInstaller(installerConfig)]
        ]);

        const filter = makeTriggerFilter_({ id, type, funcName: callbackName });

        const oldTrigger = triggers.find(filter);

        console.log({ oldTrigger, type, unique, installer });

        if (oldTrigger) {
            return onGet(oldTrigger);
        }

        return installTrigger_({
            unique,
            type,
            installer: installer || installersMap.get(type),
            callbackName,
            onInstall,
            onInstallFailure,
            onError
        });
    }
    catch (error) {
        onError(`error during trigger check ${error}`);
        return null;
    }

};