window.mp3partyNetSource = {};
{
    mp3partyNetSource.name = "mp3party.net";
    mp3partyNetSource.baseSearchUrl = "http://mp3party.net/search?q=";
    mp3partyNetSource.baseSongPageUrl = "http://mp3party.net";
    mp3partyNetSource.requestMethod = "GET";

    mp3partyNetSource.getSongListByTitle = function(title, responseManager){
        $.get(mp3partyNetSource.baseSearchUrl + encodeURIComponent(title))
            .done(function (data) {
                let songs = [];
                $(data).find(".song-item a").each(function () {
                    songs.push({
                            source: mp3partyNetSource,
                            pageUrl: $(this).attr("href"),
                            title: $(this).text()
                        });
                });
                responseManager.success(songs);
            })
            .fail(function () {
                responseManager.fail();
            });
    };

    mp3partyNetSource.getDownloadUrlForSong = function(song){
        return new Promise(function(resolve, reject) {
            $.get(song.pageUrl)
                .done(function (data) {
                    let urlElement = $(data).find(".download a");
                    if(urlElement.size() === 0) {
                        reject(null);
                    }
                    resolve(urlElement.attr("href"));
                })
                .fail(function () {
                    reject(null);
                });
        });

    };

    sourceManager.registerSource(mp3partyNetSource);
}

