const DrivemusicMe = require("../../../../main/smt/songSource/drivemusic.me");
const assert = require("chai").assert;
const sinon = require("sinon");
const describe = require("mocha").describe;
const it = require("mocha").it;

describe("DrivemusicMeSource spec", function () {
    let responseManager;
    let drivemusicMeSource;

    beforeEach(function () {
        responseManager = {
            success : sinon.stub(),
            fail : sinon.stub(),
        };
        drivemusicMeSource = new DrivemusicMe();
    });

    it('should make ajax and pass songs to responseManager', function (done) {
        const title = "Дзідзьо ялта";
        const titleExpected = "Дзідзьо Ялта";

        responseManager.success = function (songs){
            assert.equal(titleExpected, songs[0].title);
            done();
        };

        drivemusicMeSource.getSongListByTitle(title, responseManager);
    });

    it('should make ajax and return download url via promise', function () {
        const song = {pageUrl : "/pop_music/1147-dzidzo-jalta.html"};
        const downloadUrlExpected = "http://drivemusic.me/dl/dpzxDLighTEcqYwmNb8IKA/1545964494/download_music/2011/07/dzidzo-jalta.mp3";

        return drivemusicMeSource.getDownloadUrlForSong(song).then( function (downloadUrl) {
            assert.equal(downloadUrlExpected, downloadUrl);
        });
    });
});
