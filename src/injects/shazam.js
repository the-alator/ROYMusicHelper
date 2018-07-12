setTimeout(function () {
    alert("DONE1");
    setButtons();
    $('#\\/myshazam\\/shazams ul').on("DOMSubtreeModified", setButtons);
    // $("div.shazams-content.active").on("DOMSubtreeModified", setButtons);
    // document.addEventListener("scroll", setButtons);
}, 2000);

function setButtons(){
    alert("BUTTONS SET");
    $("article.shz-partial-track div.details").after("<div style='color:black'>BTN</div>");
}
