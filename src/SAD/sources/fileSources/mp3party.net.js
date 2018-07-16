{
    let mp3partyNetSource = {};

    mp3partyNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    mp3partyNetSource.baseDownloadUrl = "http://dl1.mp3party.net/download/";
    mp3partyNetSource.requestMethod = "GET";

    mp3partyNetSource.processTitle = function(title){
        console.log("In process title mp3party");
        let xhr = new XMLHttpRequest();
        let url = mp3partyNetSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(mp3partyNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload start");
            let song = xhr.response.querySelector(".song-item a");

            if(song === undefined){
                return undefined;
            }

            let href = song.getAttribute("href");
            href = href.substring(href.lastIndexOf("/") + 1, href.length);

            console.log("XHR onload end. SEARCH URL - " + mp3partyNetSource.baseSearchUrl + "  DOWNLOAD URL - " + mp3partyNetSource.baseDownloadUrl + href);
            return mp3partyNetSource.baseDownloadUrl + href;
        };

        xhr.onerror = function() {
            // Error code goes here.
            alert(200);
        };

        xhr.send();
    };

    registerSource(mp3partyNetSource);
}

