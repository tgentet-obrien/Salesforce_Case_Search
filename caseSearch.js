chrome.browserAction.onClicked.addListener(function (tab) {
    if (tab.url.indexOf(".salesforce.com/") != -1 || tab.url.indexOf(".visual.force.com/") != -1 ) {
        chrome.tabs.executeScript(tab.id, {
            "file": "contentscript.js"
        }, function () {
            console.log("Script Executed .. ");
        });
    } else {
    	var wrongTab = chrome.i18n.getMessage("wrongTab");
		console.log(wrongTab);
		alert(wrongTab);
    }
});