chrome.runtime.onInstalled.addListener(function() {
    
});

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("message received!");
    switch (request.action){
        case "processTitle":
            processTitle(request.value);
            break;
    }
});