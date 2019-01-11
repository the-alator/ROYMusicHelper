const log = require("../additional/logger");

function ajax(options) {
    options.data = options.data || {};
    options.method = options.method || "GET";
    options.dataType = options.dataType || "text";

    return $.ajax({
        url: options.url,
        data: options.data,
        method: options.method,
        dataType: options.dataType
    });
}

module.exports.ajax = ajax;