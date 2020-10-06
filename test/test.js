const logger = () => ({
    logs: [],
    add(msg) {
        const log = [Date.now(), msg.toString()];
        this.logs.push(log);
    },
    addObj(obj) {
        this.add(JSON.stringify(obj));
    },
    dump() {
        const { logs } = this;
        const parsedLogs = logs.map(([t, v]) => `${new Date(t).toLocaleString()} | ${v}`);
        console.log(parsedLogs.join("\n"));
    }
});

const testTrackTriggers_ = () => {

    const l = logger();

    const store = PropertiesService.getScriptProperties();
    store.deleteAllProperties();

    getOrInstallTrigger({
        callbackName: "testTrackTriggers_",
        installerConfig : { after : 10e3 }
    });

    const status = trackTriggers();

    l.add(`Tracking triggers: ${status}`);

    const isTracking = isTrackingTriggers();

    l.add(`Is tracking: ${isTracking}`);

    const tracked = getTrackedTriggers();

    l.addObj(tracked);

    const removed = untrackTriggers();

    l.add(`Untracked: ${removed}`);

    const isUntracked = !isTrackingTriggers();

    l.add(`Is untracking: ${isUntracked}`);

    const afterUntrack = getTrackedTriggers();

    l.add(`Tracked triggers: ${afterUntrack.length}`);

    l.dump();

    store.deleteAllProperties();
};

const testUniqueIntall_ = () => {

    trackTriggers();

    getOrInstallTrigger({ 
        unique: true, 
        callbackName: "testUniqueIntall_", 
        installerConfig : { after : 60e3 } 
    });

};