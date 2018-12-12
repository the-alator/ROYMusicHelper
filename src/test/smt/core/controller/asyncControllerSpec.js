const Controller = require("../../../../main/smt/core/controller/asyncController");
const assert = require("chai").assert;
const sinon = require("sinon");

describe("asyncController spec", function () {
    const DUMMY_TITLE = "dtitle";
    const DUMMY_CLEANED_TITLE = "dctitle";

    let controller;
    let getSongListByTitleFunctionStub;

    beforeEach(function () {
        let cleanFunctionStub = sinon.stub().withArgs(DUMMY_TITLE).returns(DUMMY_CLEANED_TITLE);
        let textCleanerStub = {clean : cleanFunctionStub};

        getSongListByTitleFunctionStub = sinon.stub().withArgs(DUMMY_CLEANED_TITLE);
        //todo accept only DUMMY_CLEANED_TITLE
        let sourceStub = {getSongListByTitle : getSongListByTitleFunctionStub};
        let getSupportedSourcesFunctionStub = sinon.stub().returns([sourceStub, sourceStub, sourceStub]);
        let sourceManagerStub = {getSupportedSources : getSupportedSourcesFunctionStub};
        controller = new Controller(textCleanerStub, sourceManagerStub);
        console.log("BeforeEach main");
    });

    it('should clean title and iterate over all sources', function () {
        controller.processTitle(DUMMY_TITLE, null);
        assert.equal(getSongListByTitleFunctionStub.callCount, 3);
    });

});