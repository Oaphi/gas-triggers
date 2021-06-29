type CommonSheetsInstallerOptions = {
    spreadsheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
};

type EditInstallerOptions = ErrLoggable<CommonSheetsInstallerOptions>;

type ChangeInstallerOptions = ErrLoggable<CommonSheetsInstallerOptions>;

type FormSubmitInstallerOptions = ErrLoggable<CommonSheetsInstallerOptions>;

/**
 * @summary default spreadsheet onEdit installer
 */
const editTriggerInstaller =
    ({
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
        onError = (err) => console.warn(err),
    }: EditInstallerOptions = {}) =>
    ({ callbackName }: CommonInstallOptions) => {
        try {
            return ScriptApp.newTrigger(callbackName)
                .forSpreadsheet(spreadsheet)
                .onEdit()
                .create();
        } catch (error) {
            onError(`failed to install edit trigger: ${error}`);
            return null;
        }
    };

/**
 * @summary default spreadsheet onChange installer
 */
const changeTriggerInstaller =
    ({
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
        onError = (err) => console.warn(err),
    }: ChangeInstallerOptions = {}) =>
    ({ callbackName }: CommonInstallOptions) => {
        try {
            return ScriptApp.newTrigger(callbackName)
                .forSpreadsheet(spreadsheet)
                .onChange()
                .create();
        } catch (error) {
            onError(`failed to install change trigger: ${error}`);
            return null;
        }
    };

/**
 * @summary default spreadsheet onFormSubmit installer
 */
const formSubmitTriggerInstaller =
    ({
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
        onError = (err) => console.warn(err),
    }: FormSubmitInstallerOptions = {}) =>
    ({ callbackName }: CommonInstallOptions) => {
        try {
            return ScriptApp.newTrigger(callbackName)
                .forSpreadsheet(spreadsheet)
                .onFormSubmit()
                .create();
        } catch (error) {
            onError(`failed to install form submit trigger: ${error}`);
            return null;
        }
    };
