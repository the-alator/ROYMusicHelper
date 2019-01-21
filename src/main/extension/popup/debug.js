let SAD = document.getElementById("SAD");
let SADInput = document.getElementById("SADInput");

SAD.addEventListener("click", function (e) {
    console.log("attempt to SAD " + SADInput.value);
    chrome.runtime.sendMessage({action: "getSongListByTitle", value: SADInput.value});
});
