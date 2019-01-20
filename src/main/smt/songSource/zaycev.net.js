const log = require("../../extension/additional/logger");
const SongSource = require("./songSource");

function ZaycevNetSource() {
    SongSource.call(this);

    const zaycevNetSource = this;

    this.name = "zaycev.net";
    this.baseSearchUrl = "http://zaycev.net/search.html?query_search=";
    this.baseSongPageUrl = "http://zaycev.net";

    this.getSongsList = function(data) {
        let songs = [];
        $(data).find(".musicset-track__title.track-geo__title").each(function () {
            let title = $(this).find(".musicset-track__artist a").text() + " " +
                $(this).find(".musicset-track__track-name a").text();

            songs.push({
                source: zaycevNetSource,
                pageUrl: $(this).find(".musicset-track__track-name a").attr("href"),
                title: title
            });
        });

        return songs;
    };

    this.getDownloadUrl = function(data) {
        return $(data).find("a.button-download__link").attr("href");
    }

}

module.exports = ZaycevNetSource;
