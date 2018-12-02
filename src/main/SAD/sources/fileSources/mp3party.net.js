window.mp3partyNetSource = {};
{
    mp3partyNetSource.name = "mp3party.net";
    mp3partyNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    mp3partyNetSource.baseSongPageUrl = "http://mp3party.net";
    mp3partyNetSource.requestMethod = "GET";

    mp3partyNetSource.getSongListByTitle = function(title, responseManager){
        $.get(mp3partyNetSource.baseSearchUrl + encodeURIComponent(title))
            .done(function () {
                let songs = [];
                $(".song-item a").each(function () {
                    songs.push({
                            source: mp3partyNetSource,
                            url: $(this).attr("href")
                        });
                });
                responseManager.success(songs);
            })
            .fail(function () {
                responseManager.fail();
            });
    };

    mp3partyNetSource.getDownloadUrlForSong = function(song){
        $.get(song.url)
            .done(function () {
            let songs = [];
            $(".song-item a").each(function () {
                songs.push({
                    source: mp3partyNetSource,
                    url: $(this).attr("href")
                });
            });
            responseManager.success(songs);
        })
            .fail(function () {
                responseManager.fail();
            });

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

    sourceManager.registerSource(mp3partyNetSource);
}

