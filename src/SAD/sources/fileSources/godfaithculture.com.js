{
    let godfaithcultureComSource = {};

    godfaithcultureComSource.name = "godfaithculture.com";
    godfaithcultureComSource.baseSearchUrl = "http://godfaithculture.com/music/";
    godfaithcultureComSource.requestMethod = "GET";

    godfaithcultureComSource.processTitle = function(title, cycle){
        console.log("In process title godfaithculture");
        this.processSearchPage(title, cycle);
    };
    godfaithcultureComSource.processSearchPage = function(title, cycle){
        let xhr = new XMLHttpRequest();
        let url = godfaithcultureComSource.baseSearchUrl + title;
        xhr.responseType = "document";
        xhr.open(godfaithcultureComSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload godfaithculture.com searchPage start");
            let song = xhr.response.querySelector(".actions .ldownload a");

            if(song == undefined){
                cycle.next();
                return;
            }

            let songPageUrl = song.getAttribute("href");
            console.log("song page url - " + songPageUrl);

            godfaithcultureComSource.processSongPage(songPageUrl, cycle);
        };

        xhr.onerror = function() {
            console.log("[ERROR] - XHR searchPage");
            cycle.next();
        };

        xhr.send();
    };

    godfaithcultureComSource.processSongPage = function(url, cycle){
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open(godfaithcultureComSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload godfaithculture.com songPage start");
            let songDownload = xhr.response.querySelector(".knopka.download");

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

    registerSource(godfaithcultureComSource);
}

