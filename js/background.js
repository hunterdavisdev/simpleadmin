// A global namespace to prevent name clashing
var SA_Background = {
    // Regex objects for validating church urls and extracting the site's subdomain
    regex : {
        'url' : new RegExp(/https:\/\/[a-zA-Z]+.(simplechurchcrm|elexiochms|siteorganicrt|easytitheplus|churchofficechms|bridgeelementchms|e-zekielchms|twenty28chms|e360chms|fellowshiponego).com/),
        'domain' : new RegExp(/(?<=\/\/)[a-zA-Z]+/)
    }
};

/* Since the DOM in popup.html is in its own world and is reset every
time it loses focus, various states will need to be set in chrome storage 
so the popup can remember if certain functionality should be enabled or not. 
*/

// clear the local storage every time we restart chrome
chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.clear()
});


// an event listener for when the user changes tabs:
chrome.tabs.onActivated.addListener(function(tabInfo) {		
    updateScriptAccess(tabInfo.tabId);
    updateWorkingAccount(tabInfo.tabId);
});

// an event listener for when the current tab changes:
chrome.tabs.onUpdated.addListener(function(tabId) {	
    updateScriptAccess(tabId);
    updateWorkingAccount(tabId);
}); 

/* Cull the url against the whitelist. The only exception to the 
white label equalling 'simplechurchcrm' is if the host is 'admin' 
which would mean the use is on the admin portal tab instead of an
anctual simplechurch instance. */
function updateScriptAccess(tabId) {
	chrome.tabs.get(tabId, function(tab) {  
        if(isWhiteLabelUrl(tab.url))
            chrome.storage.local.set({'scripts_enabled' : true}, function() {}); 
        else
            chrome.storage.local.set({'scripts_enabled' : false}, function() {});
	});
}

/* This function will run the current tab's url through a regex that confirms we're working in whitelabel scope.
If our url doesn't match the https://domain.whitelabel.com format, we can ingore it. */
function updateWorkingAccount(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        if (isWhiteLabelUrl(tab.url)) 
            chrome.storage.local.set({'workingAccount' : getDomainFromUrl(tab.url)}, function () {});      
    });
}

// Helper functions

function isWhiteLabelUrl(url) {
    return url.match(SA_Background.regex['url']) && url.match(SA_Background.regex['domain'])[0] !== 'admin' ? true : false;
}

function getDomainFromUrl(url) {
    var match = url.match(SA_Background.regex['domain']);
    if(!match)
        return null;
    return match[0]; 
}
