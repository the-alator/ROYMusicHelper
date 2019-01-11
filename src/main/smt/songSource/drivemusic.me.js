const log = require("../../extension/additional/logger");
const SongSource = require("./songSource");
const ajax = require("../../extension/ajax/ajaxController").ajax;

function DrivemusicMeSource() {
    SongSource.call(this);

    const drivemusicMeSource = this;

    this.name = "drivemusic.me";
    this.baseSearchUrl = "http://drivemusic.me";
    this.baseSongPageUrl = "http://drivemusic.me";

    this.getSongListByTitle = function (title, responseManager) {
        log.debug(`Source ${drivemusicMeSource.name} became fetching the list of songs`);
        let searchPageUrl = drivemusicMeSource.getSearchPageUrl();
        ajax({
            url: searchPageUrl,
            data: {
                'do': 'search',
                'subaction': 'search',
                'story': title
            },
            method: 'GET',
            dataType: "text"
        }).done(function (data) {
            let songs = drivemusicMeSource.getSongsList(data);
            log.debug(`Source ${drivemusicMeSource.name} found ${songs.length} songs`);
            responseManager.success(songs, drivemusicMeSource);
        }).fail(function () {
            responseManager.fail(drivemusicMeSource);
        });

    };

    this.getSearchPageUrl = function () {
        return drivemusicMeSource.baseSearchUrl;
    };

    this.getSongsList = function(data) {
        let songs = [];

        $(data).find(".popular-play-name").each(function () {
            let songNameElement = $(this).children(".popular-play-author");
            let title = $(this).children(".popular-play-composition").text() + " " + songNameElement.text();
            songs.push({
                source: drivemusicMeSource,
                pageUrl: songNameElement.attr("href"),
                title: title
            });
        });

        return songs;
    };


    this.getDownloadUrl = function(data) {
        return $(data).find(".song-author-btn .btn-download").attr("href");
    };

}

module.exports = DrivemusicMeSource;