const log = require("../../extension/additional/logger");
const SongSource = require("./songSource");

function ZkFmSource() {
    SongSource.call(this);

    const zkFmSource = this;

    this.name = "zk.fm";
    this.baseSearchUrl = "http://z1.fm/mp3/search?keywords=";
    this.baseSongPageUrl = "http://z1.fm";

    this.getSongsList = function (data) {
        let songs = [];
        $(data).find(".song.song-xl").each(function () {
            let songContentElement = $(this).children(".song-content");

            let title = songContentElement.find(".song-artist span").text() + " " +
                songContentElement.find(".song-name span").text();

            songs.push({
                source: zkFmSource,
                pageUrl: $(this).find(".song-download.btn4.download").attr("data-url"),
                title: title
            });
        });

        return songs;
    };

    this.getDownloadUrlForSong = function(song){
        log.debug(`Source ${zkFmSource.name} became fetching the download url`);

        return new Promise(function(resolve, reject) {
            let downloadUrl = zkFmSource.baseSongPageUrl + song.pageUrl;
            if(!downloadUrl) {
                log.debug(`Source ${zkFmSource.name} did not find the download url - ` + song);
                reject(null);
                return;
            }
            log.debug(`Source ${zkFmSource.name} found the download url - ` + downloadUrl);

            resolve(downloadUrl);
        });


    };
}

module.exports = ZkFmSource;