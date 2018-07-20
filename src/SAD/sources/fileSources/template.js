window.testSource = {};
{
    testSource.name = "AAAA.net";
    testSource.baseSearchUrl = "http://AAAA.net/search?q=";
    testSource.baseSongPageUrl = "http://AAAA.net";
    testSource.requestMethod = "GET";

    testSource.processTitle = function(title, cycle){
        console.log("In process title AAAA");
        this.processSearchPage(title, cycle);
    };
    testSource.processSearchPage = function(title, cycle){
        let xhr = new XMLHttpRequest();
        let url = testSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(testSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload AAAA.net searchPage start");
            let song = xhr.response.querySelector("XXXX");

            if(song == undefined){
                cycle.next();
                return;
            }

            let songPageUrl = testSource.baseSongPageUrl + song.getAttribute("href");
            console.log("song page url - " + songPageUrl);

            testSource.processSongPage(songPageUrl, cycle);
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR searchPage");
            cycle.next();
        };

        xhr.send();
    };

    testSource.processSongPage = function(url, cycle){
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open(testSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload AAAA.net songPage start");
            let songDownload = xhr.response.querySelector("XXXX");

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

    registerSource(testSource);
}

