const SefonMeSource = require("../../../../main/smt/songSource/sefon.me");
const assert = require("chai").assert;
const sinon = require("sinon");
const describe = require("mocha").describe;
const it = require("mocha").it;

describe("SefonMeSource spec", function () {
    let responseManager;
    let sefonMeSource;

    beforeEach(function () {
        responseManager = {
            success : sinon.stub(),
            fail : sinon.stub(),
        };
        sefonMeSource = new SefonMeSource();
    });

    it('should make ajax and pass songs to responseManager', function (done) {
        const title = "Alan Walker fade";
        const titleExpected = "Alan Walker Fade";

        responseManager.success = function (songs){
            assert.equal(titleExpected, songs[0].title);
            done();
        };

        sefonMeSource.getSongListByTitle(title, responseManager);
    });

    it('should make ajax and return download url via promise', function () {
        const song = {pageUrl : "/mp3/59996-alan-walker-fade"};
        const downloadUrlExpected = "https://cdn2.sefon.me/api/mp3_download/direct/59996/jl5obcjcKlcS-itAzZvFC73KZfxlZpUtpOdDr5QeP6WIJPh2qE30EaAjUkSwnIlY/";

        return sefonMeSource.getDownloadUrlForSong(song).then( function (downloadUrl) {
            assert.equal(downloadUrlExpected, downloadUrl);
        });
    });
});