const log = require("../additional/logger");

const SourceResponseProcessor = require("../../smt/core/sourceResponseProcessor");
const ParenthesesCleaner = require("../../smt/core/util/textCleaner").ParenthesesCleaner;
const clean = require("../../smt/core/util/textCleaner").clean;
const OtherSymbolsCleaner = require("../../smt/core/util/textCleaner").OtherSymbolsCleaner;
const CaseCleaner = require("../../smt/core/util/textCleaner").CaseCleaner;
const SourceManager = require("../../smt/core/sourceManager");
const Downloader = require("../../smt/core/songProcessor/downloader");

const SongProcessor = require("../../smt/core/songProcessor/downloader");
const SourceResponseTransformer = require("../../smt/core/sourceResponseTransformer");
const SourceResponseErrorHandler = require("../../smt/core/SourceResponseErrorHandler");
const Controller = require("../../smt/core/controller/asyncController");

const downloadIframeSrc = "http://zk.fm/?UNIQUEROYMUSICHELPER=E";
const downloadIframeId = "zkFmDownloadIframe";

let controller;
let sourceResponseTransformer;
let sourceResponseErrorHandler;
let sourceManager;
let songProcessor;
let downloader;

init();

log.debug("EXTENSION INSTALLED");

chrome.tabs.create({url: DEBUG_HTML_PAGE});
chrome.tabs.create({url: SOURCES_SPEC_HTML_PAGE});

function init() {
    sourceManager = new SourceManager();

    songProcessor = new SongProcessor();
    sourceResponseTransformer = new SourceResponseTransformer();
    sourceResponseErrorHandler = new SourceResponseErrorHandler();

    controller = new Controller(clean, sourceManager);

    downloader = new Downloader();

}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    log.debug("Message: " + JSON.stringify(request));
    switch (request.action){
        case "getSongListByTitle":
            let sourceResponseProcessor = new SourceResponseProcessor(request.value, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, downloader);
            controller.processTitle(request.value, sourceResponseProcessor);
            break;
        case "getDownloadUrlForSong":
            window[request.windowObject].getDownloadUrlForSong(request.value);
            break;
    }
});

module.exports.log = log;
