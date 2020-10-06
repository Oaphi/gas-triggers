"use strict";

var timedTriggerInstaller = function timedTriggerInstaller(_ref) {
  var after = _ref.after,
      afterSeconds = _ref.afterSeconds,
      afterMinutes = _ref.afterMinutes,
      at = _ref.at,
      atHour = _ref.atHour,
      atMinute = _ref.atMinute,
      minutely = _ref.minutely,
      hourly = _ref.hourly,
      days = _ref.days,
      weeks = _ref.weeks,
      weekDay = _ref.weekDay,
      _ref$timezone = _ref.timezone,
      timezone = _ref$timezone === void 0 ? Session.getScriptTimeZone() : _ref$timezone,
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref$onError;
  return function (_ref2) {
    var callbackName = _ref2.callbackName;

    try {
      var builder = ScriptApp.newTrigger(callbackName).timeBased(); //only valid values are 1, 5, 10, 15, 30

      if (!hourly && !at && minutely) {
        var validatedMinutely = closestValue({
          value: minutely,
          values: [1, 5, 10, 15, 30]
        });
        builder.everyMinutes(validatedMinutely);
      }

      if (weeks) {
        builder.everyWeeks(weeks).onWeekDay(weekDay || ScriptApp.WeekDay.SUNDAY);
      }

      if (days && !weeks) {
        var atDate = new Date(at !== void 0 ? at : Date.now());
        builder.everyDays(days).atHour(atHour !== void 0 ? atHour : atDate.getHours()).nearMinute(atMinute !== void 0 ? atMinute || 1 : atDate.getMinutes() || 1);
      }

      if (hourly && !at && !minutely) {
        builder.everyHours(hourly);
      }

      if (!hourly && !days && at && !minutely) {
        builder.at(new Date(at));
      }

      if (weekDay && !weeks) {
        builder.onWeekDay(weekDay);
      }

      if (afterMinutes || afterSeconds || after) {
        var minuteMs = (afterMinutes || 0) * 60 * 1e3;
        var secondMs = (afterSeconds || 0) * 1e3;
        builder.after(minuteMs + secondMs + (after || 0));
      }

      builder.inTimezone(timezone);
      return builder.create();
    } catch (error) {
      onError("failed to install clock trigger: ".concat(error));
      return null;
    }
  };
};
/**
 * @type {GoogleAppsScript.Triggers.isInHourlyRange}
 */


var isInHourlyRange = function isInHourlyRange() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref3$hour = _ref3.hour,
      hour = _ref3$hour === void 0 ? new Date().getHours() : _ref3$hour,
      _ref3$start = _ref3.start,
      start = _ref3$start === void 0 ? 0 : _ref3$start,
      _ref3$end = _ref3.end,
      end = _ref3$end === void 0 ? 23 : _ref3$end;

  var validEnd = end > 23 ? 23 : end < 0 ? 0 : end;
  var validStart = start > 23 ? 23 : start < 0 ? 0 : start;
  hour >= validEnd && hour <= validStart;
};
"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * @summary deletes tracked trigger
 * @param {{
 *  source?  : "project" | "user",
 *  onError? : (err : Error) => void
 * } & TriggerInfo}
 */
var deleteTracked = function deleteTracked() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$source = _ref.source,
      source = _ref$source === void 0 ? "project" : _ref$source,
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? console.warn : _ref$onError,
      triggerInfo = _objectWithoutProperties(_ref, ["source", "onError"]);

  try {
    /** @type {GoogleAppsScript.Script.Trigger[]} */
    var triggers = listTriggers({
      onError: onError,
      type: source,
      safe: false
    });

    if (!triggers.length) {
      return true;
    }

    var filter = makeTriggerFilter_(triggerInfo);
    var trigger = triggers.find(filter);

    if (!trigger) {
      return false;
    }

    var status = untrackTrigger({
      trigger: trigger,
      onError: onError
    });

    if (!status) {
      return false;
    }

    ScriptApp.deleteTrigger(trigger);
    return true;
  } catch (error) {
    onError(error);
    return false;
  }
};
/**
 * @summary deletes all tracked triggers
 * @param {{
 *  onError? : (err : Error) => void
 * }}
 */


