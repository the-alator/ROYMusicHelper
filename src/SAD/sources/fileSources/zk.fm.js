window.zkFmSource = {};
{
    zkFmSource.name = "zk.fm";
    zkFmSource.baseSearchUrl = "http://zk.fm/mp3/search?keywords=";
    zkFmSource.baseDownloadUrl = "http://zk.fm";
    zkFmSource.requestMethod = "GET";

    zkFmSource.processTitle = function(title, cycle){
        console.log("In process title zk.fm");
        this.processSearchPage(title, cycle);
    };
    zkFmSource.processSearchPage = function(title, cycle){
        let xhr = new XMLHttpRequest();
        let url = zkFmSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(zkFmSource.requestMethod, url, true);

        installZkFmDownloadFrameIfAbsent();

        xhr.onload = function() {
            console.log("XHR onload zk.fm searchPage start");
            let song = xhr.response.querySelector("#container .songs-list .song.song-xl .song-menu .song-download.btn4.download");

            if(song == undefined){
                console.log("song undefined");
                cycle.next();
                return;
            }

            let url = zkFmSource.baseDownloadUrl + song.getAttribute("data-url");

            zkFmDownloadFrame.contentWindow.postMessage(url, "*");
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR searchPage");
            cycle.next();
        };

        xhr.send();
    };

    zkFmSource.processDownload = function(url){

    }

    registerSource(zkFmSource);
}

