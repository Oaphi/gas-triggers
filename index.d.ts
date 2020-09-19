/// <reference types="google-apps-script" />

declare namespace GoogleAppsScript {

  namespace Events {

    interface TimeDrivenEvent extends GoogleAppsScript.Events.AppsScriptEvent {
      "day-of-month" : number;
      "day-of-week" : number;
      "week-of-year" : number;
      second : number;
      minute : number;
      hour : number;
      month : number;
      year : number;
      timezone: string;
    }

  }

  namespace Triggers {

    interface TriggerInstallerSettings {
      callbackName: string;
    }

    interface TimedTriggerInstallConfig {
      at?: number | string | Date;
      atHour? : number;
      days?: number;
      hourly?: number;
      minutely?: number;
      weeks?: number;
      weekDay?: GoogleAppsScript.Base.Weekday;
      timezone: string;
    }

    interface TriggerInstallOptions {
      callbackName: string;
      id?: string;
      installer: triggerInstaller;
      installerConfig: TimedTriggerInstallConfig;
      onGet?: function (GoogleAppsScript.Script.Trigger): any;
      type?: GoogleAppsScript.Script.EventType;
    }

    interface ClosestValueSettings {
      value: any,
      values: any[];
    }

    interface isInHourlyRange {
      (options : Events.TimeDrivenEvent & { 
        start : number = 0, 
        end : number = 23 
      }) : boolean;
    }

    interface SafeTriggerInfo {
      funcName : string;
      id : string;
      type : string;
    }

    interface listTriggers {
      (options : {
        safe : boolean,
        type : "project" | "user",
        onError : (err: Error) => void
      }) : (GoogleAppsScript.Script.Trigger | SafeTriggerInfo)[]
    }

    interface TriggerApp {
      closestValue(settings: ClosestValueSettings): any;
      getOrInstallTrigger(
        settings: TriggerInstallOptions
      ): ?GoogleAppsScript.Script.Trigger;
      isInHourlyRange: isInHourlyRange;
      listTriggers: listTriggers;
      timedTriggerInstaller(
        settings: TimedTriggerInstallConfig
      ): function (TriggerInstallerSettings): ?GoogleAppsScript.Script.Trigger;
    }
  }
}

declare var Triggers: GoogleAppsScript.Triggers.TriggerApp;