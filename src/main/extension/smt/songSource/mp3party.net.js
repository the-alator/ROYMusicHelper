const log = require("../../additional/logger");

function Mp3partyNetSource() {
    const mp3partyNetSource = this;

    this.name = "mp3party.net";
    this.baseSearchUrl = "http://mp3party.net/search?q=";
    this.baseSongPageUrl = "http://mp3party.net";
    this.requestMethod = "GET";

    this.getSongListByTitle = function(title, responseManager){
        log.debug("Source mp3party.net became fetching the list of songs");
        $.get(mp3partyNetSource.baseSearchUrl + encodeURIComponent(title))
            .done(function (data) {
                let songs = [];
                $(data).find(".song-item a").each(function () {
                    songs.push({
                        source: mp3partyNetSource,
                        pageUrl: $(this).attr("href"),
                        title: $(this).text()
                    });
                });
                log.debug("Source mp3party.net found " + songs.length + " songs");
                responseManager.success(songs, mp3partyNetSource);
            })
            .fail(function () {
                responseManager.fail(mp3partyNetSource);
            });
    };

    this.getDownloadUrlForSong = function(song){
        log.debug("Source mp3party.net became fetching the download url");

        return new Promise(function(resolve, reject) {
            $.get(mp3partyNetSource.baseSongPageUrl + song.pageUrl)
                .done(function (data) {
                    let urlElement = $(data).find(".download a");
                    if(urlElement.size === 0 || !urlElement.attr("href")) {
                        log.debug("Source mp3party.net did not find the download url - " + song);
                        reject(null);
                        return;
                    }
                    log.debug("Source mp3party.net found the download url - " + urlElement.attr("href"));

                    resolve(urlElement.attr("href"));
                })
                .fail(function () {
                    log.debug("Source mp3party.net did not find the download url - " + song);
                    reject(null);
                });
        });

    };

}

module.exports = Mp3partyNetSource;