function SourceManager() {
    let supportedSources = [];

    this.registerSource = function(object) {
        log.debug("Registered source " + object.name);
        supportedSources.push(object);
    };

    this.getSupportedSources  = function() {
        return supportedSources;
    };

}

module.exports = SourceManager;