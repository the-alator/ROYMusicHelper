let ajt1B = document.getElementById("ajaxtest1");
let console = document.getElementById("console");

function textNode(text){
    let newTextNode = document.createElement("div");
    newTextNode.innerText = text;
    return newTextNode;
}
ajt1B.addEventListener("click", function (e) {
    console.appendChild(textNode("Clicked"));
});

let absDebugPageLocation = "/src/main/general/debug.html";
$("#inPopupDebug").click(function (e) {
    window.location = absDebugPageLocation;
});

$("#inPageDebug").click(function (e) {
    chrome.tabs.create({url:absDebugPageLocation});
});

$("#inPageDebugWindow").click(function (e) {
    window.open("http://javascript.ru",2, "ddddd", 3, "width=420,height=230,resizable=yes,scrollbars=yes,status=yes,menubar=yes,toolbar=yes", 4);
});