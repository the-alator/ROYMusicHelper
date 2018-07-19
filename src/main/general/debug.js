let dzidzioMarsik = document.getElementById("Дзидзьо - марсик");
let dzidzioSara = document.getElementById("дзидзьо сара");
let introMantador = document.getElementById("Intro Matador/Perreo Japonés Dura DJ");
let SAD = document.getElementById("SAD");
let SADInput = document.getElementById("SADInput");

dzidzioMarsik.addEventListener("click", function (e) {
    chrome.runtime.sendMessage({action: "processTitle", value: dzidzioMarsik.value});
});

dzidzioSara.addEventListener("click", function (e) {
    chrome.runtime.sendMessage({action: "processTitle", value: dzidzioSara.value});
});


introMantador.addEventListener("click", function (e) {
    chrome.runtime.sendMessage({action: "processTitle", value: introMantador.value});
});

SAD.addEventListener("click", function (e) {
    console.log("attempt to SAD " + SADInput.value);
    chrome.runtime.sendMessage({action: "processTitle", value: SADInput.value});
});
