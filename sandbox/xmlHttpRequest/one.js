//
// var xhr = new XMLHttpRequest();
//
// // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
// xhr.open('GET', 'https://learn.javascript.ru/ajax-xmlhttprequest', true);
//
// // 3. Отсылаем запрос
// xhr.send();
//
// // 4. Если код ответа сервера не 200, то это ошибка
// if (xhr.status != 200) {
//     // обработать ошибку
//     alert( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
// } else {
//     // вывести результат
//     alert( xhr.responseText ); // responseText -- текст ответа.
// }

// var xhr = new XMLHttpRequest();
//
// // (2) запрос на другой домен :)
// xhr.open('GET', 'https://crossorigin.me/https://google.com', true);
//
// xhr.onload = function() {
//     alert( this.responseText );
// }
//
// xhr.onerror = function() {
//     alert( 'Ошибка ' + this.status );
// }
//
// xhr.send();

var createCORSRequest = function(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // Most browsers.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // IE8 & IE9
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
};

var url = 'https://google.com';
var method = 'GET';
var xhr = createCORSRequest(method, url);

xhr.onload = function() {
    // Success code goes here.
    alert(1);
};

xhr.onerror = function() {
    // Error code goes here.
    alert(2);
};

xhr.send();