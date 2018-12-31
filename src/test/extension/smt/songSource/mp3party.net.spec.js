const Mp3partyNet = require("../../../../main/extension/smt/songSource/mp3party.net");
const assert = require("chai").assert;
const sinon = require("sinon");
const describe = require("mocha").describe;
const it = require("mocha").it;

describe("Mp3partyNetSource spec", function () {
    let responseManager;
    let mp3partyNetSource;

    beforeEach(function () {
        responseManager = {
            success : sinon.stub(),
            fail : sinon.stub(),
        };
        mp3partyNetSource = new Mp3partyNet();
    });

    it('should make ajax and pass songs to responseManager', function (done) {
        const title = "The Lumineers – Angela";
        const titleExpected = "The Lumineers - Angela";

        responseManager.success = function (songs){
            assert.equal(titleExpected, songs[0].title);
            done();
        };

        mp3partyNetSource.getSongListByTitle(title, responseManager);
    });

    it('should make ajax and return download url via promise', function () {
        const song = {pageUrl : "/music/1771426"};
        const downloadUrlExpected = "http://dl2.mp3party.net/download/1771426";

        return mp3partyNetSource.getDownloadUrlForSong(song).then( function (downloadUrl) {
            assert.equal(downloadUrlExpected, downloadUrl);
        });
    });
});
