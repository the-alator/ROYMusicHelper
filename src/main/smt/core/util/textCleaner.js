const log = require("../../../extension/additional/logger");

let textCleaners =  [new ParenthesesCleaner(), new OtherSymbolsCleaner(), new CaseCleaner()];

function clean(text) {
    let cleanedText = text;

    textCleaners.forEach(cleaner => {
        cleanedText = cleaner.doClean(cleanedText);
    });

    log.trace("text before parenclean: " + text + " text after clean: " + cleanedText);

    return cleanedText;
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