$(function () {
    console.log("Content script loaded");

    $(".main").on("DOMSubtreeModified", function(event){
        if(event.target !== event.currentTarget){
            return;
        }
        console.log("MAIN modified");
        $(".shz-frame-myshazam-shazams").on("DOMSubtreeModified", setButtons);
    });
});

let downloadButtonHTML = "<div  class=\"ROYMusicHelperDownloadButton extension.popup-btn flex-reset\"><img alt='download' src='" + chrome.runtime.getURL("resources/images/general/download.png") + "'></div>";

function setButtons(event){
    if(event.target !== event.currentTarget){
        return;
    }
    $("article.shz-partial-track div.details").after(downloadButtonHTML);

    $(".ROYMusicHelperDownloadButton").click(function (event) {
        event.stopImmediatePropagation();

        let detailsDOM = $(event.currentTarget).parent().children(".details");
        let title = $(detailsDOM).find(".title .ellip").text();
        let author = $(detailsDOM).find(".artist .ellip").text();

        let text = title + " " + author;
        chrome.runtime.sendMessage({action: "getSongListByTitle", value: text});
    });
}
