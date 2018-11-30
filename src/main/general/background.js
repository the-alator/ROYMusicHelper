let zkFmDownloadFrame;
let downloadIframeSrc = "http://zk.fm/?UNIQUEROYMUSICHELPER=E";
let downloadIframeId = "zkFmDownloadIframe";
let log;

let searchManager;
let sourceManager;

chrome.runtime.onInstalled.addListener(function() {
    init();
    installZkFmDownloadFrameIfAbsent();
    initLogging();
    log.info("EXTENSION INSTALLED");

    chrome.tabs.create({url: DEBUG_HTML_PAGE});
});

function init() {
    searchManager = new AsyncSadManager();
    sourceManager = new SourceManager();
}

function initLogging() {
    log = new Log4js.getLogger("l1");
    log.setLevel(Log4js.Level.ALL);
    let appender = new Log4js.BrowserConsoleAppender(true);
    appender.setLayout(new Log4js.SimpleLayout());
    log.addAppender(appender);
    log.info("qwe");
}
function installZkFmDownloadFrameIfAbsent(){
    if($("#" + downloadIframeId).length === 0) {
        console.log("new zk.fm iframe created");
        zkFmDownloadFrame = $("<iframe>").attr("src", downloadIframeSrc).attr("id", downloadIframeId).appendTo("body").get(0);
    }
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("message received!");
    switch (request.action){
        case "getSongListByTitle":
            searchManager.getSongListByTitle(request.value);
            break;
        case "getDownloadUrlForSong":
            window[request.windowObject].getDownloadUrlForSong(request.value);
            break;
    }
});