let log;

try {
    log = new Log4js.getLogger("l1");
    log.setLevel(Log4js.Level.ALL);
    let appender = new Log4js.BrowserConsoleAppender(true);
    appender.setLayout(new Log4js.SimpleLayout());
    log.addAppender(appender);
} catch(e) {
    log = {};
    log.all = function () {};
    log.debug = function () {};
    log.info = function () {};
    log.warn = function () {};
    log.error = function () {};
    log.fatal = function () {};
    log.trace = function () {};
}

function pjson(songList) {
    let result = "\n";
    result += "[\n";
    songList.forEach(function (song) {
        result += `{"similarity":"${song.similarity}","title":"${song.title}","pageUrl":"${song.pageUrl}",baseSongPageUrl":"${song.source.baseSearchUrl}"}\n`;
    });
    result += "]\n";

    return result;
}

module.exports = log;
module.exports.pjson = pjson;