var deleteAllTracked = function deleteAllTracked() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError;

  try {
    var triggerInfo = listTrackedTriggers();
    return triggerInfo.reduce(function (acc, _ref3) {
      var id = _ref3.id;
      return acc && deleteTracked({
        onError: onError,
        id: id
      });
    }, true);
  } catch (error) {
    onError(error);
    return false;
  }
};
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * @summary wraps around the triggered function to enable cross-user deletion and disable/enable behaviour
 * @param {GoogleAppsScript.Events.AppsScriptEvent} eventObject 
 * @param {function (GoogleAppsScript.Events.AppsScriptEvent) : any} callback 
 */
var guardTracked = function guardTracked(eventObject, callback) {
  var name = callback.name;

  var _getTrackedTriggerInf = getTrackedTriggerInfo({
    funcName: name
  }),
      id = _getTrackedTriggerInf.id,
      enabled = _getTrackedTriggerInf.enabled,
      deleted = _getTrackedTriggerInf.deleted;

  if (!enabled) {
    return;
  }

  if (deleted) {
    var status = deleteTracked({
      id: id
    });
    console.log("Deleted: ".concat(status));
  }

  return callback(eventObject);
};
/**
 * @summary disables tracked trigger
 * @param {{
 *  funcName : string,
 *  onError? : (err : Error) => void
 * }}
 * @returns {boolean}
 */


var disableTracked = function disableTracked(_ref) {
  var funcName = _ref.funcName,
      type = _ref.type,
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref$onError;

  try {
    var info = getTrackedTriggerInfo({
      funcName: funcName,
      type: type
    });

    if (!info) {
      return false;
    }

    var enabled = info.enabled,
        rest = _objectWithoutProperties(info, ["enabled"]);

    if (!enabled) {
      return true;
    }

    var record = infoToRecord_(_objectSpread(_objectSpread({}, rest), {}, {
      enabled: false
    }));
    var id = info.id;
    return updateTrackedTriggerInfo({
      id: id,
      record: record,
      onError: onError
    });
  } catch (error) {
    onError(error);
    return false;
  }
};
/**
 * @summary enables tracked trigger
 * @param {{
 *  funcName : string,
 *  onError? : (err : Error) => void
 * }}
 * @returns {boolean}
 */


var enableTracked = function enableTracked(_ref2) {
  var funcName = _ref2.funcName,
      type = _ref2.type,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError;

  try {
    var info = getTrackedTriggerInfo({
      funcName: funcName,
      type: type
    });

    if (!info) {
      return false;
    }

    var enabled = info.enabled,
        rest = _objectWithoutProperties(info, ["enabled"]);

    if (enabled) {
      return true;
    }

    var record = infoToRecord_(_objectSpread(_objectSpread({}, rest), {}, {
      enabled: true
    }));
    var id = info.id;
    return updateTrackedTriggerInfo({
      id: id,
      record: record,
      onError: onError
    });
  } catch (error) {
    onError(error);
    return false;
  }
};
"use strict";

var Dependencies_ = {
  properties: null
};

var use = function use(service) {
  if ("getScriptProperties" in service) {
    Dependencies_.properties = service;
  }
};
"use strict";

