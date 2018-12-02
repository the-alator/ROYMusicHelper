function TextCleaner(textCleaners) {

    this.clean = function(text) {
        textCleaners.forEach(cleaner => {
            text = cleaner.doClean(text);
        })
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

