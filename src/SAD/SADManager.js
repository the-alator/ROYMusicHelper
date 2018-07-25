{
    let supportedSources = [];


    function processTitle(title) {
        console.log("SADMAnager#processTitle before" + title);
        title = encodeURIComponent(title);
        console.log("SADMAnager#processTitle after" + title);
        let cycle = new AsyncCycle(supportedSources, function (source) {
                console.log("Current source - " + source.name);
                source.processTitle(title, this);
        });


        cycle.next()

    }

    function downloadFile(url) {
        console.log("downloadUrl - " + url);
        if (url !== undefined) {
            let downloadError;

            let downloadOpts = {url: url};
            chrome.downloads.download(downloadOpts);


            if (downloadError === undefined) {
                console.log("downloaded!");
                return true;
            }
            console.log("downloading error!");
        }

        return false;

    }

    function registerSource(object) {
        supportedSources.push(object);
    }


}
//SAD means "Search And Download"