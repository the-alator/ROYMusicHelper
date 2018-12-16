const SourceResponseProcessor = require("../../../main/smt/core/sourceResponseProcessor");
const assert = require("chai").assert;
const sinon = require("sinon");

describe("SourceResponseAccumulator spec", function () {
    const DUMMY_TITLE = "dummytitle";
    const SOURCES_NUMBER = 4;
    let SOURCE = {name : "SOURCENAME"};

    let sourceResponseProcessor;

    let sourceResponseTransformer;
    let sourceManager;
    let sourceResponseErrorHandler;
    let songProcessor;

    const songsListAnalyzer = require("../../../../src/main/smt/core/util/songsListAnalyzer");
    let getMaxSimilaritySongsIndicesSpy = sinon.spy(songsListAnalyzer, "getMaxSimilaritySongsIndices");

    beforeEach(function () {
        sourceResponseTransformer = {transformList : sinon.stub()};
        sourceResponseErrorHandler = {processError : sinon.stub()};
        sourceManager = {getNumberOfSources : sinon.stub().returns(SOURCES_NUMBER)};
        songProcessor = {process : sinon.stub()};

        sourceResponseProcessor = new SourceResponseProcessor(DUMMY_TITLE, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, songProcessor);
    });

    it("should call sourceResponseErrorHandler if all sources responded fail", function () {
        for(let i = 0; i < SOURCES_NUMBER; i++) {
            sourceResponseProcessor.fail(SOURCE);
        }

        assert.isTrue(sourceResponseErrorHandler.processError.called)
    });

    it("should call downloader if has MAX match in first part", function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = dummySongsList(25, {5 : 1});

        sourceResponseProcessor.success(songsList, SOURCE);

        assert.isTrue(songProcessor.process.calledWith(maxSimilaritySong));
        assert.equal(getMaxSimilaritySongsIndicesSpy.callCount, 1);
    });

    it("should call downloader if has MAX match in second part", function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = dummySongsList(25, {15 : 1});

        sourceResponseProcessor.success(songsList, SOURCE);

        assert.isTrue(songProcessor.process.calledWith(maxSimilaritySong));
        assert.equal(getMaxSimilaritySongsIndicesSpy.callCount, 2);
    });

    it("should not process responses after processingDone", function () {

    });

    it("should delete unsuccessful download urls with MAX similarity", function () {

    });

    it("should empty lists", function () {

    });

    it("should throw Error if called more times then sources exists", function () {
        let source = {name : "NAME"};
        for(let i = 0; i < SOURCES_NUMBER; i++) {
            sourceResponseProcessor.fail(source);
        }

        assert.throws(() => sourceResponseProcessor.fail(source), "Too many responses");
    });

    //spec1 - action when all sources responded fail or empty lists. See the amount of sources via array
    // assert.isTrue(sourceResponseTransformer.process.calledWith(DUMMY_TITLE));


});


function dummySongsList(size, replaces) {
    let songsList = [];
    for(let i = 0; i < size; i++) {
        if(replaces[i]) {
            songsList.push({similarity: replaces[i]});
        } else {
            songsList.push({similarity: i / 100});
        }
    }
    return songsList;
}