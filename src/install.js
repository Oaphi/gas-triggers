/**
 * @summary gets or installs a script trigger
 * 
 * @param {{
 *  callbackName : string,
 *  id : (string|undefined),
 *  installer : function ({ callbackName : string }) : GoogleAppsScript.Script.Trigger,
 *  installerConfig : TimedTriggerInstallConfig,
 *  type : (GoogleAppsScript.Script.EventType|undefined)
 * }}
 * 
 * @returns {?GoogleAppsScript.Script.Trigger}
 */
const getOrInstallTrigger = ({
    callbackName,
    id,
    installer,
    installerConfig = {},
    type = ScriptApp.EventType.CLOCK
} = {}) => {

    try {
        const triggers = ScriptApp.getProjectTriggers();

        const installersMap = new Map([
            [ScriptApp.EventType.CLOCK, timedTriggerInstaller(installerConfig)]
        ]);

        const [trigger] = triggers
            .filter(
                trigger => {
                    const sameId = id ? trigger.getUniqueId() : true;
                    const sameType = type ? trigger.getEventType() === type : true;
                    const sameFunc = trigger.getHandlerFunction() === callbackName;

                    return sameId && sameType && sameFunc;
                }
            );

        trigger && console.log(`found trigger: ${trigger.getHandlerFunction()}`);

        const customOrDefaultInstaller = installer || installersMap.get(type) || installer;

        return trigger || customOrDefaultInstaller({ callbackName });
    }
    catch (error) {
        console.warn(`error during trigger check ${error}`);
        return null;
    }

};