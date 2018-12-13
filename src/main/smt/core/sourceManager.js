const log = require("../../extension/additional/logger");

function SourceManager() {
    let supportedSources = [];

    this.registerSource = function(object) {
        log.debug("Registered source " + object.name);
        supportedSources.push(object);
    };

    this.getSupportedSources  = function() {
        return supportedSources;
    };

    this.getNumberOfSources = function () {
        return supportedSources.length;
    }

}

module.exports = SourceManager;