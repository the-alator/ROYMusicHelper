$(function () {
    console.log("READY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    $(".download-btn-link").after($("<div>").addClass("download-btn-link").css("cursor", "pointer").click(function () {
        let href = "http://mp3party.net" + $(this).parent().children(".name").children("a").attr("href");
        chrome.runtime.sendMessage({action: "processSongPage", value: href, windowObject: "mp3partyNetSource"});
    })).remove();
});

function setButtons(){
    logme("buttons set");
    $("article.shz-partial-track div.details").after("<button  class=\"ROYMusicHelperDownloadButton popup-btn\"><img alt='download' src='" + chrome.runtime.getURL("resources/images/general/download.png") + "'></button>");
    //data-shz-beacon="type=btn,providerdesc=overflow-click"
    $(".ROYMusicHelperDownloadButton").click(function (event) {
        console.log("DOWNLOAD BUTTON CLICKED");
        event.stopImmediatePropagation();

        let detailsDOM = $(event.target).parent().children(".details");
        let title = $(detailsDOM).find(".title .ellip").text();
        let author = $(detailsDOM).find(".artist .ellip").text();

        console.log("event.target");
        console.log(event.target);
        console.log("detailsDOM: ");
        console.log(detailsDOM);
        console.log("title: " + title);
        console.log("author: " + author);

        let text = title + " " + author;
        console.log("TEXT: " + text);

    });
}
