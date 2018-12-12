const log = require("../additional/logger");

const SourceResponseManager = require("../../smt/core/sourceResponseManager");
const ParenthesesCleaner = require("../../smt/core/util/textCleaner").ParenthesesCleaner;
const TextCleaner = require("../../smt/core/util/textCleaner").TextCleaner;
const OtherSymbolsCleaner = require("../../smt/core/util/textCleaner").OtherSymbolsCleaner;
const CaseCleaner = require("../../smt/core/util/textCleaner").CaseCleaner;
const SourceManager = require("../../smt/core/sourceManager");

const DownloadManager = require("../../smt/core/songProcessor/downloadManager");
const SongSetsManager = require("../../smt/core/songSetsManager");
const AsyncSadManager = require("../../smt/core/controller/asyncSadManager");

let zkFmDownloadFrame;
let downloadIframeSrc = "http://zk.fm/?UNIQUEROYMUSICHELPER=E";
let downloadIframeId = "zkFmDownloadIframe";

let searchManager;
let songSetsManager;
let sourceManager;
let downloadManager;
let textCleaner;


init();
installZkFmDownloadFrameIfAbsent();
log.info("EXTENSION INSTALLED");

chrome.tabs.create({url: DEBUG_HTML_PAGE});

function init() {
    sourceManager = new SourceManager();

    textCleaner = new TextCleaner(
        [new ParenthesesCleaner(), new OtherSymbolsCleaner(), new CaseCleaner()]
    );

    downloadManager = new DownloadManager();
    songSetsManager = new SongSetsManager(textCleaner, downloadManager);

    searchManager = new AsyncSadManager(songSetsManager, textCleaner);
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
            let sourceResponseManager = new SourceResponseManager(title, songSetsManager);
            searchManager.processTitle(request.value, sourceResponseManager);
            break;
        case "getDownloadUrlForSong":
            window[request.windowObject].getDownloadUrlForSong(request.value);
            break;
    }
});

module.exports.log = log;
