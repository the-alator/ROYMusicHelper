const log = require("../../extension/additional/logger");

const ajax = require("../../extension/ajax/ajaxController").ajax;

function SongSource() {
    let songSource = this;
    this.name = undefined;
    this.baseSearchUrl = undefined;
    this.baseSongPageUrl = undefined;

    this.getSongListByTitle = function(title, responseManager){
        log.debug(`Source ${songSource.name} became fetching the list of songs`);
        let searchPageUrl = songSource.getSearchPageUrl(title);
        ajax({url: searchPageUrl})
            .done(function (data) {
                let songs = songSource.getSongsList(data);
                log.debug(`Source ${songSource.name} found ${songs.length} songs`);
                responseManager.success(songs, songSource);
            })
            .fail(function () {
                responseManager.fail(songSource);
            });
    };

    this.getSearchPageUrl = function (title) {
        return songSource.baseSearchUrl + encodeURIComponent(title);
    };

    this.getSongsList = undefined;

    this.getDownloadUrlForSong = function(song){
        log.debug(`Source ${songSource.name} became fetching the download url`);

        return new Promise(function(resolve, reject) {
            let songPageUrl = songSource.getSongPageUrl(song);
            $.get(songPageUrl)
                .done(function (data) {
                    let downloadUrl = songSource.getDownloadUrl(data);
                    if(!downloadUrl) {
                        log.debug(`Source ${songSource.name} did not find the download url - ` + song);
                        reject(null);
                        return;
                    }
                    log.debug(`Source ${songSource.name} found the download url - ` + downloadUrl);

                    resolve(downloadUrl);
                })
                .fail(function () {
                    log.debug(`Source ${songSource.name} did not find the download url - ` + song);
                    reject(null);
                });
        });

    };

    this.getSongPageUrl = function (song) {
        return songSource.baseSongPageUrl + song.pageUrl;
    };


    this.getDownloadUrl = undefined;

}

module.exports = SongSource;