const mocha = require("mocha").mocha;
mocha.setup('bdd');

const mp3partyNet = require("./mp3party.net.spec");
const zaycevNet = require("./zaycev.net.spec");
const zkFm = require("./zk.fm.spec");
const drivemusicMe = require("./drivemusic.me.spec");


mocha.run();