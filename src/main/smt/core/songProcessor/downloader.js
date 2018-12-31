const log = require("../../../extension/additional/logger");

function Downloader() {

    this.processSongsList = async function (songsList) {
        for (const song of songsList) {
            if(await this.processSong(song)) {
                break;
            }
        }
    };

    this.processSong = async function (song) {
        log.trace("Start of processing song " + JSON.stringify(song));
        song.source.getDownloadUrlForSong(song).then(
            function(url) {
                log.trace("Url obtained - " + url);
                let downloadResult = downloadFile(url);
                log.debug("downloadResult " + downloadResult);

                return downloadResult;
            }
        ).catch(() => false);
    };


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
