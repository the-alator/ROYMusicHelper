// setTimeout(function () {
$(document).ready(function () {
    console.log("READY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    $(".main").on("DOMSubtreeModified", function(event){
        $(".main").off("DOMSubtreeModified");
        setButtons();
        $(".shz-frame-myshazam-shazams").on("DOMSubtreeModified", function(e){logtarget("DOMSubtreeModified .active", e);});
    });
});

// }, 2000);

function setButtons(){
    logme("buttons set");
    $("article.shz-partial-track div.details").after("<button data-shz-beacon=\"type=btn,providerdesc=overflow-click\" class=\"ROYMusicHelperDownloadButton popup-btn\"><img alt='download' src='" + chrome.runtime.getURL("resources/images/general/download.jpg") + "'></button>");
    $(".ROYMusicHelperDownloadButton").click(function (event) {
        event.stopImmediatePropagation();
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
