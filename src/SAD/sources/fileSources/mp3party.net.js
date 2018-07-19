{
    let mp3partyNetSource = {};

    mp3partyNetSource.name = "mp3party.net";
    mp3partyNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    mp3partyNetSource.baseSongPageUrl = "http://mp3party.net";
    mp3partyNetSource.requestMethod = "GET";

    mp3partyNetSource.processTitle = function(title, cycle){
        console.log("In process title mp3party");
        this.processSearchPage(title, cycle);
    };
    mp3partyNetSource.processSearchPage = function(title, cycle){
        let xhr = new XMLHttpRequest();
        let url = mp3partyNetSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(mp3partyNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload mp3party.net searchPage start");
            let song = xhr.response.querySelector(".song-item a");

            if(song == undefined){
                console.log("song - " + song);
                cycle.next();
                return;
            }

            let songPageUrl = mp3partyNetSource.baseSongPageUrl + song.getAttribute("href");
            console.log("song page url - " + songPageUrl);

            mp3partyNetSource.processSongPage(songPageUrl, cycle);
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR searchPage");
            cycle.next();
        };

        xhr.send();
    };

    mp3partyNetSource.processSongPage = function(url, cycle){
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open(mp3partyNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload mp3party.net songPage start");
            let songDownload = xhr.response.querySelector(".download a");

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

    registerSource(mp3partyNetSource);
}

