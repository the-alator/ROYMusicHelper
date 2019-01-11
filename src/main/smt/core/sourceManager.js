const log = require("../../extension/additional/logger");

const Mp3partyNetSource = require("../songSource/mp3party.net");
const ZaycevNetSource = require("../songSource/zaycev.net");
const ZkFmSource = require("../songSource/zk.fm");
const DrivemusicMeSource = require("../songSource/drivemusic.me");

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
    this.registerSource(new ZaycevNetSource());
    this.registerSource(new ZkFmSource());
    this.registerSource(new DrivemusicMeSource());
}

module.exports = SourceManager;