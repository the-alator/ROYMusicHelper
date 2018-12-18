const log = require("../../additional/logger");

function Mp3partyNetSource() {
    const mp3partyNetSource = this;

    this.name = "mp3party.net";
    this.baseSearchUrl = "http://mp3party.net/search?q=";
    this.baseSongPageUrl = "http://mp3party.net";
    this.requestMethod = "GET";

    this.getSongListByTitle = function(title, responseManager){
        log.debug("Source mp3party.net getSongListByTitle with title " + title);
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
            log.error("Source mp3party.net failed");
            responseManager.fail(mp3partyNetSource);
        });
    };

    this.getDownloadUrlForSong = function(song){
        log.debug("Source mp3party.net became fetching the download url");

        return new Promise(function(resolve, reject) {
            $.get(mp3partyNetSource.baseSongPageUrl + song.pageUrl)
                .done(function (data) {
                    let urlElement = $(data).find(".download a");
                    if(urlElement.size === 0) {
                        log.debug("Source mp3party.net did not found the download url - " + song);
                        reject(null);
                    }
                    log.debug("Source mp3party.net found the download url - " + urlElement.attr("href"));

                    resolve(urlElement.attr("href"));
                })
                .fail(function () {
                    log.debug("Source mp3party.net did not found the download url - " + song);
                    reject(null);
                });
        });

    };

}

module.exports = Mp3partyNetSource;