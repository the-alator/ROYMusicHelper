const SourceResponseTransformer = require("../../../main/smt/core/sourceResponseTransformer");
const assert = require("chai").assert;
const sinon = require("sinon");

describe("SourceResponseTransformer spec", function () {
    let sourceResponseTransformer;

    beforeEach(function () {
        sourceResponseTransformer = new SourceResponseTransformer();
    });

    describe("compareAllSongsToTitle() spec", function () {
        it("should set proper similarity for equal title and song", function () {
            const title = "AAb";
            const songsList = [{title: "AAb"}];

            sourceResponseTransformer.compareAllSongsToTitle(title, songsList);

            assert.equal(songsList[0].similarity, 1);
            assert.equal(songsList[0].similarity, 1.0);
            assert.equal(songsList[0].similarity, "1.0");
            assert.equal(songsList[0].similarity, "1");
            assert.notEqual(songsList[0].similarity, 1.1);
        });

        it("should set proper similarity for totally not equal title and song", function () {
            const title = "AAb";
            const songsList = [{title: "zzz"}];

            sourceResponseTransformer.compareAllSongsToTitle(title, songsList);

            assert.equal(songsList[0].similarity, 0);
        });

        it("should set proper similarity for different only in cases title and song", function () {
            const title = "aab";
            const songsList = [{title: "AAB"}];

            sourceResponseTransformer.compareAllSongsToTitle(title, songsList);

            assert.equal(songsList[0].similarity, 0);
        });

        it("should set proper similarity for diffderent only in cases title and song", function () {
            const title = "bba";
            const songsList = [{title: "bbb"}];

            sourceResponseTransformer.compareAllSongsToTitle(title, songsList);

            assert.equal(songsList[0].similarity, 1);
        });
    });

});