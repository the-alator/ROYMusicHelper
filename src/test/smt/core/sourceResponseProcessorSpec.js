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
        songProcessor = {processSong : sinon.stub().returns(true), processSongsList : sinon.stub()};

        sourceResponseProcessor = new SourceResponseProcessor(DUMMY_TITLE, sourceResponseTransformer, sourceManager, sourceResponseErrorHandler, songProcessor);
    });

    it("should call sourceResponseErrorHandler if all sources responded fail", function () {
        for(let i = 0; i < SOURCES_NUMBER; i++) {
            sourceResponseProcessor.fail(SOURCE);
        }

        assert.isTrue(sourceResponseErrorHandler.processError.called);
    });

    it("should call sourceResponseErrorHandler if all responses are empty ", function () {
        let promise;
        for(let i = 0; i < SOURCES_NUMBER; i++) {
            promise = sourceResponseProcessor.success([], SOURCE);
        }
        promise.then(() => {
            assert.isTrue(sourceResponseErrorHandler.processError.called);
        });
    });

    it("should call downloader if has MAX match", async function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = dummySongsList(25, {5 : 1});

        assert.isTrue(await sourceResponseProcessor.success(songsList, SOURCE));

        assert.isTrue(songProcessor.processSong.calledWith(maxSimilaritySong));
    });

    it("should not process responses after first successful download", async function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = [maxSimilaritySong];

        assert.isTrue(await sourceResponseProcessor.success(songsList, SOURCE));
        assert.isFalse(await sourceResponseProcessor.success(songsList, SOURCE));

        assert.isTrue(songProcessor.processSong.calledWith(maxSimilaritySong));
    });

    it("should delete unsuccessful download urls with MAX similarity and download same other successful url", async function () {
        const maxSimilaritySong = {similarity: 1};
        let songsList = dummySongsList(5, {2 : 1, 4: 1});

        songProcessor.processSong.onCall(0).returns(Promise.resolve(false));
        songProcessor.processSong.onCall(1).returns(Promise.resolve(true));

        assert.equal(songsList.length, 5);
        assert.equal(songsListAnalyzer.getMaxSimilaritySongsIndices(songsList).length, 2);

        assert.isTrue(await sourceResponseProcessor.success(songsList, SOURCE));

        assert.isTrue(songProcessor.processSong.calledWith(maxSimilaritySong));
        assert.equal(songsList.length, 4);
        assert.equal(songsListAnalyzer.getMaxSimilaritySongsIndices(songsList).length, 1);
    });

    it("should wait all responses and choose best match", async function () {
        let topSimilaritySong = {similarity : 0.9};
        let sortedSongs = [topSimilaritySong, {similarity : 0.8}, {similarity : 0.4}, {similarity : 0.14}, {similarity : 0.1}];
        let songsWithSimilarityMoreThen = [topSimilaritySong, sortedSongs[1]];

        sourceResponseTransformer.processTransformedSongsLists.returns(sortedSongs);
        let getSublistWithSimilarityMoreThenStub = sinon.stub(songsListAnalyzer, "getSublistWithSimilarityMoreThen");
        getSublistWithSimilarityMoreThenStub.withArgs(0.5, sortedSongs).returns(songsWithSimilarityMoreThen);

        sourceResponseProcessor.success([topSimilaritySong], SOURCE);
        sourceResponseProcessor.success([sortedSongs[4]], sortedSongs[3], SOURCE);
        sourceResponseProcessor.success([sortedSongs[1]], SOURCE);
        await sourceResponseProcessor.success([sortedSongs[2]], SOURCE);

        assert.isTrue(sourceResponseTransformer.processTransformedSongsLists.called);
        assert.isTrue(songProcessor.processSongsList.calledOnceWithExactly(songsWithSimilarityMoreThen));
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