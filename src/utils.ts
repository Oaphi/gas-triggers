enum DocTypes {
    SPREADSHEET = "spreadsheet",
    PRESENTATION = "presentation",
    FORM = "form",
    DOCUMENT = "document",
}

type DocGetter = () =>
    | GoogleAppsScript.Document.Document
    | GoogleAppsScript.Forms.Form
    | GoogleAppsScript.Spreadsheet.Spreadsheet
    | GoogleAppsScript.Slides.Presentation;

const isCorrectUIgetter_ = (getter: DocGetter) => {
    try {
        return !!getter();
    } catch (error) {
        return false;
    }
};

type ActiveDocOptions = ErrLoggable<{
    type?: DocTypes;
}>;

const getActiveDoc_ = ({
    type = DocTypes.SPREADSHEET,
    onError = console.warn,
}: ActiveDocOptions = {}) => {
    const ActiveDocMap: Map<DocTypes, DocGetter> = new Map();

    ActiveDocMap.set(DocTypes.DOCUMENT, DocumentApp.getActiveDocument);
    ActiveDocMap.set(DocTypes.FORM, FormApp.getActiveForm);
    ActiveDocMap.set(DocTypes.SPREADSHEET, SpreadsheetApp.getActiveSpreadsheet);
    ActiveDocMap.set(DocTypes.PRESENTATION, SlidesApp.getActivePresentation);

    const getter = ActiveDocMap.get(type)!;

    try {
        const valid = isCorrectUIgetter_(getter)
            ? getter
            : [...ActiveDocMap.values()].find(isCorrectUIgetter_)!;
        return valid();
    } catch (error) {
        onError(error);
        return null;
    }
};

type ClosestValueSettings = {
    value?: number;
    values?: number[];
};

/**
 * @since finds the closest value to the given one
 */
const closestValue = ({ value, values = [] }: ClosestValueSettings = {}) => {
    if (typeof value === "undefined") return null;

    if (!values.length) return null;

    let closestIndex = 0,
        currClosest = Math.abs(value - values[0]);

    values.forEach((val, i) => {
        const diff = Math.abs(value - val);

        if (currClosest > diff) {
            closestIndex = i;
            currClosest = diff;
        }
    });

    return values[closestIndex];
};

/**
 * @summary gets a property from storage
 * @private
 */
const getProperty_ = (key: string, def: string) => {
    const { properties } = Dependencies_;
    if (!properties) throw new DependencyError("script properties");
    const store = properties.getScriptProperties();
    const prop = store.getProperty(key);
    return prop || def;
};

/**
 * @summary sets a property to storage
 * @private
 */
const setProperty_ = (key: string, val: string) => {
    try {
        const { properties } = Dependencies_;
        if (!properties) throw new DependencyError("script properties");
        const store = properties.getScriptProperties();
        store.setProperty(key, val);
        return true;
    } catch (error) {
        console.warn(error);
        return false;
    }
};

/**
 * @summary deletes a property from storage
 * @private
 */
const deleteProperty_ = (key: string) => {
    try {
        const { properties } = Dependencies_;
        if (!properties) throw new DependencyError("script properties");
        const store = properties.getScriptProperties();
        store.deleteProperty(key);
        return true;
    } catch (error) {
        console.warn(error);
        return false;
    }
};

/**
 * @summary generates a unique property name
 * @private
 */
const getUniquePropName_ = (
    key: string,
    store?: GoogleAppsScript.Properties.Properties
) => {
    const { properties } = Dependencies_;
    if (!properties) throw new DependencyError("script properties");

    const names = (store || properties.getScriptProperties()).getKeys();

    let uniqueName = `${key}/${Utilities.getUuid()}`;
    while (names.includes(uniqueName)) {
        uniqueName = getUniquePropName_(key, store);
    }

    return uniqueName;
};