/// <reference types="../index" />
var installTrigger_ = function installTrigger_(_ref) {
  var _ref$unique = _ref.unique,
      unique = _ref$unique === void 0 ? false : _ref$unique,
      type = _ref.type,
      onError = _ref.onError,
      onInstall = _ref.onInstall,
      onInstallFailure = _ref.onInstallFailure,
      installer = _ref.installer,
      callbackName = _ref.callbackName;

  if (unique) {
    var alreadyInstalled = getTrackedTriggerInfo({
      funcName: callbackName,
      type: type
    });

    if (alreadyInstalled) {
      return null;
    }
  }

  var installed = installer({
    callbackName: callbackName,
    onError: onError
  });

  if (installed && isTrackingTriggers()) {
    trackTrigger(installed);
  }

  installed ? onInstall(installed) : onInstallFailure({
    callbackName: callbackName,
    type: type,
    unique: unique
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


var TriggerTypes = function (e) {
  var _ScriptApp = ScriptApp,
      _ScriptApp$EventType = _ScriptApp.EventType,
      CLOCK = _ScriptApp$EventType.CLOCK,
      ON_EDIT = _ScriptApp$EventType.ON_EDIT,
      ON_CHANGE = _ScriptApp$EventType.ON_CHANGE,
      ON_FORM_SUBMIT = _ScriptApp$EventType.ON_FORM_SUBMIT;
  e[e.CLOCK = "clock"] = CLOCK;
  e[e.EDIT = "edit"] = ON_EDIT;
  e[e.CHANGE = "change"] = ON_CHANGE;
  e[e.SUBMIT = "submit"] = ON_FORM_SUBMIT;
  return e;
}({});
/**
 * @summary finds or installs a self-rescheduling trigger
 * @param {GoogleAppsScript.Triggers.TriggerInstallOptions}
 */


var getOrInstallSelfRescheduling_ = function getOrInstallSelfRescheduling_(_ref2) {
  var callbackName = _ref2.callbackName,
      id = _ref2.id,
      installer = _ref2.installer,
      installerConfig = _ref2.installerConfig,
      _ref2$unique = _ref2.unique,
      unique = _ref2$unique === void 0 ? false : _ref2$unique,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError;

  try {} catch (error) {
    onError(error);
  }
};
/**
 * @summary gets ore installs a trigger
 * @param {GoogleAppsScript.Triggers.TriggerInstallOptions}
 */


var getOrInstallTrigger = function getOrInstallTrigger() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref3$unique = _ref3.unique,
      unique = _ref3$unique === void 0 ? false : _ref3$unique,
      callbackName = _ref3.callbackName,
      id = _ref3.id,
      installer = _ref3.installer,
      _ref3$installerConfig = _ref3.installerConfig,
      installerConfig = _ref3$installerConfig === void 0 ? {} : _ref3$installerConfig,
      _ref3$onError = _ref3.onError,
      onError = _ref3$onError === void 0 ? console.warn : _ref3$onError,
      _ref3$onInstall = _ref3.onInstall,
      onInstall = _ref3$onInstall === void 0 ? function (trg) {
    return console.log("installed: ".concat(trg.getHandlerFunction()));
  } : _ref3$onInstall,
      _ref3$onInstallFailur = _ref3.onInstallFailure,
      onInstallFailure = _ref3$onInstallFailur === void 0 ? function (msg) {
    return console.warn("failed to install trigger: ".concat(msg));
  } : _ref3$onInstallFailur,
      _ref3$onGet = _ref3.onGet,
      onGet = _ref3$onGet === void 0 ? function (trg) {
    return console.log("found handler: ".concat(trg.getHandlerFunction()));
  } : _ref3$onGet,
      _ref3$type = _ref3.type,
      type = _ref3$type === void 0 ? TriggerTypes.CLOCK : _ref3$type;

  try {
    var triggers = ScriptApp.getProjectTriggers();
    var installersMap = new Map([[TriggerTypes.SUBMIT, formSubmitTriggerInstaller(installerConfig)], [TriggerTypes.CHANGE, changeTriggerInstaller(installerConfig)], [TriggerTypes.CLOCK, timedTriggerInstaller(installerConfig)], [TriggerTypes.EDIT, editTriggerInstaller(installerConfig)]]);
    var filter = makeTriggerFilter_({
      id: id,
      type: type,
      funcName: callbackName
    });
    var oldTrigger = triggers.find(filter);
    console.log({
      oldTrigger: oldTrigger,
      type: type,
      unique: unique,
      installer: installer
    });

    if (oldTrigger) {
      return onGet(oldTrigger);
    }

    return installTrigger_({
      unique: unique,
      type: type,
      installer: installer || installersMap.get(type),
      callbackName: callbackName,
      onInstall: onInstall,
      onInstallFailure: onInstallFailure,
      onError: onError
    });
  } catch (error) {
    onError("error during trigger check ".concat(error));
    return null;
  }
};
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * @typedef {{
 *  funcName : string,
 *  id       : string,
 *  type     : string
 * }} TriggerInfo
 */

/**
 * @summary utility for filtering triggers
 * @param {TriggerInfo}
 */
var makeTriggerFilter_ = function makeTriggerFilter_() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      funcName = _ref.funcName,
      id = _ref.id,
      type = _ref.type;

  return (
    /**
     * @param {GoogleAppsScript.Script.Trigger} trigger
     * @returns {boolean}
     */
    function (trigger) {
      var i = trigger.getUniqueId();
      var f = trigger.getHandlerFunction();
      var t = trigger.getEventType();
      var sameFunc = funcName ? funcName === f : true;
      var sameType = type ? TriggerTypes[type] === t : true;
      var sameId = id ? id === i : false;
      return sameFunc && sameType || sameId;
    }
  );
};
/**
 * @summaryutility for filtering trigger info
 * @param {Partial<TriggerInfo>}
 */


var makeTriggerInfoFilter_ = function makeTriggerInfoFilter_() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      funcName = _ref2.funcName,
      id = _ref2.id,
      type = _ref2.type;

  return (
    /**
     * @param {TriggerInfo} info
     * @returns {boolean}
     */
    function (info) {
      var f = info.funcName,
          i = info.id,
          t = info.type;
      var sameFunc = funcName ? funcName === f : true;
      var sameType = type ? type === t : true;
      var sameId = id ? id === i : true;
      return sameFunc && sameType && sameId;
    }
  );
};
/**
 * @summary lists tracked triggers
 * @returns {TrackedTriggerInfo[]}
 */


