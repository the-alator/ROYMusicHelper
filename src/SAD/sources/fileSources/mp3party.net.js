{
    let mp3partyNetSource = {};

    mp3partyNetSource.name = "mp3party.net";
    mp3partyNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    mp3partyNetSource.baseDownloadUrl = "http://dl1.mp3party.net/download/";
    mp3partyNetSource.requestMethod = "GET";

    mp3partyNetSource.processTitle = function(title, cycle){
        console.log("In process title mp3party");
        let xhr = new XMLHttpRequest();
        let url = mp3partyNetSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(mp3partyNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload mp3party.net start");
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

    registerSource(mp3partyNetSource);
}

