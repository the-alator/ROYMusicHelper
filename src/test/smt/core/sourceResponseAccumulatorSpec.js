const SourceResponseAccumulator = require("../../../main/smt/core/sourceResponseAccumulator");
const assert = require("chai").assert;
const sinon = require("sinon");

describe("SourceResponseAccumulator spec", function () {
    const DUMMY_TITLE = "dtitle";

    let controller;

    let sourceResponseProcessor;

    let getSongListByTitleFunctionStub;

    beforeEach(function () {
        textCleanerStub = {clean : sinon.stub().withArgs(DUMMY_TITLE).returns(DUMMY_CLEANED_TITLE)};

        getSongListByTitleFunctionStub = sinon.stub();

        sourceStub = {getSongListByTitle : getSongListByTitleFunctionStub};
    });

    it("should call sourceResponseErrorHandler if all sources responded fail", function () {
        sourceResponseProcessor = {process : sinon.spy().};

        .process(title, songsSetsList);
        sourceResponseErrorHandler
    });
    it('should clean title and iterate over all sources', function () {
        let SOURCE_RESPONSE_ACCUMULATOR = {};
        let sourceManagerStub = {getSupportedSources : sinon.stub().returns([sourceStub, sourceStub, sourceStub])};
        controller = new Controller(textCleanerStub, sourceManagerStub);

        controller.processTitle(DUMMY_TITLE, SOURCE_RESPONSE_ACCUMULATOR);
        assert.equal(getSongListByTitleFunctionStub.callCount, 3);
        assert.isTrue(getSongListByTitleFunctionStub.calledWithExactly(DUMMY_CLEANED_TITLE, SOURCE_RESPONSE_ACCUMULATOR));
    });

    //spec1 - action when all sources responded fail or empty lists. See the amount of sources via array


});