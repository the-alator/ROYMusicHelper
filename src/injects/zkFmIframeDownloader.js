$(document).ready(function () {
    console.log("zkFmIframeDownloader launched");
    document.head.innerHTML = "";
    document.body.innerHTML = "";

    let iframe = createIframe();

    window.addEventListener("message", function (event) {
        console.log("setIframeAndDownload url - " +  event.data);
        let oldSrc = iframe.attr("src");

        if(oldSrc ===  event.data){
            iframe.remove();
            iframe = createIframe( event.data);
            console.log("frame recreated");
        } else {
            iframe.attr("src",  event.data);
            console.log("frame data changed");
        }
    });

    function createIframe(src){
        src = src || "";
        return $("<iframe>").attr("src", src).appendTo("body");
    }
});

