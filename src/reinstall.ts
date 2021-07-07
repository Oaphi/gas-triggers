type ConditionalReinstallOptions = Omit<InstallOptions, "onGet"> & {
    comparator: (info: TriggerInfo) => boolean;
};

/**
 * @summary reinstalls a tracked trigger
 */
const getOrReinstallTrigger = ({
    callbackName,
    type = "CLOCK",
    id,
    onError = (err) => console.warn(err),
    ...rest
}: InstallOptions) => {
    try {
        const deleted = deleteTracked({
            onError,
            id,
            type,
            funcName: callbackName,
        });

        if (!deleted) return false;

        return !!getOrInstallTrigger({
            onError,
            callbackName,
            ...rest,
        });
    } catch (error) {
        onError(error);
        return false;
    }
};

/**
 * @summary gets trigger or reinstalls it depending on condition
 */
const getOrReinstallTriggerIf = ({
    comparator,
    onError = (err) => console.warn(err),
    ...rest
}: ConditionalReinstallOptions) => {
    try {
        let info: TriggerInfo | null = null;

        getOrInstallTrigger({
            onError,
            onGet: (_t, i) => (info = i),
            ...rest,
        });

        if (!info || !comparator(info)) return false;
        return getOrReinstallTrigger({ onError, ...rest });
    } catch (error) {
        onError(error);
        return false;
    }
};

Object.assign(this, {
    getOrReinstallTrigger,
    getOrReinstallTriggerIf,
});
