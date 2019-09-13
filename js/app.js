SA_Application = {
	regex : {
        'url' : new RegExp(/https:\/\/[a-zA-Z]+.(simplechurchcrm|elexiochms|siteorganicrt|easytitheplus|churchofficechms|bridgeelementchms|e-zekielchms|twenty28chms|e360chms|fellowshiponego).com/),
        'domain' : new RegExp(/(?<=\/\/)[a-zA-Z]+/)  
    }
}

class ChurchInstance {
	constructor(id, name, accountUrl, domain, siteUrl, email, isActive, accountType, lastAction, signedUp, numRecords, status3) {
		this.id = id;
		this.name = name;
		this.accountUrl = accountUrl;
		this.domain = domain;
		this.siteUrl = siteUrl;
		this.email = email;
		this.isActive = isActive;
		this.accountType = accountType;
		this.lastAction = lastAction;
		this.signedUp = signedUp;
		this.numRecords = numRecords;
		this.status3 = status3;
		ChurchInstance.instances.push(this);
	}

	isActive() {
		return this.isActive;
	}

	// Returns a church with the given ID
	static getInstanceById(id) {
		let arr = ChurchInstance.instances;
		for(let x = 0; x < arr.length; x++) {
			if(arr[x].id === id)
				return arr[x];
		}
		return null;
	}

	// Returns a church with the given domain
	static getInstanceByDomain(domain) {
		let arr = ChurchInstance.instances;
		for(let x = 0; x < arr.length; x++) {
			if(arr[x].domain === domain)
				return arr[x];
		}
		return null;
	}

	static isWhiteLabelUrl(url) {
		return url.match(SA_Application.regex['url']) && url.match(SA_Application.regex['domain'])[0] !== 'admin' ? true : false;
	}

	static getDomainFromUrl(url) {
		var match = url.match(SA_Application.regex['domain']);
		if(!match)
			return null;
		return match[0]; 
	}
	
} 

// Dynamic array that holds instances as they are constructed.
ChurchInstance.instances = [];

function println(message, lifetime = 3500, fade = 500) {
    $("#alert-main").hide();
    $("#alert-main").text(message);
    $("#alert-main").show().delay(lifetime).fadeOut(fade);
}

