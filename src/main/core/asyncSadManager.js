function AsyncSadManager(songSetsManager) {
    this.processTitle = function(title) {
        let sourceResponseManager = new SourceResponseManager(title, songSetsManager);

        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseManager);
        });

    }
}


