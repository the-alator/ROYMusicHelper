const ZaycevNet = require("../../../../main/smt/songSource/zaycev.net");
const assert = require("chai").assert;
const sinon = require("sinon");
const describe = require("mocha").describe;
const it = require("mocha").it;

describe("ZaycevNetSource spec", function () {
    let responseManager;
    let zaycevNetSource;

    beforeEach(function () {
        responseManager = {
            success : sinon.stub(),
            fail : sinon.stub(),
        };
        zaycevNetSource = new ZaycevNet();
    });

    it('should make ajax and pass songs to responseManager', function (done) {
        const title = "дзідзьо марсик";
        const titleExpected = "Дзідзьо Марсик";

        responseManager.success = function (songs){
            assert.equal(titleExpected, songs[0].title);
            done();
        };

        zaycevNetSource.getSongListByTitle(title, responseManager);
    });

    it('should make ajax and return download url via promise', function () {
        const song = {pageUrl : "/pages/43314/4331498.shtml"};
        const downloadUrlExpected = "http://cdndl.zaycev.net/117102/4331498/dz_dzo_-_marsik_%28zaycev.net%29.mp3?ext.page=default";

        return zaycevNetSource.getDownloadUrlForSong(song).then( function (downloadUrl) {
            assert.equal(downloadUrlExpected, downloadUrl);
        });
    });
});
