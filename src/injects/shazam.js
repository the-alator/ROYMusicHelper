$(document).ready(function () {
    console.log("READY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    $(".main").on("DOMSubtreeModified", function(event){
        $(".main").off("DOMSubtreeModified");
        setButtons();
        $(".shz-frame-myshazam-shazams").on("DOMSubtreeModified", function(e){logtarget("DOMSubtreeModified .active", e);});
    });
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
        chrome.runtime.sendMessage({action: "processTitle", value: text});
    });
}

function logme(text){
    console.log("[EVENT]: " + text);
}

function logtarget(text, event){
    // let classes = "";
    // event.target.classList.
    if(event.target === event.currentTarget){
        setButtons();
        console.log("[EVENT]: " + text + ": " + event.target.tagName + event.currentTarget + event.target.className);

    }
}
