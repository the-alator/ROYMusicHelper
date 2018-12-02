function AsyncSadManager() {
    this.processTitle = function(title) {
        let sourceResponseManager = new SourceResponseManager();

        sourceManager.getSupportedSources().forEach(function (source) {
            source.getSongListByTitle(title, sourceResponseManager);
        });

    }
}


