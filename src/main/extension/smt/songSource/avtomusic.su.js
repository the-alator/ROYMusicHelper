const log = require("../../additional/logger");
const SongSource = require("./songSource");

function AvtomusicSuSource() {
    SongSource.call(this);

    const avtomusicSuSource = this;

    this.name = "avtomusic.su";
    this.baseSearchUrl = "http://avtomusic.su";
    this.baseSongPageUrl = "http://avtomusic.su";

    this.getSongListByTitle = function (title, responseManager) {
        log.debug(`Source ${avtomusicSuSource.name} became fetching the list of songs`);
        let searchPageUrl = avtomusicSuSource.getSearchPageUrl();
        $.ajax({
            url: searchPageUrl,
            data: {
                'do': 'search',
                'subaction': 'search',
                'story': title
            },
            method: 'GET',
            dataType: "text"
        }).done(function (data) {
            let songs = avtomusicSuSource.getSongsList(data);
            log.debug(`Source ${avtomusicSuSource.name} found ${songs.length} songs`);
            responseManager.success(songs, avtomusicSuSource);
        }).fail(function () {
            responseManager.fail(avtomusicSuSource);
        });

    };

    this.getSearchPageUrl = function () {
        return avtomusicSuSource.baseSearchUrl;
    };

    this.getSongsList = function(data) {
        let songs = [];

        $(data).find(".main-news-title").each(function () {
            let title = $(this).children("span").text() + " " + $(this).children("i").text();
            songs.push({
                source: avtomusicSuSource,
                pageUrl: $(this).attr("href"),
                title: title
            });
        });

        return songs;
    };

    this.getSongPageUrl = function (song) {
        return song.pageUrl;
    };

    this.getDownloadUrl = function(data) {
        return $(data).find(".song-author-btn .btn-download").attr("href");
    };

}

module.exports = AvtomusicSuSource;