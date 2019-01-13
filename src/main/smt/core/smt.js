const log = require("../../extension/additional/logger");

const SourceResponseProcessor = require("./sourceResponseProcessor");
const ParenthesesCleaner = require("./util/textCleaner").ParenthesesCleaner;
const clean = require("./util/textCleaner").clean;
const OtherSymbolsCleaner = require("./util/textCleaner").OtherSymbolsCleaner;
const CaseCleaner = require("./util/textCleaner").CaseCleaner;
const SourceManager = require("./sourceManager");
const Downloader = require("./songProcessor/downloader");

const SongProcessor = require("./songProcessor/downloader");
const SourceResponseTransformer = require("./sourceResponseTransformer");
const SourceResponseErrorHandler = require("./sourceResponseErrorHandler");
const Controller = require("./controller/asyncController");

function Smt() {
    const self = this;

    let sourceManager = new SourceManager();
    let songProcessor = new SongProcessor();
    let sourceResponseTransformer = new SourceResponseTransformer();
    let sourceResponseErrorHandler = new SourceResponseErrorHandler();
    let controller = new Controller(clean, sourceManager);
    let downloader = new Downloader();

    this.processTitle = function (title) {
        log.debug("The title - " + title);
        title = clean(title);
        log.debug("The cleaned title - " + title);

        let sourceResponseProcessor = new SourceResponseProcessor(
            title,
            sourceResponseTransformer,
            sourceManager,
            sourceResponseErrorHandler,
            downloader);
        controller.processTitle(title, sourceResponseProcessor);
    }
}

module.exports = Smt;