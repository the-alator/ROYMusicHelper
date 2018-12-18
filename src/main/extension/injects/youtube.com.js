$(function () {
    // $(".main").on("DOMSubtreeModified", function(event){
    //     // $(".main").off("DOMSubtreeModified");
    //     if(event.target !== event.currentTarget){
    //         return;
    //     }
    //     console.log("MAIN modified");
    //     $(".shz-frame-myshazam-shazams").on("DOMSubtreeModified", setButtons);
    // });

    console.log("Content script is running");
    console.log(document);

    setTimeout(function () {
        console.log(JSON.stringify(document));

        console.log("#top-level-buttons: ");
        $("#top-level-buttons").each(function () {
            console.log($(this));
        });

        $("#top-level-buttons").append(
            "<div  class='ROYMusicHelperDownloadButton extension.popup-btn flex-reset'>" +
            "<img alt='download' src='" + chrome.runtime.getURL("resources/images/general/download.png") + "'>" +
            "</div>" +
            ""
        );

        $(".ROYMusicHelperDownloadButton").click(function (event) {
            event.stopImmediatePropagation();

            let detailsDOM = $(event.currentTarget).parent().children(".details");
            let title = $(detailsDOM).find(".title .ellip").text();
            let author = $(detailsDOM).find(".artist .ellip").text();

            let text = title + " " + author;
            chrome.runtime.sendMessage({action: "getSongListByTitle", value: text});
        });
    }, 2000);

});
