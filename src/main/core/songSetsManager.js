const LIMIT_OF_SONGS_IN_LIST = 10;

function SongSetsManager(textCleaner, downloadManager) {

    this.process = function(title, songsSetsList) {
        this.reduceAmountOfSongs(songsSetsList);
        this.cleanAllSongs(songsSetsList);
        this.compareAllSongsToTitle(title, songsSetsList);
        let songsList = this.getSortedSongsList(songsSetsList);
        downloadManager.process(songsList);
    };

    this.reduceAmountOfSongs = function(songsSetsList) {
        for(let i = 0; i < songsSetsList.length(); i++) {
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
        songsSetsList.forEach(function (songSet) {
            songSet.forEach(function (song) {
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