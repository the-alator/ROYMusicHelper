window.zaycevNetSource = {};
{
    zaycevNetSource.name = "zaycev.net";
    zaycevNetSource.baseSearchUrl = "http://zaycev.net/search.html?query_search=";
    zaycevNetSource.baseSongPageUrl = "http://zaycev.net";
    zaycevNetSource.requestMethod = "GET";

    zaycevNetSource.processTitle = function(title, cycle){
        console.log("In process title zaycevNet");
        this.processSearchPage(title, cycle);
    };
    zaycevNetSource.processSearchPage = function(title, cycle){
        let xhr = new XMLHttpRequest();
        let url = zaycevNetSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(zaycevNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload zaycev.net searchPage start");
            let song = xhr.response.querySelector(".musicset-track__title.track-geo__title .musicset-track__track-name a");

            if(song == undefined){
                console.log("song - " + song);
                cycle.next();
                return;
            }

            let songPageUrl = zaycevNetSource.baseSongPageUrl + song.getAttribute("href");
            console.log("song page url - " + songPageUrl);

            zaycevNetSource.processSongPage(songPageUrl, cycle);
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR searchPage");
            cycle.next();
        };

        xhr.send();
    };

    zaycevNetSource.processSongPage = function(url, cycle){
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open(zaycevNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload zaycev.net songPage start");
            let songDownload = xhr.response.querySelector("a.button-download__link");

            if(songDownload == undefined){
                cycle.next();
                return;
            }

            let downloadUrl = songDownload.getAttribute("href");
            console.log("song download url - " + downloadUrl);

            if(!downloadFile(downloadUrl)){
                cycle.next();
            }
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR songPage");
            cycle.next();
        };

        xhr.send();
    };

    registerSource(zaycevNetSource);
}

