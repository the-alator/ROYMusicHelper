const log = require("../../../extension/additional/logger");

function AsyncController(clean, sourceManager) {
    this.processTitle = function(title, sourceResponseAccumulator) {
        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseAccumulator);
        });

    }
}

module.exports = AsyncController;
