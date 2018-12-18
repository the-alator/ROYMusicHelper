const SourceResponseProcessor = require("../../../main/smt/core/sourceResponseProcessor");
const assert = require("chai").assert;
const sinon = require("sinon");
const songsListAnalyzer = require("../../../main/smt/core/util/songsListAnalyzer");

describe("SourceResponseAccumulator spec", function () {
    const DUMMY_TITLE = "dummytitle";
    const SOURCES_NUMBER = 4;
    let SOURCE = {name : "SOURCENAME"};

    let sourceResponseProcessor;

    let sourceResponseTransformer;
    let sourceManager;
    let sourceResponseErrorHandler;
    let songProcessor;

    beforeEach(function () {
        sourceResponseTransformer = {transformList : sinon.stub(), processTransformedSongsLists : sinon.stub().returns([])};
        sourceResponseErrorHandler = {processError : sinon.stub()};
        sourceManager = {getNumberOfSources : sinon.stub().returns(SOURCES_NUMBER)};
        songProcessor = {process : sinon.stub().returns(true)};

        sourceResponseProcessor = new SourceResponseProcessor(DUMMY_TITLE, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, songProcessor);
    });

    it("should call sourceResponseErrorHandler if all sources responded fail", function () {
        for(let i = 0; i < SOURCES_NUMBER; i++) {
            sourceResponseProcessor.fail(SOURCE);
        }

        assert.isTrue(sourceResponseErrorHandler.processError.called);
    });

    it("should call sourceResponseErrorHandler if all responses are empty ", function () {
        for(let i = 0; i < SOURCES_NUMBER; i++) {
            sourceResponseProcessor.success([], SOURCE);
        }

        assert.isTrue(sourceResponseErrorHandler.processError.called);
    });

    it("should call downloader if has MAX match", function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = dummySongsList(25, {5 : 1});

        assert.isTrue(sourceResponseProcessor.success(songsList, SOURCE));

        assert.isTrue(songProcessor.process.calledWith(maxSimilaritySong));
    });

    it("should not process responses after first successful download", function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = [maxSimilaritySong];

        assert.isTrue(sourceResponseProcessor.success(songsList, SOURCE));
        assert.isFalse(sourceResponseProcessor.success(songsList, SOURCE));

        assert.isTrue(songProcessor.process.calledWith(maxSimilaritySong));
    });

    it("should delete unsuccessful download urls with MAX similarity", function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = dummySongsList(5, {2 : 1, 4: 1});

        songProcessor.process.onCall(0).returns(false);
        songProcessor.process.onCall(1).returns(true);

        assert.equal(songsList.length, 5);
        assert.equal(songsListAnalyzer.getMaxSimilaritySongsIndices(songsList).length, 2);

        assert.isTrue(sourceResponseProcessor.success(songsList, SOURCE));

        assert.isTrue(songProcessor.process.calledWith(maxSimilaritySong));
        assert.equal(songsList.length, 4);
        assert.equal(songsListAnalyzer.getMaxSimilaritySongsIndices(songsList).length, 1);
    });

    it("should wait all responses and choose best match", function () {
        let maxSimilaritySong = {similarity : 0.9};

        sourceResponseProcessor.success([maxSimilaritySong], SOURCE);
        sourceResponseProcessor.success([{similarity : 0.1}], {similarity : 0.14}, SOURCE);
        sourceResponseProcessor.success([{similarity : 0.8}], SOURCE);
        sourceResponseProcessor.success([{similarity : 0.4}], SOURCE);

        assert.isTrue(sourceResponseTransformer.processTransformedSongsLists.called);

    });

    it("should", function () {

    });

    it("should", function () {

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