$(function () {
    let observerTarget = document.querySelector("ytd-app");
    let observerOptions = {
        childList : true,
        subtree : true
    };

    let mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {

            mutation.addedNodes.forEach(function (node) {
                if(node.nodeName.toLowerCase() === "ytd-video-primary-info-renderer"){
                    console.log("container found");
                    console.log(node);

                    wrapTitleToFlexDiv(node.firstChild);
                    setButtonListener();
                    // init();
                    mutationObserver.disconnect();
                }
            })
        });
    });

    mutationObserver.observe(observerTarget, observerOptions);
    console.log("Content script is running");
});

function setButtonListener() {
    let button = document.getElementById("ROYMusicHelperDownloadButton");
    button.addEventListener("click", function (event) {
        event.stopImmediatePropagation();

        let text = button.previousSibling.firstChild.textContent;
        console.log("Extracted text - " + text);
        chrome.runtime.sendMessage({action: "getSongListByTitle", value: text});
    });
}
function wrapTitleToFlexDiv(containerDiv) {
    let titleH1 = containerDiv.querySelector("h1");

    console.log(containerDiv);
    console.log(titleH1);
    let flexDiv = document.createElement("div");
    flexDiv.classList.add("roymusichelperFlexTitleWrapper");
    containerDiv.replaceChild(flexDiv, titleH1);
    flexDiv.appendChild(titleH1);
    let button = document.createElement("div");
    button.innerHTML = `<div id='ROYMusicHelperDownloadButton' class='extension.popup-btn flex-reset'>
        <img alt='download' src='${chrome.runtime.getURL("resources/extension/images/download.png")}'>
     </div>`;
    flexDiv.appendChild(button.firstChild);
}
