const log = require("../../extension/additional/logger");

function SourceResponseAccumulator(title, songsSetsManager) {
    const SUCCESSFUL_RESPONSES_TO_START_PROCESSING = 1;
    let responsesCount = 0;
    let successfulResponses = 0;
    let failResponses = 0;
    let songsSetsList = [];

    this.fail = function (source) {
        response();
        failResponses++;
        log.debug("Source " + source.name + " responded fail");
    };

    this.success = function (songsList, source) {
        response();
        successfulResponses++;
        songsSetsList.push(songsList);

        log.debug("Source " + source.name + " responded success");
        log.trace("songsList " + JSON.stringify(songsList));

        if(successfulResponses >= SUCCESSFUL_RESPONSES_TO_START_PROCESSING) {
            songsSetsManager.process(title, songsSetsList);
        }

    };

    function response(source){
        responsesCount++;
    }
}

module.exports = SourceResponseAccumulator;