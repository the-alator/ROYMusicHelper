const log = require("../../extension/additional/logger");
const textCleaner = require("./util/textCleaner");
const compareTwoStrings = require("../../../../lib/compare-strings").compareTwoStrings;


function SourceResponseTransformer() {

    this.transformList = function(title, songsList) {
        log.debug("Start of transforming");
        log.trace("songsList: " + log.pjson(songsList));

        this.cleanAllSongs(songsList);
        this.compareAllSongsToTitle(title, songsList);

        log.debug("transforming has ended");
        log.trace("filtered and sorted songs: " + log.pjson(songsList));
    };

    this.processTransformedSongsLists = function(songsLists) {
        let songsList = flattenSongsLists(songsLists);
        this.sort(songsList);
        return songsList;
    };

    this.cleanAllSongs = function(songsList) {
        songsList.forEach(function (song) {
            song.title = textCleaner.clean(song.title);
        });
    };

    this.compareAllSongsToTitle = function(title, songsList) {
        log.trace("compareAllSongsToTitle title - " + title);
        songsList.forEach(function (song) {
            log.trace("compareAllSongsToTitle song title - " + song.title);
            song.similarity = compareTwoStrings(song.title, title);
        });
    };

    this.sort = function(songsList) {
        songsList.sort(function (a, b) {
            if(a.similarity > b.similarity) {
                return -1;
            } else {
                return 1;
            }
        });

    };

    function flattenSongsLists(songsLists) {
        let sortedSongsList = [];
        songsLists.forEach(function (songsList) {
            sortedSongsList = sortedSongsList.concat(songsList);
        });
        return sortedSongsList;
    }
}

module.exports = SourceResponseTransformer;