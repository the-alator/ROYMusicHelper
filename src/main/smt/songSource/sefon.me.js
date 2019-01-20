const log = require("../../extension/additional/logger");
const SongSource = require("./songSource");

function SefonMeSource() {
    SongSource.call(this);

    const sefonMeSource = this;
    this.name = "sefon.me";
    this.baseSearchUrl = "https://sefon.me/search/?q=";
    this.baseSongPageUrl = "https://sefon.me";

    this.getSongsList = function(data) {
        let songs = [];
        $(data).find(".b_search_info .mp3 .title").each(function () {
            let title = $(this).find(".artist_name mark").text() + " " +
                $(this).find(".song_name mark").text();
            songs.push({
                source: sefonMeSource,
                pageUrl: $(this).find(".song_name a").attr("href"),
                title: title
            });
        });

        return songs;
    };


    this.getDownloadUrl = function(data) {
        console.log(data);
        return $(data).find(".b_btn.download").attr("href");
    }

}

module.exports = SefonMeSource;