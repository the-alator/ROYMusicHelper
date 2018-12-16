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

    describe("sort() spec", function () {
        it("should sort in descending order by similarity", function () {
            const unsortedSongsList = [
               {similarity : 0.5},
               {similarity : 0.1},
               {similarity : 0.8},
            ];

            const sortedSongsList = [
                {similarity : 0.8},
                {similarity : 0.5},
                {similarity : 0.1},
            ];

            sourceResponseTransformer.sort(unsortedSongsList);

            assert.equal(unsortedSongsList[0].similarity, sortedSongsList[0].similarity);
            assert.equal(unsortedSongsList[1].similarity, sortedSongsList[1].similarity);
            assert.equal(unsortedSongsList[2].similarity, sortedSongsList[2].similarity);

        });
    });

});