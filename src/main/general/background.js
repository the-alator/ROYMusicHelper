chrome.runtime.onInstalled.addListener(function() {
    console.log("EXTENSION INSTALLED");

    installZkFmDownloadFrameIfAbsent();
});
let zkFmDownloadFrame;
let downloadIframeSrc = "http://zk.fm/?UNIQUEROYMUSICHELPER=E";
let downloadIframeId = "zkFmDownloadIframe";

function installZkFmDownloadFrameIfAbsent(){
    if($("#" + downloadIframeId).length === 0) {
        console.log("new zk.fm iframe created");
        zkFmDownloadFrame = $("<iframe>").attr("src", downloadIframeSrc).attr("id", downloadIframeId).appendTo("body").get(0);
    }
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("message received!");
    switch (request.action){
        case "processTitle":
            processTitle(request.value);
            break;
        case "processSongPage":
            window[request.windowObject].processSongPage(request.value);
            break;
    }
});