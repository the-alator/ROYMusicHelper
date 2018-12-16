const log = require("../../extension/additional/logger");

const Mp3partyNetSource = require("../../extension/smt/songSource/mp3party.net");

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
    };

    this.registerSource(new Mp3partyNetSource());
}

module.exports = SourceManager;