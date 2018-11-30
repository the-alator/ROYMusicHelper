function AsyncSadManager() {
    this.processTitle = function(title) {


        console.log("SADMAnager#getSongListByTitle" + title);
        let cycle = new AsyncCycle(supportedSources, function (source) {
            console.log("Current source - " + source.name);
            source.getSongListByTitle(title, this);
        });


        cycle.next()

    }
}


