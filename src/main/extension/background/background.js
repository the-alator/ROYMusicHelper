const log = require("../additional/logger");

const SourceResponseAccumulator = require("../../smt/core/SourceResponseAccumulator");
const ParenthesesCleaner = require("../../smt/core/util/textCleaner").ParenthesesCleaner;
const TextCleaner = require("../../smt/core/util/textCleaner").TextCleaner;
const OtherSymbolsCleaner = require("../../smt/core/util/textCleaner").OtherSymbolsCleaner;
const CaseCleaner = require("../../smt/core/util/textCleaner").CaseCleaner;
const SourceManager = require("../../smt/core/sourceManager");

const SongProcessor = require("../../smt/core/songProcessor/downloader");
const SourceResponseProcessor = require("../../smt/core/SourceResponseProcessor");
const Controller = require("../../smt/core/controller/asyncController");

const downloadIframeSrc = "http://zk.fm/?UNIQUEROYMUSICHELPER=E";
const downloadIframeId = "zkFmDownloadIframe";

let zkFmDownloadFrame;

let controller;
let sourceResponseProcessor;
let sourceManager;
let songProcessor;
let textCleaner;

init();

log.debug("EXTENSION INSTALLED");

chrome.tabs.create({url: DEBUG_HTML_PAGE});

function init() {
    sourceManager = new SourceManager();

    textCleaner = new TextCleaner(
        [new ParenthesesCleaner(), new OtherSymbolsCleaner(), new CaseCleaner()]
    );

    songProcessor = new SongProcessor();
    sourceResponseProcessor = new SourceResponseProcessor(textCleaner, songProcessor);

    controller = new Controller(textCleaner, sourceManager);

    installZkFmDownloadFrame();
}

function installZkFmDownloadFrame(){
    if($("#" + downloadIframeId).length === 0) {
        zkFmDownloadFrame = $("<iframe>").attr("src", downloadIframeSrc).attr("id", downloadIframeId).appendTo("body").get(0);
    }
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    log.debug("Message: " + JSON.stringify(request));
    switch (request.action){
        case "getSongListByTitle":
            let sourceResponseAccumulator = new SourceResponseAccumulator(title, sourceResponseProcessor);
            controller.processTitle(request.value, sourceResponseAccumulator);
            break;
        case "getDownloadUrlForSong":
            window[request.windowObject].getDownloadUrlForSong(request.value);
            break;
    }
});

module.exports.log = log;
