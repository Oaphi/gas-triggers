/// <reference types="google-apps-script" />

declare namespace GoogleAppsScript {
    namespace Events {
        interface TimeDrivenEvent
            extends GoogleAppsScript.Events.AppsScriptEvent {
            "day-of-month": number;
            "day-of-week": number;
            "week-of-year": number;
            "second": number;
            "minute": number;
            "hour": number;
            "month": number;
            "year": number;
            "timezone": string;
        }
    }

    namespace Triggers {
        namespace Installers {
            interface Common {}

            interface TimeDriven extends Common {
                at?: number | string | Date;
                atMinute?: number;
                atHour?: number;
                days?: number;
                hourly?: number;
                minutely?: number;
                weeks?: number;
                weekDay?: GoogleAppsScript.Base.Weekday;
                timezone?: string;
            }
        }

        enum TriggerTypes {
            SUBMIT,
            CHANGE,
            CLOCK,
            EDIT,
        }

        interface CommonOptions {
            onError?: (err: Error) => void;
        }

        interface TriggerInstallOptions<I extends Installers.Common>
            extends CommonOptions {
            callbackName: string;
            id?: string;
            installer?: <R>(options: I) => R;
            installerConfig?: I;
            onInstall?: (trg: GoogleAppsScript.Script.Trigger) => any;
            onInstallFailure?: (msg: string) => any;
            onGet?: (trg: GoogleAppsScript.Script.Trigger) => any;
            type?: TriggerTypes;
            unique?: boolean;
        }

        interface ConditionalReinstallOptions<I extends Installers.Common>
            extends TriggerInstallOptions<I> {
            comparator: (info: TriggerInfo<I>) => boolean;
        }

        interface TriggerDeleteOptions extends CommonOptions {
            email?: string;
            onDelete: (email: string) => any;
        }

        interface ClosestValueSettings {
            value: any;
            values: any[];
        }

        interface isInHourlyRange {
            (options: { hour?: number; start?: number; end?: number }): boolean;
        }

        interface TriggerInfo<I extends Installers.Common> {
            funcName: string;
            id: string;
            type: TriggerTypes;
            installerConfig: Partial<I>;
        }

        interface TrackedTriggerInfo<I extends Installers.Common>
            extends TriggerInfo<I> {
            deleted: boolean;
            enabled: boolean;
        }

        type TriggerType = "project" | "user";

        interface ListTriggersOptions extends CommonOptions {
            safe: boolean;
            type?: TriggerType;
        }

        interface TrackTriggerOptions extends CommonOptions {
            installerConfig?: Partial<
                Installers.Common | Installers.TimeDriven
            >;
        }

        interface TrackTriggersOptions extends CommonOptions {
            funcName?: string;
            type: TriggerTypes;
        }

        class DependencyError extends Error {}

        interface TriggerApp {
            use(service: GoogleAppsScript.Properties.PropertiesService): void;
            DependencyError: DependencyError;
        }

        interface TriggerApp {
            TriggerTypes: typeof TriggerTypes;
            closestValue(settings: ClosestValueSettings): any;
            getOrInstallTrigger<I extends Installers.Common>(
                settings: TriggerInstallOptions<I>
            ): GoogleAppsScript.Script.Trigger | null;
            getTrackedTriggerInfo<I extends Installers.Common>(
                options?: any
            ): TrackedTriggerInfo<I> | null;
            isInHourlyRange: isInHourlyRange;
        }

        interface TriggerApp {
            getOrReinstallTrigger<I extends Installers.Common>(
                settings: TriggerInstallOptions<I>
            ): boolean;
            getOrReinstallTriggerIf<I extends Installers.Common>(
                settings: ConditionalReinstallOptions<I>
            ): boolean;
        }

        interface TriggerApp {
            findTrackedTrigger<I extends Installers.Common>(
                info: Partial<TriggerInfo<I>>
            ): TrackedTriggerInfo<I> | null;
        }

        interface TriggerApp {
            listTriggers<I extends Installers.Common>(
                options: ListTriggersOptions
            ): (GoogleAppsScript.Script.Trigger | TriggerInfo<I>)[];
            listTrackedTriggers<
                I extends Installers.Common
            >(): TrackedTriggerInfo<I>[];
        }

        interface TriggerApp {
            trackTrigger(
                trigger: GoogleAppsScript.Script.Trigger,
                options?: TrackTriggerOptions
            ): boolean;
            trackTriggers(options?: TrackTriggersOptions): boolean;
        }

        interface TriggerApp {
            deleteTracked<I extends Installers.Common>(
                options: TrackedTriggerInfo<I>
            ): boolean;
            deleteAllTracked(options?: CommonOptions): boolean;
            deleteAllIf(options: TriggerDeleteOptions): any;
            untrackTriggers(options?: CommonOptions): boolean;
        }

        interface TriggerApp {
            enableTracked(options: TrackTriggersOptions): boolean;
            disableTracked(options: TrackTriggersOptions): boolean;
            guardTracked<T = GoogleAppsScript.Events.AppsScriptEvent>(
                event: T,
                callback: (ev: T) => unknown
            ): any;
        }

        interface TriggerApp {
            timedTriggerInstaller(
                config: Installers.TimeDriven
            ): GoogleAppsScript.Script.Trigger | null;
            editTriggerInstaller(
                config: Installers.Common
            ): GoogleAppsScript.Script.Trigger | null;
            changeTriggerInstaller(
                config: Installers.Common
            ): GoogleAppsScript.Script.Trigger | null;
        }
    }
}

declare var TriggersApp: GoogleAppsScript.Triggers.TriggerApp;
declare var Triggers: GoogleAppsScript.Triggers.TriggerApp;
