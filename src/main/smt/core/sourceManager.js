const log = require("../../extension/additional/logger");

const Mp3partyNetSource = require("../../extension/smt/songSource/mp3party.net");
const ZaycevNetSource = require("../../extension/smt/songSource/zaycev.net");
const ZkFmSource = require("../../extension/smt/songSource/zk.fm");
const DrivemusicMeSource = require("../../extension/smt/songSource/drivemusic.me");

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