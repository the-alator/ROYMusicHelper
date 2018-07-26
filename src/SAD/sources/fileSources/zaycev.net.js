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
        let url = zaycevNetSource.baseSearchUrl + encodeURIComponent(title);
        xhr.responseType = "document";
        xhr.open(zaycevNetSource.requestMethod, url, true);

        xhr.onload = function() {
            console.log("XHR onload zaycev.net searchPage start");
            let songs = [];
            let temp;
            $(xhr.response).find(".musicset-track__title.track-geo__title").each(function () {
                temp = {};

                temp.text = $(this).children("musicset-track__artist a").text() + " ";
                temp.text += $(this).children("musicset-track__track-name a").text();
                temp.href = $(this).children("musicset-track__track-name a").attr("href");

                songs.push(temp);
            });

            textComparator.sieve(songs, title);

            if(songs.length === 0){
                console.log("no songs");
                cycle.next();
                return;
            }

            let songsCycle = new AsyncCycle(songs, function (song) {
                let songPageUrl = zaycevNetSource.baseSongPageUrl + song.href;
                console.log("song page url - " + songPageUrl);

                zaycevNetSource.processSongPage(songPageUrl, songsCycle);
            }, function () {
                cycle.next();
            });

            songsCycle.next();


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

