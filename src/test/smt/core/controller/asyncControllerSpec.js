const Controller = require("../../../../main/smt/core/controller/asyncController");
const assert = require("chai").assert;
const sinon = require("sinon");

describe("asyncController spec", function () {
    const DUMMY_TITLE = "dtitle";
    const DUMMY_CLEANED_TITLE = "dctitle";

    let controller;

    let textCleanerStub;
    let sourceStub;

    let getSongListByTitleFunctionStub;

    beforeEach(function () {
        textCleanerStub = {clean : sinon.stub().withArgs(DUMMY_TITLE).returns(DUMMY_CLEANED_TITLE)};

        getSongListByTitleFunctionStub = sinon.stub();

        sourceStub = {getSongListByTitle : getSongListByTitleFunctionStub};
    });

    it('should clean title and iterate over all sources', function () {
        let SOURCE_RESPONSE_ACCUMULATOR = {};
        let sourceManagerStub = {getSupportedSources : sinon.stub().returns([sourceStub, sourceStub, sourceStub])};
        controller = new Controller(textCleanerStub, sourceManagerStub);

        controller.processTitle(DUMMY_TITLE, SOURCE_RESPONSE_ACCUMULATOR);
        assert.equal(getSongListByTitleFunctionStub.callCount, 3);
        assert.isTrue(getSongListByTitleFunctionStub.calledWithExactly(DUMMY_CLEANED_TITLE, SOURCE_RESPONSE_ACCUMULATOR));
    });

});