var listTrackedTriggers = function listTrackedTriggers() {
  var key = getTrackingPropertyName_();
  var tracked = JSON.parse(getProperty_(key, "{}"));
  return Object.entries(tracked).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        id = _ref4[0],
        record = _ref4[1];

    return recordToInfo_(record, id);
  });
};
/**
 * 
 * @summary lists all available triggers for a user
 * 
 * @param {{
 *  onError?: (err : Error) => void,
 *  safe?   : boolean,
 *  type?   : "project"|"user"
 * }}
 * 
 * @returns {(GoogleAppsScript.Script.Trigger|TriggerInfo)[]}
 */


var listTriggers = function listTriggers() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref5$onError = _ref5.onError,
      onError = _ref5$onError === void 0 ? console.warn : _ref5$onError,
      _ref5$safe = _ref5.safe,
      safe = _ref5$safe === void 0 ? false : _ref5$safe,
      _ref5$type = _ref5.type,
      type = _ref5$type === void 0 ? "project" : _ref5$type;

  try {
    var typeMap = new Map([["project", ScriptApp.getProjectTriggers], ["user", ScriptApp.getUserTriggers]]);
    var params = [];

    if (type === "user") {
      params.push(getActiveDoc_({
        type: type,
        onError: onError
      }));
    }

    var tgs = typeMap.get(type).apply(ScriptApp, params);
    var triggersInfo = safe ? tgs.map(function (tgr) {
      return {
        funcName: tgr.getHandlerFunction(),
        id: tgr.getUniqueId(),
        type: JSON.stringify(tgr.getEventType())
      };
    }) : tgs;
    return triggersInfo;
  } catch (error) {
    onError(error);
    return [];
  }
};
"use strict";

/**
 * @summary default spreadsheet onEdit installer
 */
var editTriggerInstaller = function editTriggerInstaller() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$spreadsheet = _ref.spreadsheet,
      spreadsheet = _ref$spreadsheet === void 0 ? SpreadsheetApp.getActiveSpreadsheet() : _ref$spreadsheet,
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref$onError;

  return function (_ref2) {
    var callbackName = _ref2.callbackName;

    try {
      return ScriptApp.newTrigger(callbackName).forSpreadsheet(spreadsheet).onEdit().create();
    } catch (error) {
      onError("faailed to install edit trigger: ".concat(error));
      return null;
    }
  };
};
/**
 * @summary default spreadsheet onChange installer
 */


var changeTriggerInstaller = function changeTriggerInstaller() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref3$spreadsheet = _ref3.spreadsheet,
      spreadsheet = _ref3$spreadsheet === void 0 ? SpreadsheetApp.getActiveSpreadsheet() : _ref3$spreadsheet,
      _ref3$onError = _ref3.onError,
      onError = _ref3$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref3$onError;

  return function (_ref4) {
    var callbackName = _ref4.callbackName;

    try {
      return ScriptApp.newTrigger(callbackName).forSpreadsheet(spreadsheet).onChange().create();
    } catch (error) {
      onError("failed to install change trigger: ".concat(error));
      return null;
    }
  };
};
/**
 * @summary default spreadsheet onFormSubmit installer
 */


var formSubmitTriggerInstaller = function formSubmitTriggerInstaller() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref5$spreadsheet = _ref5.spreadsheet,
      spreadsheet = _ref5$spreadsheet === void 0 ? SpreadsheetApp.getActiveSpreadsheet() : _ref5$spreadsheet,
      _ref5$onError = _ref5.onError,
      onError = _ref5$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref5$onError;

  return function (_ref6) {
    var callbackName = _ref6.callbackName;

    try {
      return ScriptApp.newTrigger(callbackName).forSpreadsheet(spreadsheet).onFormSubmit().create();
    } catch (error) {
      onError("failed to install form submit trigger: ".concat(error));
      return null;
    }
  };
};
"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var infoToRecord_ = function infoToRecord_(_ref) {
  var funcName = _ref.funcName,
      type = _ref.type,
      enabled = _ref.enabled,
      deleted = _ref.deleted;
  return "".concat(funcName, "/").concat(type, "/").concat(enabled ? "enabled" : "disabled", "/").concat(deleted ? "deleted" : "");
};
/**
 * @typedef {{
 *  deleted  : boolean,
 *  enabled  : boolean,
 * } & TriggerInfo} TrackedTriggerInfo
 * 
 * @param {string} record 
 * @param {string} id
 * @returns {TrackedTriggerInfo} 
 */


