// header struct
var headers = {
  id: 0,
  name: 1,
  domain: 2,
  email: 3,
  account_active: 4,
  date_created: 5,
  account_type: 6,
  last_action: 7,
  signed_up: 8,
  number_records: 9
};

// this is where we'll store all instances found in the table
var instances = [];

function getInstances() {
  // return every row in the document
  return document.getElementsByTagName("tr");
}

function queryInstances(header, key) {
  // initialize the return array
  var arr = [];

  // search through all instances
  for (var t = 1; t < instances.length; t++) {
    // if the user backspaces all the way back to an empty search field
    // ignore the search.
    if (key.length == 0) return;

    // ignore case sensitivity
    var input = key.toUpperCase();

    // Name and Domain searches
    if (header === headers.name) {
      var line = instances[t].children[
        header
      ].children[0].innerText.toUpperCase();
      if (line.indexOf(input) > -1) {
        var status3 = false;

        // add class-3 if it exists
        if (instances[t].children[headers.name].className === "status-3")
          status3 = true;

        var returnarr = [
          instances[t].children[headers.id].innerText,
          instances[t].children[headers.name].children[0].innerText,
          instances[t].children[headers.name].children[0].attributes["href"]
            .value,
          instances[t].children[headers.domain].children[0].innerText,
          instances[t].children[headers.domain].children[0].attributes["href"]
            .value,
          instances[t].children[headers.email].innerText,
          instances[t].children[headers.account_active].innerText,
          instances[t].children[headers.date_created].innerText,
          instances[t].children[headers.account_type].innerText,
          instances[t].children[headers.last_action].innerText,
          instances[t].children[headers.signed_up].innerText,
          instances[t].children[headers.number_records].innerText,
          status3
        ];

        if (arr.length <= 25) arr.push(returnarr);
      }
      // ID searches
    } else if (header == headers.id || header == headers.domain) {
      var line = instances[t].children[
        header
      ].children[0].innerText.toUpperCase();
      if (line == input) {
        var status3 = false;

        // add class-3 if it exists
        if (instances[t].children[headers.name].className === "status-3")
          status3 = true;

        var returnarr = [
          instances[t].children[headers.id].innerText,
          instances[t].children[headers.name].children[0].innerText,
          instances[t].children[headers.name].children[0].attributes["href"]
            .value,
          instances[t].children[headers.domain].children[0].innerText,
          instances[t].children[headers.domain].children[0].attributes["href"]
            .value,
          instances[t].children[headers.email].innerText,
          instances[t].children[headers.account_active].innerText,
          instances[t].children[headers.date_created].innerText,
          instances[t].children[headers.account_type].innerText,
          instances[t].children[headers.last_action].innerText,
          instances[t].children[headers.signed_up].innerText,
          instances[t].children[headers.number_records].innerText,
          status3
        ];
        if (arr.length <= 25) arr.push(returnarr);
      }
      // Email searches
    } else {
      var line = instances[t].children[header].innerText.toUpperCase();
      if (line.indexOf(input) > -1) {
        var status3 = false;

        // add class-3 if it exists
        if (instances[t].children[headers.name].className === "status-3")
          status3 = true;

        var returnarr = [
          instances[t].children[headers.id].innerText,
          instances[t].children[headers.name].children[0].innerText,
          instances[t].children[headers.name].children[0].attributes["href"]
            .value,
          instances[t].children[headers.domain].children[0].innerText,
          instances[t].children[headers.domain].children[0].attributes["href"]
            .value,
          instances[t].children[headers.email].innerText,
          instances[t].children[headers.account_active].innerText,
          instances[t].children[headers.date_created].innerText,
          instances[t].children[headers.account_type].innerText,
          instances[t].children[headers.last_action].innerText,
          instances[t].children[headers.signed_up].innerText,
          instances[t].children[headers.number_records].innerText,
          status3
        ];

        if (arr.length <= 25) arr.push(returnarr);
      }
    }
  }
  return arr;
}

// load the DOM
instances = getInstances();

function getAccountUrlFromDomain(domain) {
  if (instances && instances.length > 0) {
    for (var t = 1; t < instances.length; t++) {
      if (
        instances[t].children[headers.domain].children[0].innerText === domain
      )
        return instances[t].children[headers.name].children[0].attributes[
          "href"
        ].value;
    }
    return null;
  } else {
    return null;
  }
}

// listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "searchRequest":
      // translate request.header for proper indexing
      var header_index = headers[request.header.toLowerCase()];
      // query for matching search results
      var search_results = queryInstances(header_index, request.key);
      // send the results back if they exist
      // if search results exist or the search results container is defined??
      if (search_results !== null || search_results !== undefined) {
        sendResponse({ results: search_results });
      }
      break;
    case "urlRequest":
      if (request.domain) {
        var requestedUrl = getAccountUrlFromDomain(request.domain);
        if (requestedUrl && requestedUrl.length > 0)
          sendResponse({ results: requestedUrl });
        else
          console.log(
            "URL Request Error: No URL's match the supplied domain: " +
              request.domain
          );
        sendResponse({ results: null });
      } else {
        console.log("URL Request Error: domain is undefined.");
        sendResponse({ results: null });
      }
      break;
    default:
      console.log("Error: unrecognized message type");
      break;
  }
});
