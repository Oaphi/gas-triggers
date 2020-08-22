"use strict";

/**
 * @typedef {{
 *  at : (number|string|Date|undefined),
 *  days : (number|undefined),
 *  hourly : (number|undefined),
 *  minutely : (number|undefined),
 *  weeks : (number|undefined),
 *  weekDay : (GoogleAppsScript.Base.Weekday|undefined),
 *  timezone : string
 * }} TimedTriggerInstallConfig
 * 
 * @param {TimedTriggerInstallConfig} 
 */
var timedTriggerInstaller = function timedTriggerInstaller(_ref) {
  var at = _ref.at,
      minutely = _ref.minutely,
      hourly = _ref.hourly,
      days = _ref.days,
      weeks = _ref.weeks,
      weekDay = _ref.weekDay,
      _ref$timezone = _ref.timezone,
      timezone = _ref$timezone === void 0 ? Session.getScriptTimeZone() : _ref$timezone;
  return (
    /**
     * @param {{
     *  callbackName : string
     * }}
     * @returns {GoogleAppsScript.Script.Trigger}
     */
    function (_ref2) {
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

        if (hourly && !at && !minutely) {
          builder.everyHours(hourly);
        }

        if (!hourly && at && !minutely) {
          builder.at(new Date(at));
        }

        if (days && !weeks) {
          var atDate = new Date(at || Date.now());
          builder.everyDays(days).atHour(atDate.getHours());
        }

        if (weekDay && !weeks) {
          builder.onWeekDay(weekDay);
        }

        if (weeks) {
          builder.everyWeeks(weeks).onWeekDay(weekDay || ScriptApp.WeekDay.SUNDAY);
        }

        builder.inTimezone(timezone);
        return builder.create();
      } catch (error) {
        console.warn(error);
      }
    }
  );
};
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
var getOrInstallTrigger = function getOrInstallTrigger() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      callbackName = _ref.callbackName,
      id = _ref.id,
      installer = _ref.installer,
      _ref$installerConfig = _ref.installerConfig,
      installerConfig = _ref$installerConfig === void 0 ? {} : _ref$installerConfig,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? ScriptApp.EventType.CLOCK : _ref$type;

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
        trigger = _triggers$filter2[0];

    trigger && console.log("found trigger: ".concat(trigger.getHandlerFunction()));
    var customOrDefaultInstaller = installer || installersMap.get(type) || installer;
    return trigger || customOrDefaultInstaller({
      callbackName: callbackName
    });
  } catch (error) {
    console.warn("error during trigger check ".concat(error));
    return null;
  }
};
"use strict";

/**
 * @typedef {{
 *  value : any,
 *  values : any[]
 * }} ClosestConfig
 * 
 * @summary finds closest value in the array
 * @param {ClosestConfig} [config]
 */
var closestValue = function closestValue() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!("value" in config)) {
    return null;
  }

  var value = config.value,
      _config$values = config.values,
      values = _config$values === void 0 ? [] : _config$values;

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