var recordToInfo_ = function recordToInfo_(record, id) {
  var _record$split = record.split("/"),
      _record$split2 = _slicedToArray(_record$split, 4),
      funcName = _record$split2[0],
      type = _record$split2[1],
      state = _record$split2[2],
      deleted = _record$split2[3];

  return {
    funcName: funcName,
    type: type,
    id: id,
    enabled: state === "enabled",
    deleted: deleted === "deleted"
  };
};
/**
 * @summary enables trigger tracking
 * @param {{
 *  onError? : (err : Error) => void
 * }} 
 * @returns {boolean}
 */


var trackTriggers = function trackTriggers() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$onAlreadyTracki = _ref2.onAlreadyTracking,
      onAlreadyTracking = _ref2$onAlreadyTracki === void 0 ? function () {
    return console.log("already tracking");
  } : _ref2$onAlreadyTracki,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError,
      _ref2$type = _ref2.type,
      type = _ref2$type === void 0 ? "project" : _ref2$type;

  try {
    if (isTrackingTriggers()) {
      onAlreadyTracking();
      return true;
    }

    var name = getUniquePropName_("triggers");
    var trackingList = {};
    var installedForThisUser = listTriggers({
      onError: onError,
      safe: true,
      type: type
    });
    installedForThisUser.forEach(function (_ref3) {
      var id = _ref3.id,
          info = _objectWithoutProperties(_ref3, ["id"]);

      return trackingList[id] = infoToRecord_(info);
    });
    return setProperty_(name, JSON.stringify(trackingList));
  } catch (error) {
    onError(error);
    return false;
  }
};
/**
 * @summary stops tracking any trigger
 * @param {{
 *   onError? : (err : Error) => void
 * }}
 * @returns {boolean} 
 */


var untrackTriggers = function untrackTriggers() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref4$onError = _ref4.onError,
      onError = _ref4$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref4$onError;

  try {
    var key = getTrackingPropertyName_();
    key && deleteProperty_(key);
    return true;
  } catch (error) {
    onError(error);
    return false;
  }
};
/**
 * @summary adds a trigger to the list of tracked ones
 * @param {GoogleAppsScript.Script.Trigger} trigger 
 * @returns {GoogleAppsScript.Script.Trigger}
 */


var trackTrigger = function trackTrigger(trigger) {
  var key = getTrackingPropertyName_();
  var trackingList = JSON.parse(getProperty_(key, "{}"));
  var id = trigger.getUniqueId();
  var funcName = trigger.getHandlerFunction();
  var type = trigger.getEventType();
  var typeMap = new Map([[ScriptApp.EventType.ON_CHANGE, TriggerTypes.CHANGE], [ScriptApp.EventType.CLOCK, TriggerTypes.CLOCK], [ScriptApp.EventType.ON_EDIT, TriggerTypes.EDIT], [ScriptApp.EventType.ON_FORM_SUBMIT, TriggerTypes.SUBMIT]]);
  var record = infoToRecord_({
    funcName: funcName,
    enabled: true,
    type: typeMap.get(type)
  });
  trackingList[id] = record;
  setProperty_(key, JSON.stringify(trackingList));
  return trackingList;
};
/**
 * @summary untracks a trigger
 * @param {{
 *  onError? : (err : Error) => void,
 *  trigger? : GoogleAppsScript.Script.Trigger
 * }}
 * @returns {boolean}
 */


var untrackTrigger = function untrackTrigger() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      trigger = _ref5.trigger,
      _ref5$onError = _ref5.onError,
      onError = _ref5$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref5$onError;

  try {
    var key = getTrackingPropertyName_();
    var trackingList = JSON.parse(getProperty_(key, "{}"));
    var id = trigger.getUniqueId();
    delete trackingList[id];
    return setProperty_(key, JSON.stringify(trackingList));
  } catch (error) {
    onError(error);
    return false;
  }
};
/**
 * @summary gets tracking property name (matches as the name is unique)
 * @returns {?string}
 */


