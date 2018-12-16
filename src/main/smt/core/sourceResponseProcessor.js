const log = require("../../extension/additional/logger");
const songsListAnalyzer = require("./util/songsListAnalyzer");

function SourceResponseProcessor(title, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, songProcessor) {
    const SUCCESSFUL_RESPONSES_TO_START_PROCESSING = 1;

    let responsesCount = 0;
    let successfulResponses = 0;
    let failResponses = 0;
    let songsSetsList = [];

    let processingDone = false;

    this.fail = function (source) {
        response();
        failResponses++;
        log.debug("Source " + source.name + " responded fail");

        if(sourceManager.getNumberOfSources() === failResponses) {
            sourceResponseErrorHandler.processError();
        }
    };

    this.success = function (songsList, source) {
        response();
        successfulResponses++;

        let songListParts = songsListAnalyzer.splitListToDefaultParts(songsList);

        sourceResponseTransformer.transformList(title, songsList);


        let maxSimilaritySongsIndices = songsListAnalyzer.getMaxSimilaritySongsIndices(songsList);
        for(let i = 0; i < maxSimilaritySongsIndices.length; i++) {
            if(songProcessor.process(songsList[maxSimilaritySongsIndices[i]])) {
                processingDone = true;
                break;
            } else {
                songsList.splice(maxSimilaritySongsIndices[i], 1);
            }
        }

        songsSetsList.push(songsList);

        log.debug("Source " + source.name + " responded success");
        log.trace("songsList " + JSON.stringify(songsList));


        // if(successfulResponses >= SUCCESSFUL_RESPONSES_TO_START_PROCESSING) {
        //     sourceResponseProcessor.transformList(title, songsSetsList);
        // }

    };
    
    function processSongsListParts(songListPart) {

    }

    function response(source){
        if(responsesCount >= sourceManager.getNumberOfSources()) {
            throw new Error("Too many responses");
        }
        responsesCount++;
    }
}

module.exports = SourceResponseProcessor;