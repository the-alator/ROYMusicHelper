$(".downloadButton").click(function (event) {
    let songInfo = $(this).parent().parent().children(".songInfo");

    let title = songInfo.find(".songName a").text() + " " +
        songInfo.find(".artistName a").text();

    chrome.runtime.sendMessage({action: "getSongListByTitle", value: title});
});