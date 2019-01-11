const log = require("../../extension/additional/logger");
const SongSource = require("./songSource");

function Mp3partyNetSource() {
    SongSource.call(this);

    const mp3partyNetSource = this;

    this.name = "mp3party.net";
    this.baseSearchUrl = "http://mp3party.net/search?q=";
    this.baseSongPageUrl = "http://mp3party.net";

    this.getSongsList = function(data) {
        let songs = [];
        $(data).find(".song-item a").each(function () {
            songs.push({
                source: mp3partyNetSource,
                pageUrl: $(this).attr("href"),
                title: $(this).text()
            });
        });

        return songs;
    };


    this.getDownloadUrl = function(data) {
        return $(data).find(".download a").attr("href");
    }

}

module.exports = Mp3partyNetSource;