const ZkFm = require("../../../../main/smt/songSource/zk.fm");
const assert = require("chai").assert;
const sinon = require("sinon");
const describe = require("mocha").describe;
const it = require("mocha").it;

describe("ZkFmSource spec", function () {
    let responseManager;
    let zkFmSource;

    beforeEach(function () {
        responseManager = {
            success : sinon.stub(),
            fail : sinon.stub(),
        };
        zkFmSource = new ZkFm();
    });

    it('should make ajax and pass songs to responseManager', function (done) {
        const title = "дзидзьо марсик";
        const titleExpected = "Дзидзьо Марсик Марсик";

        responseManager.success = function (songs){
            assert.equal(titleExpected, songs[0].title);
            done();
        };

        zkFmSource.getSongListByTitle(title, responseManager);
    });

    it('should make ajax and return download url via promise', function () {
        const song = {pageUrl : "/download/9408228"};
        const downloadUrlExpected = "http://zk.fm/download/9408228";

        return zkFmSource.getDownloadUrlForSong(song).then( function (downloadUrl) {
            assert.equal(downloadUrlExpected, downloadUrl);
        });
    });
});
