var Dependencies_ = {
    properties : null
};

const use = (service) => {
    if ("getScriptProperties" in service) {
        Dependencies_.properties = service;
    }
};