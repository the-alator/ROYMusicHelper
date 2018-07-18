let dzidzioMarsik = document.getElementById("Дзидзьо - марсик");
let SAD = document.getElementById("SAD");
let SADInput = document.getElementById("SADInput");

dzidzioMarsik.addEventListener("click", function (e) {
    chrome.runtime.sendMessage({action: "processTitle", value: dzidzioMarsik.value});
});

SAD.addEventListener("click", function (e) {
    console.log("attempt to SAD " + SADInput.value);
    chrome.runtime.sendMessage({action: "processTitle", value: SADInput.value});
});

let button = document.getElementById("dwnldbtn");
button.setAttribute("src", chrome.runtime.getURL("resources/images/general/download.png"));