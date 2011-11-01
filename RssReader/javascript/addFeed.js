/*
 * Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SEARCH_PREFIX = 'http://search.yahooapis.com/WebSearchService/rss/webSearch.xml?appid=yahoosearchwebrss&query="';
var SEARCH_SUFFIX = ' rss feed"';
var states = {
		READY:0,
		DOWNLOADING:1,
		PROCESSING:2
};

var url = null;
var progress = 0; // Percentage of maximum time waited.
var DELAY = 1000;  // Time between progress progress updates.
var MAX = 60;  // Maximum number of progress bar updates.
var DOWNLOADMAX = 60; // Maximum number of progress bar updates during download step.
var state = states.READY;
var timeout = 0;

var listOfFeeds;	// Valid Feeds to allow user to select from
var amountToCheck;	// Number of links to check
var checkedAmount;	// Number of links that have been checked

//HTML Fields
var keywordField;
var inputField;
var addButton;
var searchButton;

addEventListener('load',doLoad,false);

/*
 * Page load event callback function.  Sets the screen height.
 */
function doLoad() {
	document.body.style.height = screen.height + 'px';
	openDB(fillElementVariables);
}

function fillElementVariables() {
	inputField = document.getElementById("url");  	
	keywordField = document.getElementById("keywords");
	addButton = document.getElementById("addButton");
	searchButton = document.getElementById("searchButton");
}

/*
 * If a search Feed is a valid Feed add it to the array of valid feeds
 * Once all feeds have been verified clear the url field and display 
 * a spinner for the user to select a feed
 */
