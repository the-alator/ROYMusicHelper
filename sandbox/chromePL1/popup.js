let ajt1B = document.getElementById("ajaxtest1");
let console = document.getElementById("console");

function textNode(text){
    let newTextNode = document.createElement("div");
    newTextNode.innerText = text;
    return newTextNode;
}
ajt1B.addEventListener("click", function (e) {
    console.appendChild(textNode("Clicked"));

    let url = 'http://mp3party.net/search?q=марсик';
    let downloadUrl = "http://dl1.mp3party.net/download/";
    let method = 'GET';
    let xhr = new XMLHttpRequest();
    xhr.responseType = "document";
    xhr.open(method, url, true);

    xhr.onload = function() {
        // Success code goes here.
        // let iframe = document.createElement("iframe");
        // iframe.setAttribute("scrolling", "scrolling")
        // iframe.srcdoc = xhr.response;
        // console.appendChild(iframe);

        let songs = xhr.response.querySelectorAll(".song-item a");
        console.appendChild(textNode("songs: " + songs.length));
        songs.forEach(function (node, index, list) {
            console.appendChild(node);
            console.appendChild(textNode("    "));

            let href = node.getAttribute("href");
            href = href.substring(href.lastIndexOf("/") + 1, href.length);
            console.appendChild(textNode(downloadUrl + href));

            console.appendChild(document.createElement("br"));

            let downloadOpts = {url: downloadUrl + href};
            chrome.downloads.download(downloadOpts);
        })

        // console.
        // alert(100);
    };

    xhr.onerror = function() {
        // Error code goes here.
        alert(200);
    };

    xhr.send();
});