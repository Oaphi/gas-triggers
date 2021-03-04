/// <reference types="google-apps-script" />

declare namespace GoogleAppsScript {
  namespace Events {
    interface TimeDrivenEvent extends GoogleAppsScript.Events.AppsScriptEvent {
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
    enum TriggerTypes {
      SUBMIT,
      CHANGE,
      CLOCK,
      EDIT,
    }

    interface CommonOptions {
      onError?: (err: Error) => void;
    }

    interface TriggerInstallerOptions {
      callbackName: string;
    }

    interface TimedTriggerOptions {
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

    interface TriggerInstallOptions extends CommonOptions {
      callbackName: string;
      id?: string;
      installer?: <R>(options: TriggerInstallerOptions & CommonOptions) => R;
      installerConfig?: TimedTriggerOptions;
      onInstall?: (trg: GoogleAppsScript.Script.Trigger) => any;
      onInstallFailure?: (msg: string) => any;
      onGet?: (trg: GoogleAppsScript.Script.Trigger) => any;
      type?: TriggerTypes;
      unique?: boolean;
    }

    interface TriggerDeleteOptions extends CommonOptions {
      email?: string;
      onDelete: (email: string) => any;
    }

    interface ReschedulableInstallOptions extends TriggerInstallOptions {
      interval?: number;
      period: "seconds" | "minutes" | "hours" | "dates";
      times?: number;
    }

    interface ClosestValueSettings {
      value: any;
      values: any[];
    }

    interface isInHourlyRange {
      (
        options: Partial<Events.TimeDrivenEvent> & {
          start: number;
          end: number;
        }
      ): boolean;
    }

    interface TriggerInfo {
      funcName: string;
      id: string;
      type: string;
    }

    interface TrackedTriggerInfo extends TriggerInfo {
      deleted: boolean;
      enabled: boolean;
    }

    type TriggerType = "project" | "user";

    interface ListTriggersOptions extends CommonOptions {
      safe: boolean;
      type: TriggerType;
    }

    interface listTriggers {
      (options: ListTriggersOptions): (
        | GoogleAppsScript.Script.Trigger
        | TriggerInfo
      )[];
    }

    interface TrackTriggersOptions extends CommonOptions {
      funcName?: string;
      type: TriggerType;
    }

    interface TriggerApp {
      TriggerTypes: typeof TriggerTypes;
      closestValue(settings: ClosestValueSettings): any;
      getOrInstallTrigger(
        settings: TriggerInstallOptions
      ): GoogleAppsScript.Script.Trigger | null;
      getTrackedTriggerInfo(options?: any): TrackedTriggerInfo | null;
      getOrInstallSelfRescheduling(
        settings: TriggerInstallOptions
      ): GoogleAppsScript.Script.Trigger | null;
      isInHourlyRange: isInHourlyRange;
      listTriggers: listTriggers;
      use(service: GoogleAppsScript.Properties.PropertiesService): void;
    }

    interface TriggerApp {
      deleteTracked(options: TrackedTriggerInfo): boolean;
      deleteAllTracked(options?: CommonOptions): boolean;
      deleteAllIf(options: TriggerDeleteOptions): any;
      listTrackedTriggers(): TrackedTriggerInfo[];
      trackTriggers(options?: TrackTriggersOptions): boolean;
      untrackTriggers(options?: CommonOptions): boolean;
    }

    interface TriggerApp {
      enableTracked(options: TrackTriggersOptions): boolean;
      disableTracked(options: TrackTriggersOptions): boolean;
      guardTracked(
        event: GoogleAppsScript.Events.AppsScriptEvent,
        callback: (ev: GoogleAppsScript.Events.AppsScriptEvent) => any
      ): any;
    }

    interface TriggerApp {
      timedTriggerInstaller(
        config: TimedTriggerOptions
      ): (
        opts: TriggerInstallerOptions
      ) => GoogleAppsScript.Script.Trigger | null;

      editTriggerInstaller(
        config: CommonOptions
      ): (
        opts: TriggerInstallerOptions
      ) => GoogleAppsScript.Script.Trigger | null;

      changeTriggerInstaller(
        config: CommonOptions
      ): (
        opts: TriggerInstallerOptions
      ) => GoogleAppsScript.Script.Trigger | null;
    }
  }
}

declare var TriggersApp: GoogleAppsScript.Triggers.TriggerApp;
declare var Triggers: GoogleAppsScript.Triggers.TriggerApp;
