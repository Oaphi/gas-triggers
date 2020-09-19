"use strict";

var timedTriggerInstaller = function timedTriggerInstaller(_ref) {
  var at = _ref.at,
      atHour = _ref.atHour,
      minutely = _ref.minutely,
      hourly = _ref.hourly,
      days = _ref.days,
      weeks = _ref.weeks,
      weekDay = _ref.weekDay,
      _ref$timezone = _ref.timezone,
      timezone = _ref$timezone === void 0 ? Session.getScriptTimeZone() : _ref$timezone;
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
        builder.everyDays(days).atHour(atHour !== void 0 ? atHour : atDate.getHours());
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

      builder.inTimezone(timezone);
      return builder.create();
    } catch (error) {
      console.warn(error);
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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/// <reference types="../index" />
var installTrigger_ = function installTrigger_(_ref) {
  var _ref$unique = _ref.unique,
      unique = _ref$unique === void 0 ? false : _ref$unique,
      installer = _ref.installer,
      callbackName = _ref.callbackName;

  if (unique) {
    var name = getUniquePropName_(callbackName);
    setProperty_(name);
  }

  return installer({
    callbackName: callbackName
  });
};

var checkInstalledTrigger = function checkInstalledTrigger() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      callbackName = _ref2.callbackName,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError,
      _ref2$type = _ref2.type,
      type = _ref2$type === void 0 ? ScriptApp.EventType.CLOCK : _ref2$type;

  try {} catch (error) {}
};

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
      onError = _ref3$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref3$onError,
      _ref3$onGet = _ref3.onGet,
      onGet = _ref3$onGet === void 0 ? function (trigger) {
    return console.log("found trigger: ".concat(trigger.getHandlerFunction()));
  } : _ref3$onGet,
      _ref3$type = _ref3.type,
      type = _ref3$type === void 0 ? ScriptApp.EventType.CLOCK : _ref3$type;

  try {
    var triggers = ScriptApp.getProjectTriggers();
    var installersMap = new Map([[ScriptApp.EventType.CLOCK, timedTriggerInstaller(installerConfig)]]);

    var _triggers$filter = triggers.filter(function (trigger) {
      var sameId = id ? trigger.getUniqueId() : true;
      var sameType = type ? trigger.getEventType() === type : true;
      var sameFunc = trigger.getHandlerFunction() === callbackName;
      return sameId && sameType && sameFunc;
    }),
        _triggers$filter2 = _slicedToArray(_triggers$filter, 1),
        oldTrigger = _triggers$filter2[0];

    oldTrigger && onGet(oldTrigger);
    var customOrDefaultInstaller = installer || installersMap.get(type) || installer;
    return oldTrigger || installTrigger_({
      unique: unique,
      installer: customOrDefaultInstaller,
      callbackName: callbackName
    });
  } catch (error) {
    onError("error during trigger check ".concat(error));
    return null;
  }
};

var listTriggers = function listTriggers() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref4$onError = _ref4.onError,
      onError = _ref4$onError === void 0 ? console.warn : _ref4$onError,
      _ref4$safe = _ref4.safe,
      safe = _ref4$safe === void 0 ? false : _ref4$safe,
      _ref4$type = _ref4.type,
      type = _ref4$type === void 0 ? "project" : _ref4$type;

  try {
    var typeMap = new Map([["project", ScriptApp.getProjectTriggers], ["user", ScriptApp.getUserTriggers]]);
    var tgs = typeMap.get(type).call(ScriptApp, getActiveDoc_({
      onError: onError
    }));
    return safe ? tgs.map(function (tgr) {
      return {
        funcName: tgr.getHandlerFunction(),
        id: tgr.getUniqueId(),
        type: JSON.stringify(tgr.getEventType())
      };
    }) : tgs;
  } catch (error) {
    onError(error);
    return [];
  }
};
"use strict";

var trackTriggers = function trackTriggers() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$onError = _ref.onError,
      onError = _ref$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref$onError,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? "project" : _ref$type;

  try {
    //get unique name for trigger storage
    var name = getUniquePropName_("triggers"); //initialize it to Object<user : trigger> where trigger is type/callbackName

    var trackingList = {}; //get installed triggers for current user

    var installedForThisUser = listTriggers({
      onError: onError,
      safe: true,
      type: type
    }); //add to tracking list

    installedForThisUser.forEach(function (_ref2) {
      var id = _ref2.id,
          funcName = _ref2.funcName,
          type = _ref2.type;
      return trackingList["".concat(funcName, "/").concat(type)] = id;
    }); //save info

    setProperty_(name, JSON.stringify(trackingList));
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
  var store = PropertiesService.getScriptProperties();
  var prop = store.getProperty(key);
  return prop !== void 0 ? prop : def;
};

var getUniquePropName_ = function getUniquePropName_(key) {
  var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : PropertiesService.getScriptProperties();
  var names = store.getKeys();
  var uniqueName = "".concat(key, "/").concat(Utilities.getUuid());

  while (names.includes(uniqueName)) {
    uniqueName = getUniquePropName_(key, store);
  }

  return uniqueName;
};

var setProperty_ = function setProperty_(key, val) {
  try {
    var store = PropertiesService.getScriptProperties();
    store.setProperty(key, val);
    return true;
  } catch (error) {
    return false;
  }
};