$(document).ready(function () {

	var select_header = document.getElementById('select-header');
    var input_key = document.getElementById('text-key');
	var table_instances = document.getElementById('table-instances');
	
	input_key.addEventListener("input", sendSearchRequest);

    /* A very hacky and terrible way of getting url requests by domain name to work
    * This will obviously need adjustments but it works for now i guess..*/
    chrome.storage.local.get(['workingAccount'], function (result) {
        if (result.workingAccount) {
            chrome.tabs.query({ url: "*://admin.simplechurchcrm.com/*" }, function (tabs) {
                if (tabs.length > 0) {
                    var buffer = {
                        type: 'urlRequest',
                        domain: result.workingAccount
                    }
                    chrome.tabs.sendMessage(tabs[0].id, buffer, function (response) {
						if(response && response.results)
							setAccountTab(response.results);
                    });
                }
            });
        }
	});
	
	function setAccountTab(url) {
		var dest = "https://admin.simplechurchcrm.com" + url;
		$.get(dest, function(callback) {
            // Church Name
			var churchName = $('#pageTitle', callback).text().split('Edit: ')[1];
            $('#account-church-name').text(churchName);

            // Internal
			$('#inputContactName').val($('#contactName', callback).val());
			$('#inputPhoneNumber').val($('#phoneNumber', callback).val());
			$('#inputChurchOfficeId').val($('#churchOfficeId', callback).val());
			$('#inputShelbyDomain').val($('#sfoDomain', callback).val());
			$('#inputShelbyLabel').val($('#sfoLabelName', callback).val());
            $('#inputGivingId').val($('#givingChurchId', callback).val());
            $('#givingLink').attr('href', 'https://app.easytithe.com/mgadmin/church_detail.asp?churchid=' + $('#givingChurchId', callback).val());
			$('#inputInternalId').val($('#internalId', callback).val());

			// Billing
			$('#inputPricingModel').val($('#priceModel option:selected', callback).text());
			$('#inputPricingTier').val($('#priceTier option:selected', callback).text());
			$('#inputPrice').val($("input[name='price']", callback).val());
			$('#inputNotes').val($("input[name='priceNote']", callback).val());
			$('#inputReviewDate').val($("input[name='priceReviewDate']", callback).val());
			$('#inputFrequency').val($('#paymentFrequency option:selected', callback).text());
			$('#inputPaymentMethod').val($('#paymentMethod option:selected', callback).text());
            $('#inputStripeId').val($('#subscriptionId', callback).val());
            $('#stripeLink').attr('href', 'https://dashboard.stripe.com/customers/' + $('#subscriptionId', callback).val());
			$('#inputWHMCSId').val($('#whmcsId', callback).val());
            $('#inputSalesAgent').val($('#agentId', callback).val());

            // Flags
            $('#inputCRMEnabled').attr('checked', $('#crm', callback).attr('checked'));
            $('#inputCalendarEnabled').attr('checked', $('#calendar', callback).attr('checked'));
            $('#inputFormsEnabled').attr('checked', $('#fms', callback).attr('checked'));
            $('#inputDashboardEnabled').attr('checked', $('#dashboardEnabled', callback).attr('checked'));
            $('#inputHighgroundsEnabled').attr('checked', $('#hgsEnabled', callback).attr('checked'));
            $('#inputBillingLockEnabled').attr('checked', $('#billingLocked', callback).attr('checked'));
            $('#inputActiveEnabled').attr('checked', $('#active', callback).attr('checked'));
		});
	}
		
	// <select> linking
	$( "#dropdown-header a" ).click(function() {
		$("#select-header").text($(this).text());
		chrome.storage.local.set({last_header: select_header.innerText}, function() {});
	});
	
	/* This section of code handles enabling / disabling
	script functionality depending on the current url.
	*/	
	function setSearchFunctionality() {
		chrome.tabs.query({}, function(tabs) {
			var shouldEnableSearch = false;	
			for(var t = 0; t < tabs.length; t++) {
				if(tabs[t].url.includes("admin.simplechurchcrm.com")) {
					shouldEnableSearch = true;
				}
			}
			if(!shouldEnableSearch) {
				$("#text-key").prop("disabled", true);
                $("#select-header").addClass("disabled");
                $("#account-tab").prop('disabled', true).addClass("disabled");
				println("Search & Account functionality has been disabled. Make sure the admin portal is open in at least one tab.", 10000, 2000);
			} else {
				$("#text-key").prop("disabled", false);	
                $("#select-header").removeClass("disabled");
                $("#account-tab").prop('disabled', false).removeClass("disabled");
			}	
		});
	} 
	setSearchFunctionality();
	
	function setScriptFunctionality() {
		chrome.storage.local.get(['scripts_enabled'], function(result) {
			if(result.scripts_enabled)
				$("#tools-tab").prop('disabled', false).removeClass("disabled");
			else
				$("#tools-tab").prop('disabled', true).addClass("disabled");
		});
	} 
	setScriptFunctionality();
	
	$("#tools-tab").click(function() {
		if(!$(this).hasClass("disabled"))
			return;
		println("Scripts are disabled for this page.");
	});
	
	/* Load last inputs will reset the popup state to what the user last 
	saw when they clicked out of the popup.
	*/
	
	function loadLastInputs() {
		chrome.storage.local.get(['last_header'], function(result) {
			if(result.last_header) {
				select_header.innerText = result.last_header;
			}
		});
		chrome.storage.local.get(['last_key'], function(result) {
			if(result.last_key) {
				input_key.value = result.last_key;
			}
		});
		chrome.storage.local.get(['last_results'], function(result) {
			if(result.last_results) {	
				//console.log("here");
				var table_body = table_instances.getElementsByTagName('tbody')[0];
				for(var x = 0; x < result.last_results.length; x++) {
					
					var buttonID = "buttonInfo"+x;

					var row = table_body.insertRow(0);
					var cell_info = row.insertCell(0);
					var cell_name = row.insertCell(1);
					var cell_domain = row.insertCell(2);
					
					cell_info.innerHTML = "<a id='"+buttonID+"' href='#' data-toggle='modal' data-target='#exampleModalCenter' data-chname='"+result.last_results[x][1]+"' data-chid='"+result.last_results[x][0]+"' data-chrecords='"+result.last_results[x][11]+"' data-chemail='"+result.last_results[x][5]+"' data-chactive='"+result.last_results[x][6]+"' data-chcreated='"+result.last_results[x][7]+"' data-chtype='"+result.last_results[x][8]+"' data-chlastaction='"+result.last_results[x][9]+"' data-chsignup='"+result.last_results[x][10]+"'><i class='fas fa-file-alt' style='margin-top: 5px;'></i></a>"
					cell_name.innerHTML = "<a target='_blank' class='link_name' href='http://admin.simplechurchcrm.com" + result.last_results[x][2] + "'>" + result.last_results[x][1] + "</a>";
					cell_domain.innerHTML = "<a target='_blank' class='link_domain' href='" + result.last_results[x][4] + "'>" + result.last_results[x][3] + "</a>";

                    if (result.last_results[x][12] === true) {
                        cell_info.children[0].classList.add("status-3");
                        cell_name.children[0].classList.add("status-3");
                        cell_domain.children[0].classList.add("status-3");
                    }

					$("#"+buttonID).click(function() {
						var name = $(this).attr("data-chname");
						var buffer = [
							"Number of records: " + $(this).attr("data-chrecords"),
							"Email: " + $(this).attr("data-chemail"),
							"Active?: " + $(this).attr("data-chactive"),
							"Created on: " + $(this).attr("data-chcreated"),
							"Account type: " + $(this).attr("data-chtype"),
							"Last action: " + $(this).attr("data-chlastaction"),
							"Signup date: " + $(this).attr("data-chsignup"),
						];

						for(var x = 0; x < buffer.length; x++) {
							if(buffer[x].endsWith(' ')) {
								buffer.splice(x, 1);
							}
						}
						setModalText(name, buffer);
					});
				}
			}
		});
	} loadLastInputs();
	
	// testing the functionality of running a script. 

	$("#scripts a").click(function() {
		
		
		var $anchor = $(this);
		if($anchor.hasClass("disabled"))
			return;
		
		var $surl = $anchor.attr('data-surl');
		var $spinner = $(".fa-sync-alt", $anchor);
		
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {	
		
			// since only one tab should be active and in the current window at once
			// the return variable should only have one entry
			var activeTab = tabs[0];
			var substrings = activeTab.url.split(".");
			var scriptUrl = substrings[0] + "." + substrings[1] + ".com" + $surl;	
			var msg = "";

			if(ChurchInstance.isWhiteLabelUrl(activeTab.url)) {
				switch($surl) {
					case "/internal/find_duplicates":
						createWindow(screen.width, screen.height, scriptUrl);
						break;
					case "/members/asscociate_gifts_with_pledges":
						$("#scripts a").addClass("disabled");
						$spinner.removeClass("disabled");
						$.get(scriptUrl, function(callback) {
							// A little regexp magic to extract any numbers out of the 
							// HTML response.
							var contributions = callback.match(/\d+/g).map(Number);	
							if(contributions[0] <= 0) {
								msg = "No contributions were associated with pledges.";
							} else {
								msg = "Associated " + contributions[0] + " contributions with pledges.";	
							}
							$("#scripts a").removeClass("disabled");
							$spinner.addClass("disabled");
							println(msg);
						});
						break;
					default:
						// Disable scripts until the current query is done.
						$spinner.removeClass("disabled");
						$("#scripts a").addClass("disabled");
						$.get(scriptUrl, function(callback) {
							$("#scripts a").removeClass("disabled");
							$spinner.addClass("disabled");
							println("Done!");
						});
						break;
				}			
			} else {
				msg = "Error: must be viewing a churches page to run scripts";
				println(msg);
			}
		});
	});
	
	// Helper function to get a window open. This is only here for the /findduplicates script.
	function createWindow(width, height, url)
	{
		var x = (screen.width / 2) - (width / 2);
		var y = (screen.height / 2) - (height / 2);
		return window.open(url, "", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+width+', height='+height+', top='+y+', left='+x);
	}
	
	function sendSearchRequest() {
		chrome.tabs.query({url: "*://admin.simplechurchcrm.com/*"}, function(tabs) {	
			if(!tabs || tabs.length == 0) {
				$("#text-key").prop("disabled", true);
				console.log("Error: search results not sent!\n Admin portal tab not present?");
			} else {	
				sendMessageToTab(tabs[0].id);		
				console.log("Sent search request buffer to " + tabs[0].url);
			}
		});
	}

	// Set the meta-data for a church in the modal before showing it
	function setModalText(church_name, items) {
		$("#exampleModalLongTitle").text(church_name);
		var body = "<ul class='list-group'>";
		for(var t = 0; t < items.length; t++) {
			body += "<li class='list-group-item'>" + items[t] + "</li>";
		}
		body += "<ul>";
		$(".modal-body").html(body);
	}
	
	function sendMessageToTab(tab) {
		// the search request
        var buffer = {
            type: 'searchRequest',
			header: select_header.innerText,
			key: input_key.value
		}		
	
		// Send a search request to the content script
		chrome.tabs.sendMessage(tab, buffer, function(response) {
			
			if(!response) {
				println("Still loading instances..");
				return;
			}
			
			// Making sure to clear last_results if the search input is empty
			if(!response.results) {
				var table_body = table_instances.getElementsByTagName('tbody')[0];
				while(table_body.hasChildNodes()) {
					table_body.removeChild(table_body.lastChild);
				}			
				// Clear last results in local storage. 
				chrome.storage.local.set({last_results:	null}, function() {
					console.log("Last results cleared: no search results available");
				});
			} else {	
				var table_body = table_instances.getElementsByTagName('tbody')[0];
	
				while(table_body.hasChildNodes()) {
					table_body.removeChild(table_body.lastChild);
				}
	
				for(var x = 0; x < response.results.length; x++) {
					var row = table_body.insertRow(0);
					var cell_info = row.insertCell(0);
					var cell_name = row.insertCell(1);
					var cell_domain = row.insertCell(2);
					
					var buttonID = "buttonInfo"+x;
					
					cell_info.innerHTML = "<a id='"+buttonID+"' href='#' data-toggle='modal' data-target='#exampleModalCenter' data-chname='"+response.results[x][1]+"' data-chid='"+response.results[x][0]+"' data-chrecords='"+response.results[x][11]+"' data-chemail='"+response.results[x][5]+"' data-chactive='"+response.results[x][6]+"' data-chcreated='"+response.results[x][7]+"' data-chtype='"+response.results[x][8]+"' data-chlastaction='"+response.results[x][9]+"' data-chsignup='"+response.results[x][10]+"'><i class='fas fa-file-alt' style='margin-top: 5px;'></i></a>"
					//cell_info.innerHTML = "<button id='" + buttonID + "' type='button' class='btn btn-primary' data-toggle='modal' data-target='#exampleModalCenter' data-chname='"+response.results[x][1]+"'>?</button>";
					cell_name.innerHTML = "<a target='_blank' class='link_name' href='https://admin.simplechurchcrm.com" + response.results[x][2] + "'>" + response.results[x][1] + "</a>";
					cell_domain.innerHTML = "<a target='_blank' class='link_domain' href='" + response.results[x][4] + "'>" + response.results[x][3] + "</a>";
					
					// Make sure status3 carries over
					if(response.results[x][12] === true) {
						cell_info.children[0].classList.add("status-3");
						cell_name.children[0].classList.add("status-3");
						cell_domain.children[0].classList.add("status-3");
					}
			
					$("#"+buttonID).click(function() {
						var name = $(this).attr("data-chname");
						var buffer = [
							"ID: " + $(this).attr("data-chid"),
							"Number of records: " + $(this).attr("data-chrecords"),
							"Email: " + $(this).attr("data-chemail"),
							"Active?: " + $(this).attr("data-chactive"),
							"Created on: " + $(this).attr("data-chcreated"),
							"Account type: " + $(this).attr("data-chtype"),
							"Last action: " + $(this).attr("data-chlastaction"),
							"Signup date: " + $(this).attr("data-chsignup")
						];
						
						/* If any of the data elements are empty, they 
						are ignored in the modal output.*/
						for(var x = 0; x < buffer.length; x++) {
							if(buffer[x].endsWith(' ')) {
								buffer.splice(x, 1);
							}
						}
						setModalText(name, buffer);
					});
				}
				
				chrome.storage.local.set({last_results: response.results}, function() {
					//console.log("results set -> " + response.results);
				});
			}
		});
	
		chrome.storage.local.set({last_header: select_header.innerText}, function() {
			//console.log("header set -> " + select_header.value);
		});
	
		chrome.storage.local.set({last_key: input_key.value}, function() {
			//console.log("key set -> " + input_key.value);
		});
	}
});
