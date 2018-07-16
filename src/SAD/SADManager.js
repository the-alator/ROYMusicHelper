{
    let supportedSources = [];


    function processTitle(title) {
        let downloadUrl;
        let downloadError;
        for (let source of supportedSources) {
            downloadUrl = source.processTitle();
            if (downloadUrl !== undefined) {
                downloadError = downloadFile(downloadUrl);

                if (downloadError === undefined) {
                    break;
                }
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