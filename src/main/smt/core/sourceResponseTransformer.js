const log = require("../../extension/additional/logger");
const textCleaner = require("./util/textCleaner");
const compareTwoStrings = require("../../../../lib/compare-strings").compareTwoStrings;


function SourceResponseTransformer() {

    this.transformList = function(title, songsList) {
        log.debug("Start of transforming");
        log.trace("songsList: " + JSON.stringify(songsList));

        this.cleanAllSongs(songsList);
        this.compareAllSongsToTitle(title, songsList);
        this.sort(songsList);

        log.debug("transforming has ended");
        log.trace("filtered and sorted songs: " + JSON.stringify(songsList));
    };

    this.processTransformedSongLists = function(songLists) {

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
                return 1;
            } else {
                return -1;
            }
        });

    };

    this.getSortedSongsList = function(songsSetsList) {
        let songsList = [];
        songsSetsList.forEach(function (songSet) {
            songsList = songsList.concat(songSet);
        });
        songsList.sort(function (a, b) {
           if(a.similarity > b.similarity) {
               return 1;
           } else {
               return -1;
           }
        });

        return songsList;
    };

}

module.exports = SourceResponseTransformer;