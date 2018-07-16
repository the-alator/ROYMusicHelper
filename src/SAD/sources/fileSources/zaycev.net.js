{
    let mp3partyNetSource = {};

    mp3partyNetSource.name = "zaycev.net";
    // mp3partyNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    mp3partyNetSource.baseSearchUrl = "http://zaycev.net/pages/43314/4331498.shtml";
    mp3partyNetSource.baseDownloadUrl = "http://dl1.mp3party.net/download/";
    mp3partyNetSource.requestMethod = "GET";

    mp3partyNetSource.processTitle = function(title){
        console.log("In process title of zaycev.net");
        let xhr = new XMLHttpRequest();
        let url = mp3partyNetSource.baseSearchUrl; // + title;
        xhr.responseType = "document";
        xhr.open(mp3partyNetSource.requestMethod, url, true);

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

            let downloadUrl = mp3partyNetSource.baseDownloadUrl + href;
            console.log("XHR onload end. SEARCH URL - " + url + " " + "  DOWNLOAD URL - " + downloadUrl);
            return downloadUrl;
        };

        xhr.onerror = function() {
            // Error code goes here.
            alert(200);
        };

        xhr.send();
    };

    registerSource(mp3partyNetSource);
}