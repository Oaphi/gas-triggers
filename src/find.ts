/**
 * @summary finds a tracked trigger
 */
const findTrackedTrigger = (info: Partial<TriggerInfo>) => {
    const tracked = listTrackedTriggers();
    return tracked.find(makeTriggerInfoFilter_(info)) || null;
};

Object.assign(this, {
    findTrackedTrigger,
});
