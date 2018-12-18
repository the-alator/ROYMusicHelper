const log = require("../../extension/additional/logger");

function SourceResponseErrorHandler() {

    this.processError = function () {
        log.error("THE SONG WAS NOT FOUND");
    }
}

module.exports = SourceResponseErrorHandler;