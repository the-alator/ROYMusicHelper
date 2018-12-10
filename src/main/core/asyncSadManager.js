const log4js = require('log4js'); const log = log4js.getLogger();

function AsyncSadManager(songSetsManager, textCleaner) {
    this.processTitle = function(title, sourceResponseManagerR) {
        log.debug("The title - " + title);
        title = textCleaner.clean(title);
        log.debug("The cleaned title - " + title);

        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseManager);
        });

    }
}

module.exports = AsyncSadManager;
