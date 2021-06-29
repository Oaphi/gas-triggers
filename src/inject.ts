class DependencyError extends Error {
    constructor(dep: string | ((...args: any[]) => any)) {
        super(
            `missing dependency "${typeof dep === "string" ? dep : dep.name}"`
        );
    }
}

const Dependencies_: {
    properties: GoogleAppsScript.Properties.PropertiesService | null;
} = {
    properties: null,
};

const use = (service: GoogleAppsScript.Properties.PropertiesService) => {
    if ("getScriptProperties" in service) Dependencies_.properties = service;
};

Object.assign(this, { use, DependencyError });
