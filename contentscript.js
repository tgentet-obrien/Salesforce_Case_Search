var sessionID = document.cookie.match('sid=([^;]*)')[1];

sforce.connection.sessionId = sessionID;

/* Create variable with messages called from the manifest.json script */
var promptMessage = chrome.i18n.getMessage("errorMsg");
var whatCase = chrome.i18n.getMessage("whatCase");

caseQuery();

/* Start search function */
function caseQuery() {
    /* Create variable and set to false, used later to throw error if need be */
    var blockSearch = "";

    /* Check SF session cookie in try catch, change to true if session cookie is matched */
    try {
        this.__sfdcSessionId = document.cookie.match(/(^|;\s*)sid=(.+?);/)[2];
    } catch (e) {
        blockSearch = true;
    }
    var resultTrim = prompt(whatCase.trim());
    var result = resultTrim.replace(/\'+/g,"\\'");

    if(blockSearch == true) {
        alert("You must log into Salesforce prior to running the case search.");
    } else if(blockSearch == false) {
        if(result == null) {
            return false;
        } else if(result.indexOf("--") != -1) {
            if(result.indexOf(" --") != -1){
                var result = result.split(" --");
            } else if(result.indexOf("--")){
                var result = result.split("--");
            }
            if(result[1].toUpperCase() == "EDIT"){
                if(result.indexOf(":ref") == -1) {
                    caseNumSearch("EDIT", result[0]);
                } else if(result.indexOf(":ref") != -1) {
                    refSearch("EDIT", result[0]);
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
            }
            if(result[1].toUpperCase() == "CLOSE"){
                if(result.indexOf(":ref") == -1) {
                    caseNumSearch("CLOSE", result[0]);
                } else if(result.indexOf(":ref") != -1) {
                    refSearch("CLOSE", result[0]);
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
            }
            if(result[1].toUpperCase() == "ASSIGN"){
                if(result.indexOf(":ref") == -1) {
                    caseNumSearch("ASSIGN", result[0]);
                } else if(result.indexOf(":ref") != -1) {
                    refSearch("ASSIGN", result[0]);
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
            }
            if(result[1].toUpperCase() == "A/C"){
                if(result.indexOf(":ref") == -1) {
                    caseNumSearch("A/C", result[0]);
                } else if(result.indexOf(":ref") != -1) {
                    refSearch("A/C", result[0]);
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
            }
        } else if(result.indexOf(":ref") == -1) {
            caseNumSearch(undefined, result);
        } else if(result.indexOf(":ref") != -1) {
            refSearch(undefined, result);
        } else {
            alert("'" + result + "'" + promptMessage);
        }
    }
}

function caseNumSearch(type, result){
    var caseQuery = sforce.connection.query("SELECT Id, Subject, CaseNumber FROM Case WHERE CaseNumber = '" + result + "' ORDER BY LastModifiedDate DESC LIMIT 10");
    var caseId = caseQuery.getArray("records");
    var id = caseId[0].Id.substring(0,15);
    if (caseQuery.size == 1) {
        if(type == undefined){
            window.location = URL = "https://" + window.location.host + "/" + id;
        } else if(type == "EDIT"){
            window.location = URL = "https://" + window.location.host + "/" + id + "/e?retURL=%2F" + id;
        } else if(type == "CLOSE"){
            window.location = URL = "https://" + window.location.host + "/" + id + "/s?retURL=%2F" + id;
        } else if(type == "ASSIGN"){
            assign(result);
        } else if(type == "A/C"){
            assignAndClose(result);
        }
    } else {
        alert("'" + result + "'" + promptMessage);
    }
}

function refSearch(type, result){
    var id;
    if(result.indexOf("500") != -1){
        var search = result.indexOf("500");
        var queryId = result.substring(search);
            id = queryId.substring(0,10).split("C").join("C00000");
    } else if (!isNaN(result)) {
        var caseQuery = sforce.connection.query("SELECT Id, Subject, CaseNumber FROM Case WHERE Subject = '" + result + "' OR CaseNumber = '" + result + "' ORDER BY LastModifiedDate DESC LIMIT 10");
        var caseId = caseQuery.getArray("records");
        if(caseQuery.size == 1){
            id = caseId[0].Id.substring(0,15);
        } else if (caseQuery > 1){
            var num = "";
            for(var i = 0; i < caseQuery.size; i++) {
                num +=  (i+1) + ") " + caseId[i].CaseNumber + " " + caseId[i].Subject.substring(0,20) + "\r\n";
            }
            var idSelect = prompt("Please enter the number from the list below, corresponding to your case number, if your case has not been found then please try again:\r\n" + num);
            var idFinal = idSelect - 1;
                id = caseId[idFinal].Id.substring(0,15);
        } else {
            alert("'" + result + "'" + promptMessage);
        }
    } else {
        alert("'" + result + "'" + promptMessage);
    }
    if(type == undefined){
        window.location = URL = "https://" + window.location.host + "/" + id;
    } else if(type == "EDIT"){
        window.location = URL = "https://" + window.location.host + "/" + id + "/e?retURL=%2F" + id;
    } else if(type == "CLOSE"){
        window.location = URL = "https://" + window.location.host + "/" + id + "/s?retURL=%2F" + id;
    } else if(type == "ASSIGN"){
        assign(id);
    } else if(type == "A/C"){
        assignAndClose(id);
    }
}

function assign(id){
    var newOwner = sforce.connection.getUserInfo().userId;
    var sfcase = new sforce.SObject("case");
        sfcase.id = id;
        sfcase.OwnerId = newOwner;
        sforce.connection.update([sfcase]);
    var result = sforce.connection.update([sfcase]);
    if(result == undefined){
        alert("Please click okay to continue");
        window.location = "https://" + window.location.host + "/" + id;
    } else {
        alert("Warning an error occurred:\r\n" + result[0].errors.statusCode + "\r\n"
         + "The following error was encountered:\r\n" + result[0].errors.message + "\r\n"
         + "The error was found on the following field:\r\n" + result[0].errors.fields);
    }
}

function assignAndClose(id){
    var newOwner = sforce.connection.getUserInfo().userId;
    var sfcase = new sforce.SObject("case");
        sfcase.id = id;
        sfcase.Status = "Closed";
        sfcase.OwnerId = newOwner;
        sforce.connection.update([sfcase]);
    var result = sforce.connection.update([sfcase]);
    if(result == undefined){
        alert("Your case was update.");
        window.location = "https://" + window.location.host + "/" + id;
    } else {
        alert("Warning an error occurred:\r\n" + result[0].errors.statusCode + "\r\n"
         + "The following error was encountered:\r\n" + result[0].errors.message + "\r\n"
         + "The error was found on the following field:\r\n" + result[0].errors.fields);
    }
}

function close(id){
    var newOwner = sforce.connection.getUserInfo().userId;
    var sfcase = new sforce.SObject("case");
        sfcase.id = id;
        sfcase.Status = "Closed"
        sforce.connection.update([sfcase]);
    var result = sforce.connection.update([sfcase]);
    if(result == undefined){
        alert("Your case was update.");
        window.location = "https://" + window.location.host + "/" + id;
    } else {
        alert("Warning an error occurred:\r\n" + result[0].errors.statusCode + "\r\n"
         + "The following error was encountered:\r\n" + result[0].errors.message + "\r\n"
         + "The error was found on the following field:\r\n" + result[0].errors.fields);
    }
}