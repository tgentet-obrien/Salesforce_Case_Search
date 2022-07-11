chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.executeScript(activeInfo.tabId, {
        "file": "connection.js"
    }, function(){
        console.log("onActivated Executed");
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    chrome.tabs.executeScript(tab.id, {
        "file": "connection.js"
    }, function(){
        console.log("onUpdated Executed");
    });
});

chrome.browserAction.onClicked.addListener(function (tab) {
    if (tab.url.indexOf(".salesforce.com/") != -1 || tab.url.indexOf(".visual.force.com/") != -1 ) {
        chrome.tabs.executeScript({
            file: "connection.js"
        }, function(){
            chrome.tabs.executeScript({
                file: "contentscript.js"
            });
        });
    } else {
		alert(chrome.i18n.getMessage("wrongTab"));
    }
});