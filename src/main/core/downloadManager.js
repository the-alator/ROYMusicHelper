function DownloadManager() {

    this.process = function (songsList) {
        recurs(songsList, 0);
    };

    function recurs(songsList, index) {
        if(index >= songsList.length()) {
            return;
        }
        song.source.getDownloadUrlForSong(song).then(
            function(url) {
                let downloadResult = downloadFile(url);
                if(!downloadResult) {
                    recurs(songsList, index++);
                }
            }, () => recurs(songsList, index++)
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