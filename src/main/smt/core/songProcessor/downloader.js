const log = require("../../../extension/additional/logger");

function Downloader() {

    this.process = function (songsList) {
        recurs(songsList, 0);
    };

    function recurs(songsList, index) {
        log.debug("Recursive downloading. Current index: " + index);
        if(index >= songsList.length) {
            log.debug("Now list is empty");
            return;
        }
        songsList[index].source.getDownloadUrlForSong(songsList[index]).then(
            function(url) {
                let downloadResult = downloadFile(url);
                log.debug("downloadResult " + downloadResult);

                if(!downloadResult) {
                    recurs(songsList, index + 1);
                }
            }, () => recurs(songsList, index + 1)
        );
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

}

module.exports = Downloader;
