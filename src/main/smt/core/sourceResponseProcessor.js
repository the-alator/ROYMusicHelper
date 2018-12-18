const log = require("../../extension/additional/logger");
const songsListAnalyzer = require("./util/songsListAnalyzer");

function SourceResponseProcessor(title, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, songProcessor) {
    const MIN_SIMILARITY = 0.5;
    let responsesCount = 0;
    let successfulResponses = 0;
    let failResponses = 0;
    let songsLists = [];

    let processingDone = false;

    this.fail = function (source) {
        response();
        failResponses++;
        log.debug("Source " + source.name + " responded fail");
    };

    this.success = function (songsList, source) {
        if(processingDone) {
            return false;
        }
        successfulResponses++;

        sourceResponseTransformer.transformList(title, songsList);

        let maxSimilaritySongsIndices = songsListAnalyzer.getMaxSimilaritySongsIndices(songsList);
        for(let i = 0; i < maxSimilaritySongsIndices.length; i++) {
            if(songProcessor.process(songsList[maxSimilaritySongsIndices[i]])) {
                processingDone = true;
                log.debug("Processing done. 100% match song found.");
                break;
            } else {
                songsList.splice(maxSimilaritySongsIndices[i], 1);
            }
        }

        songsLists.push(songsList);

        log.debug("Source " + source.name + " responded success");
        log.trace("songsList " + JSON.stringify(songsList));

        response();

        return true;
    };

    function isLastSourceResponse() {
        return sourceManager.getNumberOfSources() === responsesCount;
    }

    function response(source){
        if(responsesCount >= sourceManager.getNumberOfSources()) {
            throw new Error("Too many responses");
        }
        responsesCount++;

        if(!processingDone && isLastSourceResponse()) {
            log.debug("The last source response");
            if(successfulResponses === 0) {
                log.debug("No successful responses");
                sourceResponseErrorHandler.processError();
                return;
            }
            let sortedSongsList = sourceResponseTransformer.processTransformedSongsLists(songsLists);

            if(sortedSongsList.length === 0) {
                log.debug("No songs in resulting list");
                sourceResponseErrorHandler.processError();
                return;
            }

            log.trace("Resulting songs list: " + JSON.stringify(sortedSongsList));

            let listForDownloading = songsListAnalyzer.getSublistWithSimilarityMoreThen(MIN_SIMILARITY, sortedSongsList);

            log.trace("List to send to downloader: " + JSON.stringify(sortedSongsList));

            songProcessor.process(listForDownloading);
        }
    }
}

module.exports = SourceResponseProcessor;