
let absDebugPageLocation = "/src/main/extension/popup/debug.html";
$("#inPopupDebug").click(function (e) {
    window.location = absDebugPageLocation;
});

$("#inPageDebug").click(function (e) {
    chrome.tabs.create({url:absDebugPageLocation});
});