function verifyRss() {
{
	var rowHeight,
        visibleRows,
        options,
        checkNumber,
        channelElements,
        feedNames = [];

	if (this.readyState != 4)	
		return; // No data ready to be processed.
	try {	
		checkNumber = ++checkedAmount;	// One less feed to check				
		// Check for errors.
		if (this.status == 200) {			
			// Make sure we got an XML response.
			if (this.responseXML) {				
				// Check that the XML is a feed
				channelElements = this.responseXML.getElementsByTagName("channel");				
				if (channelElements.length > 0) {					
					// Add to feed list
					listOfFeeds[listOfFeeds.length] = {title: this.title, link: this.url};
				}
			}
		}	
		// Once All Search RSS Links have been Checked		
		if (amountToCheck == checkNumber) {

			if (listOfFeeds.length < 1) {
				alert("Unable to find any Rss feeds for '" + keywordField.value +"'");
				clearForm();
			} else {
				clearForm();				
				for (var j=0; j<listOfFeeds.length; j++) {
					feedNames[j] = listOfFeeds[j].title;
				}

				// Configure our spinner                
                if (screen.height < 480) {
                    rowHeight = 60;
                    visibleRows = 3;
                } else {
                    rowHeight = 75;
                    visibleRows = 4;
                }
                options = {
                    'title' : "Which feed would you like to add?",
                    'rowHeight': rowHeight,
                    'visibleRows': visibleRows,
                    'selectedIndex': 0,
                    'items' : feedNames
                };

				// Open the spin dialog
				blackberry.ui.Spinner.open(options,
                    function (choice) {
                        if (choice != undefined) {
                            addNewFeed(listOfFeeds[choice].link);
                        }
                    }
                );
				
			}
		}
	} catch(e) {
		// TODO: Do something better with the exception!!!
		alert(e);
	}
}

function receiveSearch() {	
	if (this.readyState != 4)	
		return; // No data ready to be processed.
	try {			
		// Check for errors.
		if (this.status != 200) { 
			if (this.statusText) {
				alert("Failed to access this site: " + this.statusText);
			}
			resetForm();  // Reset the form elements on the Add Feed page.
			return;
		}
		// Make sure we got an XML response.
		if (null == this.responseXML) {
			alert("Does not appear to be a valid RSS feed.");
			resetForm();
			return;
		}

		// Convert the XML data into a form that the worker can work with.
		var channelElements = this.responseXML.getElementsByTagName("channel");
		if (channelElements.length < 1) {
			alert("Does not appear to be a valid RSS feed.");
			resetForm();
			return;
		}
		amountToCheck = 0;
		checkedAmount = 0;
		listOfFeeds = new Array();
		var channels = new Array();
		for (var i=0; i<channelElements.length; i++) {
			// Find the title for the Channel.
			var channel = channelElements[i];
			var channelTitle = "";
			var names = channel.getElementsByTagName("title");
			for (var j=0; j<names.length; j++) {
				if (names[j].parentNode == channel) {
					channelTitle = names[j].childNodes[0].nodeValue;
					break;
				}
			}

			// Process the Article headers.
			var targets = new Array();
			var targetElements = channel.getElementsByTagName("item");
			for (var j=0; j<targetElements.length; j++) {
				var target = targetElements[j];
				var title = target.getElementsByTagName("title")[0].textContent;
				var link = target.getElementsByTagName("link")[0].childNodes[0].nodeValue;
				title = htmlEscape(title);
				targets[j] = {title: title, link: link};
			}
			channels[i] = targets;
			amountToCheck += targets.length;
		}	
		if (amountToCheck == 0) {
			alert("Unable to find any Rss feeds for '" + keywordField.value +"'");
			clearForm();
			return;
		}	
		// verify that each target is a valid rss url
		for (var k = 0; k < channels.length; k++) {
			var targetFeeds = channels[k];						
			for (var m = 0; m < targetFeeds.length; m++) {
				// request Rss for each target
				try{
					var request = new XMLHttpRequest();
					request.onreadystatechange = verifyRss;					
					request.url = targetFeeds[m].link;
					request.title = targetFeeds[m].title;
					request.open("GET", targetFeeds[m].link);
					request.setRequestHeader("Content-Type", "text/xml; charset=utf-8");						
					request.send();
				} catch(e){alert(e); throw e;}			
			}
		}
	} catch(e) {
		// TODO: Do something better with the exception!!!
		alert(e);
	}
}


/*
 * Attempt to search for RSS feeds
 */
function searchFeed(/*HTML Element*/ button) {
	if (button.disabled) {
		return false;
	}
	// Get the URL.
	url = keywordField.value;
	if (!url) {
		return; // Field is empty.  Ignore.
	}

	// Disable the form elements.
	inputField.disabled = true;	
	keywordField.disabled = true;
	addButton.disabled = true;
	searchButton.disabled = true;
	// Start the progress bar.
	startProgress();
	// Trim whitespace and make sure the protocol is set.
	url = url.replace(/^\s+|\s+$/g,"");  // Trim.
	if (url.length > 4 && url.substring(0,4) == "http") {
		url = url.substring(4);
	}

	// Add Prefix and Postfix to search
	url = SEARCH_PREFIX + url + SEARCH_SUFFIX;

	try {
		var request = new XMLHttpRequest();
		request.onreadystatechange = receiveSearch;	
		request.url = url;
		request.open("GET", url);
		request.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		request.send();			
	} catch(e){
		alert(e); throw e;
	}
}

/*
 * Attempt to verify and add a new feed.
 * 
 * feedURL: The Rss URL to add
 */
function addNewFeed(feedURL) {
	// Disable the form elements.
	inputField.disabled = true;
	keywordField.disabled = true;
	addButton.disabled = true;
	searchButton.disabled = true;

	// Start the progress bar.
	startProgress();

	function checkForFeed(/*SQLTransaction*/ tx) {
		function handleResult(/*Transaction*/ tx, /*Result*/ result) {
			try{
				if (result.rows.length > 0) {
					resetForm();
					alert("You are already subscribed to " + feedURL);
				} else {
					try{
						requestRss({url:feedURL});
					}catch(e){alert(e); throw e;}
				}
			}catch(e){alert(e); throw e;}
		}
		tx.executeSql('SELECT feedId FROM Feeds WHERE url=?', [feedURL], handleResult ,handleError);
	}

	function handleError(/*SQLError*/ error) {
		alert("Error checking for duplication: " + error.message);
		resetForm();
	}
	db.readTransaction(checkForFeed, handleError);

}

/*
 * Attempt to verify and add a new feed.
 * 
 * button: HTML Element - The Add Feed button.
 */
function addFeed(/*HTML Element*/ button) {
	if (button.disabled) {
		return false;
	}

	// Get the URL.
	url = inputField.value;
	if (!url) {
		return; // Field is empty.  Ignore.
	}

	// Disable the form elements.
	inputField.disabled = true;
	keywordField.disabled = true;
	addButton.disabled = true;
	searchButton.disabled = true;

	// Start the progress bar.
	startProgress();
	// Trim whitespace and make sure the protocol is set.
	url = url.replace(/^\s+|\s+$/g,"");  // Trim.
	if (url.length < 4 || url.substring(0,4) != "http") {
		url = "http://" + url;
	}

	function checkForFeed(/*SQLTransaction*/ tx) {
		function handleResult(/*Transaction*/ tx, /*Result*/ result) {
			try{
				if (result.rows.length > 0) {
					resetForm();
					alert("You are already subscribed to " + url);
				} else {
					try{
						requestRss({url:url});
					}catch(e){alert(e); throw e;}
				}
			}catch(e){alert(e); throw e;}
		}
		tx.executeSql('SELECT feedId FROM Feeds WHERE url=?', [url], handleResult ,handleError);
	}

	function handleError(/*SQLError*/ error) {
		alert("Error checking for duplication: " + error.message);
		resetForm();
	}
	db.readTransaction(checkForFeed, handleError);
}

/*
 * Disable form elements, and start the progress bar.
 */
function startProgress() {
	document.getElementById("progressBar").style.display = "block";
	progress = 0;
	state = states.DOWNLOADING;
	updateProgress();
}

/*
 * Increments the progress bar.  Checks if the download should be timed out.
 */
function updateProgress() {
	progress++;
	switch(state) {
	default: // states.READY
		return;
	case states.DOWNLOADING:
		if (progress > DOWNLOADMAX) {
			handleTimeout();
			return;
		}
		break;
	case states.PROCESSING:
		if (progress > MAX) {
			handleTimeout();
			return;
		}
	}
	timeout = window.setTimeout(updateProgress, DELAY);
	document.getElementById('progress').style.width = Math.round(100*progress/MAX) + "%";
}

/*
 * Handler for when a requested feed download times out.
 */
function handleTimeout() {
	alert("No response from server.  Connection timed out.");
	resetForm();
}

/*
 * Handler for when the response is received from the download.
 */
function handleDownloadFinished() {
	state = states.PROCESSING;
}

function handleDuplicate(/*String*/ url) {
	resetForm();
	alert("You are already subscribed to " + url);
}

/*
 * Handler for if a lookup of a feed throws an exception.
 * 
 * exception: Exception - The exception that was thrown.
 */
function handleLookupFail(/*Exception*/ exception) {
	resetForm();
}

/*
 * Notifies the user when a feed is added successfully.
 * 
 * feedUrl: String - The URL of the feed which was successfully added.
 */
function handleAddFeedSuccess(/*String*/ feedUrl) {
	alert(feedUrl + " successfully added.");
	requestCheckFeedLimit();  // Check if the user has reached their limit.
}

/*
 * Handler for when adding a feed to the database throws an exception.
 * 
 * exception: Exception - The exception that was thrown.
 */
function handleAddFeedFail(/*Exception*/ exception) {
	handleDatabaseError(exception);
	resetForm();
}

/*
 * Last step of adding a feed.  If the user has reached their feed limit, they are notified, and re-directed back to manage feeds.
 * 
 * available: boolean - Whether the user still has feeds available before they reach their limit.
 */
function handleFeedLimit(/*boolean*/ available) {
	if (!available) {
		alert("You have reached the " + FEEDLIMIT + " feed limit");
		keyInvoker.inject.escapeKey();
	} else {
		clearForm();
	}
}

/*
 * Clears URL Field and resets the form
 */
function clearForm() {
	document.getElementById("url").value = "";  // Clear the text box.
	document.getElementById("keywords").value = "";  // Clear the text box.
	resetForm();
}

/*
 * Reset everything after adding (or attempting to add) a feed.
 */
function resetForm() {
	inputField.disabled = false;
	keywordField.disabled = false;
	addButton.disabled = false;
	searchButton.disabled = false;	
	document.getElementById("progressBar").style.display = "none";
	state = states.READY;
	progress = 0;
	if (blackberry.focus) {
		blackberry.focus.setFocus("url");
	}
	if (timeout) {
		window.clearTimeout(timeout);  // clear the timer.
		timeout = 0;
	}
}





