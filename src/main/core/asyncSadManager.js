function AsyncSadManager(songSetsManager, textCleaner) {
    this.processTitle = function(title) {
        log.debug("The title - " + title);
        title = textCleaner.clean(title);
        log.debug("The cleaned title - " + title);
        let sourceResponseManager = new SourceResponseManager(title, songSetsManager);

        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseManager);
        });

    }
}


