const log = require("../../extension/additional/logger");
const songsListAnalyzer = require("./util/songsListAnalyzer");

function SourceResponseProcessor(title, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, songProcessor) {
    const MIN_SIMILARITY = 0.5;
    let responsesCount = 0;
    let successfulResponses = 0;
    let failResponses = 0;
    let songsLists = [];

    let processingDone = false;

    let responsePromise = Promise.resolve();

    this.fail = function (source) {
        failResponses++;
        response();
        log.debug("Source " + source.name + " responded fail");
    };

    this.success = function (songsList, source) {
        responsePromise = responsePromise.then(function () {
            return internalSuccess(songsList, source);
        });
        return responsePromise;
    };

    function internalSuccess(songsList, source) {
        return new Promise(async function(resolve, reject) {
            log.debug("Source " + source.name + " responded success");
            if(processingDone) {
                return resolve(false);
            }

            sourceResponseTransformer.transformList(title, songsList);

            let maxSimilaritySongsIndices = songsListAnalyzer.getMaxSimilaritySongsIndices(songsList);
            log.trace(`There is ${maxSimilaritySongsIndices.length} of songs with max similarity`);

            for (const index of maxSimilaritySongsIndices) {
                if(await songProcessor.processSong(songsList[index])) {
                    log.debug("Song is OK, processing done");
                    processingDone = true;
                    break;
                } else {
                    songsList.splice(index, 1);
                    log.debug("Song is not OK, deleting from list");
                }
            }

            if(songsList.length !== 0) {
                successfulResponses++;
                songsLists.push(songsList);
            } else {
                failResponses++;
            }

            log.trace("Song list after processing songs with max similarity: " + log.pjson(songsList));

            response();

            log.debug("Source " + source.name + " has just done work");

            resolve(true)
        });
    }

    function isLastSourceResponse() {
        return sourceManager.getNumberOfSources() === responsesCount;
    }

    function response(source){
        if(responsesCount >= sourceManager.getNumberOfSources()) {
            throw new Error("Too many responses");
        }
        responsesCount++;

        if(!processingDone && isLastSourceResponse()) {
            processingDone = true;
            if(successfulResponses === 0) {
                sourceResponseErrorHandler.processError();
                return;
            }
            let sortedSongsList = sourceResponseTransformer.processTransformedSongsLists(songsLists);
            if(sortedSongsList.length === 0) {
                sourceResponseErrorHandler.processError();
                return;
            }

            log.trace("all sorted songs: " + log.pjson(sortedSongsList));

            let listForDownloading = songsListAnalyzer.getSublistWithSimilarityMoreThen(MIN_SIMILARITY, sortedSongsList);

            songProcessor.processSongsList(listForDownloading);
        }
    }
}

module.exports = SourceResponseProcessor;