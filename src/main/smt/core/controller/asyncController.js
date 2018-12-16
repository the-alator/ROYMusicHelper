const log = require("../../../extension/additional/logger");

function AsyncController(clean, sourceManager) {
    this.processTitle = function(title, sourceResponseAccumulator) {
        log.debug("The title - " + title);
        title = clean(title);
        log.debug("The cleaned title - " + title);

        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseAccumulator);
        });

    }
}

module.exports = AsyncController;
