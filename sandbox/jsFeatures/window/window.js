let window_close = document.getElementById("window_close");
let window_open = document.getElementById("window_open");
let window_close_assoc = document.getElementById("window_close_assoc");


window_close.addEventListener("click", function(){
    window.close();
});

window_open.addEventListener("click", function(){
    window.open("http://javascript.ru",2, "JSSite", 3, "width=420,height=230,resizable=yes,scrollbars=yes,status=yes", 4);

});

window_close_assoc.addEventListener("click", function(){
    window["close"]();
});
