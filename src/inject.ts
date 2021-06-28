var Dependencies_: {
    properties: GoogleAppsScript.Properties.PropertiesService | null;
} = {
    properties: null,
};

const use = (service: GoogleAppsScript.Properties.PropertiesService) => {
    if ("getScriptProperties" in service) Dependencies_.properties = service;
};
