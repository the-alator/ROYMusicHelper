const log = require("../extension/additional/logger");

const LIMIT_OF_SONGS_IN_LIST = 10;

function SourceResponseProcessor(textCleaner, downloadManager) {

    this.process = function(title, songsSetsList) {
        log.debug("Start of process");
        log.trace("songsSetsList: " + JSON.stringify(songsSetsList));

        this.reduceAmountOfSongs(songsSetsList);
        this.cleanAllSongs(songsSetsList);
        this.compareAllSongsToTitle(title, songsSetsList);
        let songsList = this.getSortedSongsList(songsSetsList);

        log.debug("processing has ended");
        log.trace("filtered and sorted songs: " + JSON.stringify(songsList));

        downloadManager.process(songsList);
    };

    this.reduceAmountOfSongs = function(songsSetsList) {
        for(let i = 0; i < songsSetsList.length; i++) {
            songsSetsList[i] = songsSetsList[i].slice(0, LIMIT_OF_SONGS_IN_LIST);
        }
    };

    this.cleanAllSongs = function(songsSetsList) {
        songsSetsList.forEach(function (songSet) {
            songSet.forEach(function (song) {
                song.title = textCleaner.clean(song.title);
            })
        })
    };

    this.compareAllSongsToTitle = function(title, songsSetsList) {
        log.trace("compareAllSongsToTitle title - " + title);
        songsSetsList.forEach(function (songSet) {
            songSet.forEach(function (song) {
                log.trace("compareAllSongsToTitle song title - " + song.title);
                song.similarity = compareTwoStrings(song.title, title);
            })
        })
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

module.exports = SourceResponseProcessor;