var getTrackingPropertyName_ = function getTrackingPropertyName_() {
  var store = Dependencies_.properties.getScriptProperties();
  return store.getKeys().find(function (k) {
    return /triggers\//.test(k);
  });
};
/**
 * @summary checks if triggers are tracked
 * @returns {boolean}
 */


var isTrackingTriggers = function isTrackingTriggers() {
  return !!getTrackingPropertyName_();
};
/**
 * @summary gets tracked trigger info
 * @param {TriggerInfo}
 * @returns {TrackedTriggerInfo}
 */


var getTrackedTriggerInfo = function getTrackedTriggerInfo(_ref6) {
  var funcName = _ref6.funcName,
      type = _ref6.type,
      _ref6$tracked = _ref6.tracked,
      tracked = _ref6$tracked === void 0 ? listTrackedTriggers() : _ref6$tracked;
  return tracked.find(function (_ref7) {
    var f = _ref7.funcName,
        t = _ref7.type;
    return funcName !== void 0 ? funcName === f : true && type !== void 0 ? type === t : true;
  });
};
/**
 * @summary updates tracked trigger info
 * @param {{
 *  id       : string,
 *  record   : string,
 *  onError? : (err : Error) => void
 * }}
 * @returns {boolean}
 */


var updateTrackedTriggerInfo = function updateTrackedTriggerInfo(_ref8) {
  var id = _ref8.id,
      record = _ref8.record,
      _ref8$onError = _ref8.onError,
      onError = _ref8$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref8$onError;

  try {
    var key = getTrackingPropertyName_();
    var trackingList = JSON.parse(getProperty_(key, "{}"));
    trackingList[id] = record;
    setProperty_(key, JSON.stringify(trackingList));
    return true;
  } catch (error) {
    onError(error);
    return false;
  }
};
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var DocTypes = function (e) {
  e[e.SPREADSHEET = "spreadsheet"] = 0;
  e[e.PRESENTATION = "presentation"] = 0;
  e[e.FORM = "form"] = 0;
  e[e.DOCUMENT = "document"] = 0;
  return e;
}({});

var isCorrectUIgetter_ = function isCorrectUIgetter_(getter) {
  try {
    return !!getter();
  } catch (error) {
    return false;
  }
};

var getActiveDoc_ = function getActiveDoc_() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? DocTypes.SPREADSHEET : _ref$type,
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? console.warn : _ref$onError;

  var ActiveDocMap = new Map();
  ActiveDocMap.set(DocTypes.DOCUMENT, DocumentApp.getActiveDocument);
  ActiveDocMap.set(DocTypes.FORM, FormApp.getActiveForm);
  ActiveDocMap.set(DocTypes.SPREADSHEET, SpreadsheetApp.getActiveSpreadsheet);
  ActiveDocMap.set(DocTypes.PRESENTATION, SlidesApp.getActivePresentation);
  var getter = ActiveDocMap.get(type);

  try {
    var valid = isCorrectUIgetter_(getter) ? getter : _toConsumableArray(ActiveDocMap.values()).find(isCorrectUIgetter_);
    return valid();
  } catch (error) {
    onError(error);
    return null;
  }
};

var closestValue = function closestValue() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!("value" in settings)) {
    return null;
  }

  var value = settings.value,
      _settings$values = settings.values,
      values = _settings$values === void 0 ? [] : _settings$values;

  if (!values.length) {
    return null;
  }

  var closestIndex = 0,
      currClosest = Math.abs(value - values[0]);
  values.forEach(function (val, i) {
    var diff = Math.abs(value - val);

    if (currClosest > diff) {
      closestIndex = i;
      currClosest = diff;
    }
  });
  return values[closestIndex];
};

var getProperty_ = function getProperty_(key, def) {
  var store = Dependencies_.properties.getScriptProperties();
  var prop = store.getProperty(key);
  return prop || def;
};

var getUniquePropName_ = function getUniquePropName_(key) {
  var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Dependencies_.properties.getScriptProperties();
  var names = store.getKeys();
  var uniqueName = "".concat(key, "/").concat(Utilities.getUuid());

  while (names.includes(uniqueName)) {
    uniqueName = getUniquePropName_(key, store);
  }

  return uniqueName;
};

var setProperty_ = function setProperty_(key, val) {
  try {
    var store = Dependencies_.properties.getScriptProperties();
    store.setProperty(key, val);
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
};

var deleteProperty_ = function deleteProperty_(key) {
  try {
    var store = Dependencies_.properties.getScriptProperties();
    store.deleteProperty(key);
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
};
