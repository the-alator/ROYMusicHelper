{
    let supportedSources = [];


    function processTitle(title) {
        let downloadUrl;
        let downloadError;
        console.log("SADManager#processTitle title - " + title);
        for (let source of supportedSources) {
            console.log("Current source - " + source.name);
            downloadUrl = source.processTitle(title);
            console.log("downloadUrl - " + downloadUrl);
            if (downloadUrl !== undefined) {
                downloadError = downloadFile(downloadUrl);
                if (downloadError === undefined) {
                    console.log("downloaded!");
                    break;
                }
                console.log("downloading error!");
            }
        }
    }

    function downloadFile(url) {
        let downloadOpts = {url: url};
        chrome.downloads.download(downloadOpts);
    }

    function registerSource(object) {
        supportedSources.push(object);
    }

}
//SAD means "Search And Download"