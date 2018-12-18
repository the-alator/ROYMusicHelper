const log = require("../../../extension/additional/logger");

function AsyncController(clean, sourceManager) {
    this.processTitle = function(title, sourceResponseAccumulator) {
        log.debug("Title before clean: " + title);
        title = clean(title);
        log.debug("Title after clean: " + title);

        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseAccumulator);
        });

    }
}

module.exports = AsyncController;
