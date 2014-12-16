/* Create a scriipt element in head of HTML and put /soap/ajax/31.0/connection.js in the src  */
var connectJsUrl = "https://" + window.location.host + "/soap/ajax/32.0/connection.js";

function loadScript(url, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = url;
    var done = false;
    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
            done = true;
            callback();
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
        }
    };
    head.appendChild(script);
}

loadScript(connectJsUrl, function() {
    console.log("Script Confirmed...");
});

/* Check to see if the file have been appended correctly and works correctly */
/*var JSFile = "https://" + window.location.host + connectJsUrl;*/
var req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
if (req == null) {
    console.log("Error: XMLHttpRequest failed to initiate.");
};
req.onload = function() {
    try {
        eval(req.responseText);
    } catch (e) {
        console.log("There was an error in the script file.");
    }
};
try {
    req.open("GET", connectJsUrl, true);
    req.send(null);
} catch (e) {
    console.log("Error retrieving data httpReq. Some browsers only accept cross-domain request with HTTP.");
};