/// <reference types="../index" />

const getOrInstallTrigger = ({
    callbackName,
    id,
    installer,
    installerConfig = {},
    onGet = (trigger) => console.log(`found trigger: ${trigger.getHandlerFunction()}`),
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

        trigger && onGet(trigger);

        const customOrDefaultInstaller = installer || installersMap.get(type) || installer;

        return trigger || customOrDefaultInstaller({ callbackName });
    }
    catch (error) {
        console.warn(`error during trigger check ${error}`);
        return null;
    }

};

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

        const tgs = typeMap.get(type).call(ScriptApp, getActiveDoc_({ onError }));

        return safe ? tgs.map((tgr) => ({
            funcName: tgr.getHandlerFunction(),
            id: tgr.getUniqueId(),
            type: JSON.stringify(tgr.getEventType())
        })) : tgs;

    } catch (error) {
        onError(error);
        return [];
    }
};