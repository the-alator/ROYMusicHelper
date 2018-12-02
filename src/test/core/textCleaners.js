function ParenthesesCleaner() {
    const pattern = /([(\[])(.*?)([)\]])/g;
    this.doClean = function (text) {
        return text.replace(pattern, "");
    }
}

function OtherSymbolsCleaner() {
    this.doClean = function (text) {

    }
}

function CaseCleaner() {
    this.doClean = function (text) {
        return text.toLowerCase();
    }
}
