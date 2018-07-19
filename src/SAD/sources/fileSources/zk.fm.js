{
    let zkFmSource = {};

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

        xhr.onload = function() {
            console.log("XHR onload zk.fm searchPage start");
            let song = xhr.response.querySelector("#container .songs-list .song.song-xl .song-menu .song-download.btn4.download");

            if(song == undefined){
                console.log("song undefined");
                cycle.next();
                return;
            }

            let downloadUrl = zkFmSource.baseDownloadUrl + $(song).attr("data-url");
            console.log("downloadUrl - " + downloadUrl);
            console.log("iframe created and inserted");

            $("<iframe>").attr("src", downloadUrl).appendTo("body");

            // if(!downloadFile("http://dll.zk.fm/music/7/fe/dzidzo_dzidzio_-_ja_i_sara_(zf.fm).mp3?download=force")){
            //     console.log("[ERROR]: cant download file from zk.fm");
            //     cycle.next();
            // }
            // //
            // if(!downloadFile("http://zk.fm/ajax/inc/9408228")){
            //     console.log("[ERROR]: cant download file from zk.fm");
            //     cycle.next();
            // }
            //
            // zkFmSource.processSongPage(downloadUrl, cycle);

            // $iframe = $("<iframe>").attr("style", "text-indent:-9999px;border:none;width:0px;height:0px;visibility:hidden;").attr("src", downloadUrl).appendTo(song);

            // zkFmSource.processSongPage(songPageUrl, cycle);

            // http://zk.fm/download/9408228
            // http://zk.fm/ajax/inc/9408228
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR searchPage");
            cycle.next();
        };

        xhr.send();
    };

    zkFmSource.processSongPage = function(url, cycle){
        console.log("EDIT");
        xhr = new XMLHttpRequest();

        xhr.responseType = "blob";
        xhr.open("GET", "http://zk.fm/ajax/inc/9408228", true);

        xhr.onload = function() {
            console.log("XHR onload AAAA.net songPage start");

        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR songPage");

        };

        xhr.send();
    };

    registerSource(zkFmSource);
}

