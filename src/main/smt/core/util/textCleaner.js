const log = require("../../../extension/additional/logger");

function TextCleaner(textCleaners) {

    this.clean = function(text) {
        textCleaners.forEach(cleaner => {
            text = cleaner.doClean(text);
        });
        return text;
    }
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
module.exports.TextCleaner = TextCleaner;
module.exports.OtherSymbolsCleaner = OtherSymbolsCleaner;
module.exports.CaseCleaner = CaseCleaner;