{
    let zaycevNetSource = {};

    zaycevNetSource.name = "zaycev.net";
    // zaycevNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    zaycevNetSource.baseSearchUrl = "http://zaycev.net/pages/43314/4331498.shtml";
    zaycevNetSource.baseDownloadUrl = "http://dl1.mp3party.net/download/";
    zaycevNetSource.requestMethod = "GET";

    zaycevNetSource.processTitle = function(title, cycle){
        console.log("In process title of zaycev.net");
        let xhr = new XMLHttpRequest();
        let url = zaycevNetSource.baseSearchUrl; // + title;
        xhr.responseType = "document";
        xhr.open(zaycevNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload zaycev.net start");
            let song = xhr.response.querySelector(".song-item a");

            if(song === undefined){
                return undefined;
            }

            let href = song.getAttribute("href");

            console.log("song page url - " + href);
            href = href.substring(href.lastIndexOf("/") + 1, href.length);
            console.log("song id will be used later - " + href);

            let downloadUrl = zaycevNetSource.baseDownloadUrl + href;
            console.log("XHR onload end. SEARCH URL - " + url + " " + "  DOWNLOAD URL - " + downloadUrl);

            if(!downloadFile(downloadUrl)){
                cycle.next();
            }
        };

        xhr.onerror = function() {
            // Error code goes here.
            alert(200);
        };

        xhr.send();
    };

    registerSource(zaycevNetSource);
}