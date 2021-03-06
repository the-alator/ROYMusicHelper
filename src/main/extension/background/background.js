const log = require("../additional/logger");

const Smt = require("../../smt/core/smt");

const smt = new Smt();

log.debug("EXTENSION INSTALLED");

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    log.debug("Message: " + JSON.stringify(request));
    switch (request.action){
        case "getSongListByTitle":
            smt.processTitle(request.value);
            break;
    }
});

module.exports.log = log;
