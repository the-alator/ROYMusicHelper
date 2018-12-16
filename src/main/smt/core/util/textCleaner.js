const log = require("../../../extension/additional/logger");

let textCleaners =  [new ParenthesesCleaner(), new OtherSymbolsCleaner(), new CaseCleaner()];

function clean(text) {
    textCleaners.forEach(cleaner => {
        text = cleaner.doClean(text);
    });
    return text;
}

function ParenthesesCleaner() {
    const pattern = /([(\[])(.*?)([)\]])/g;
    this.doClean = function (text) {
        return text.replace(pattern, "");
    }
}

function OtherSymbolsCleaner() {
    const patternToReplaceWithSpace = /[,. \-"'!?]+/g;
    const patternToRemove = /[`]/g;
    this.doClean = function (text) {
        text = text.replace(patternToReplaceWithSpace, " ");
        return text.replace(patternToRemove, "");
    }
}

function CaseCleaner() {
    this.doClean = function (text) {
        return text.toLowerCase();
    }
}

module.exports.ParenthesesCleaner = ParenthesesCleaner;
module.exports.OtherSymbolsCleaner = OtherSymbolsCleaner;
module.exports.CaseCleaner = CaseCleaner;
module.exports.clean = clean;