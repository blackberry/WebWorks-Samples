// CONSTANTS
var MILLISECONDS_PER_HOUR = 3600000;
var FEEDLIMIT = 20;
var profileDefaults = {
		DOWNLOAD_TYPE : 0,
		REFRESH_RATE : 2,
		ALERTS: false
};
var AUTO_REFRESH = MILLISECONDS_PER_HOUR;

//Remove any menu items from previous pages.
if (blackberry.ui.menu.getMenuItems().length > 0) {
	blackberry.ui.menu.clearMenuItems();
}

/* ************************************************************* *
 * *** ############### Background Processing ############### *** *
 * ************************************************************* */
//Set the custom app event handlers (for background processing).
blackberry.app.event.onExit(blackberry.app.requestBackground);  // TODO: Turn this back on!!
blackberry.app.event.onBackground(handleBackground);
blackberry.app.event.onForeground(handleForeground);

//Fix any override of the Back Key which may have been done on the previous screen.
blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, null);

// KEY Variables
var isRefreshing = false;			// Tracks if a manual refresh has been started
var isAutoUpdating = false;			// Tracks if an auto update has been started
var newContent = false;				// Tracks if new Content has been added due to an auto update
var autoRefreshCount = 0;			// The current amount of feeds that have been auto updated
var autoRefreshAmount = 0;			// The amount of feeds that need to be updated
var feedList = null;				// An Array {age, url, feedId} for feeds
var userRefreshRate;				// The rate at which to refresh feeds
var sendAlerts;						// Does the user want alerts for new content?
var db;								// The database reference
var inBackground = false;			// Tracks if widget is in the background

if (window.location.href != 'local:///list.html') {
	// Start AutoUpdate after 5 minutes for all pages except the initial page
	setTimeout("startAutoUpdate();", AUTO_REFRESH);
} else {
	// Start AutoUpdate on the initial page after content has loaded
	setTimeout("startAutoUpdate();", 250);
}

/*
 * CallBack function for timer userd to start audo updates
 */
function startAutoUpdate() {
	if (!isRefreshing) {
		autoRefreshCount = 0;
		autoRefreshAmount = 0;
		newContent = false;
		isAutoUpdating = true;
		db.transaction(getAllFeedsToUpdate, null, processAutoUpdate);
	} else {
		// The user is doing a refresh so no need to start an auto update right now
		setTimeout("startAutoUpdate();", AUTO_REFRESH);
	}
}

/*
 * CallBack function after updating list of feeds to update 
 */
function processAutoUpdate() {	
	for (var j=0; j< feedList.length; j++) {		
		if (feedList[j].age > (userRefreshRate * MILLISECONDS_PER_HOUR)) {
			autoRefreshAmount++;
			requestRss({url: feedList[j].url, feedId: feedList[j].feedId, autoUpdate : true});
		}
	}
	if (autoRefreshAmount == 0) {
		// There are no feeds that currently need updated so reset the timer;
		setTimeout("startAutoUpdate();", AUTO_REFRESH);
	}
}

/*
 * Retrieves a list of all feeds that are subscribed to
 */
function getAllFeedsToUpdate(tx) {	
	function handleGetAllFeedsToUpdate(tx, results)
	{
		feedList = new Array();
		if (results.rows.length > 0) {
			for ( var i = 0; i < results.rows.length; i++) {
				var feed = new Object();
				feed.feedId = results.rows.item(i).feedId;				
				feed.url = results.rows.item(i).url;
				feed.age = (new Date().getTime() - 1000 * results.rows.item(0).updated);
				feedList[i] = feed;
			}
		}	
	}	
	tx.executeSql('SELECT feedId, url, updated FROM Feeds WHERE failed=0 AND enabled!=0 ORDER BY updated ASC', null, handleGetAllFeedsToUpdate);
}

/*
 * Handles the onBackground event.
 */
function handleBackground() {
	inBackground = true;
}

/*
 * Handles the onForeground event.
 */
function handleForeground() {
	inBackground = false;
	// Reset the app icons.
	blackberry.app.setHomeScreenIcon("local:///images/RSS_Icon_EPR_F.jpg");
	blackberry.app.setHomeScreenIcon("local:///images/RSS_Icon_EPR_UF.jpg", true);
}

/*
 * Sets the app icons to indicate that there is new content.
 */
function setNewContentIcons() {
	// 	Set the app icons to indicate new content.
	blackberry.app.setHomeScreenIcon("local:///images/RSS_Icon_EPR_F_Red.jpg");
	blackberry.app.setHomeScreenIcon("local:///images/RSS_Icon_EPR_UF_Red.jpg", true);
}

/*
 * Sends an alert to the user to notify them of new content.
 */
function alertNewContent() {
	alert("RSS Reader: You have new messages.");
}

/*
 * Creates the tables for the database.  This is called only when the database is newly created.
 */
function createTables(/*Transaction*/ tx, /*SQLError*/ error) {
	// Create the tables.
	tx.executeSql('CREATE TABLE Profile (downloadType INT, refreshRate INT, alert INT)');

	tx.executeSql('CREATE TABLE Feeds (feedId INTEGER PRIMARY KEY, url TEXT, enabled INT, updated INT, failed INT)');
	tx.executeSql('CREATE TABLE Channels (channelId INTEGER PRIMARY KEY, feedId INT, title TEXT, stale INT)');
	tx.executeSql('CREATE TABLE Articles (articleId INTEGER PRIMARY KEY, channelId INT, title TEXT, link TEXT, content TEXT, created INT, stale INT, read INT, saved INT, failed INT)');

	// Create Indexes.
	tx.executeSql('CREATE UNIQUE INDEX FeedIndex ON feeds(url COLLATE NOCASE)');
	tx.executeSql('CREATE UNIQUE INDEX ChannelIndex ON Channels(feedId, title)');
	tx.executeSql('CREATE UNIQUE INDEX ArticleIndex ON Articles(channelId, link)');

	// Create Triggers.
	tx.executeSql('CREATE TRIGGER feedCascade BEFORE DELETE ON Feeds FOR EACH ROW BEGIN DELETE FROM Channels WHERE feedId=OLD.feedId; END');
	tx.executeSql('CREATE TRIGGER channelCascade BEFORE DELETE ON Channels FOR EACH ROW BEGIN DELETE FROM Articles WHERE channelId=OLD.channelId; END');

	// Set Default Values for profile Table
	tx.executeSql('INSERT INTO Profile (downloadType, refreshRate, alert) VALUES (?, ?, ?)', [profileDefaults.DOWNLOAD_TYPE, profileDefaults.REFRESH_RATE, profileDefaults.ALERTS ? 1:0], null, function(tx, error){alert(error + error.message);});
	
	// Obviously we were on the list screen with no Feed data.  Re-direct to Manage Feeds.
	goToManageFeeds();
	return false;
}

/*
 * Opens the Database, if it does not exist it makes the call to create the database
 */
function openDB(callBack) {
	//Make sure the database exists.
	try {
		db = openDatabase("rss-database", "1.0", "RSS Widget Database", 200000);
		db.transaction(function(tx){
			// Creates the Database if it does not already exist
			tx.executeSql('SELECT * FROM Profile', null, processProfile, createTables);

			function processProfile(tx, profile) {
				if (profile.rows.length > 0) {					
					userRefreshRate = profile.rows.item(0)['refreshRate'];
					sendAlerts = profile.rows.item(0)['alert'] == 1;
				}
			}
		}, null , callBack);
	} catch(/*Exception*/ exception) {
		handleDbInitError(exception.message);
	}	
}

var loadFailure = false;

/*
 * Handler for DatabaseException: cannot determine path to local storage.
 */
function handleDbUnavailableError() {
	alert("Unable to access eMMC or SD card.  Please ensure that you have an SD card installed, and turn off mass storage.");
	blackberry.app.exit();
}

/*
 * Handler for DatabaseException: disk I/O error.
 */
function handleDbAccessError() {
	alert("Database access failed.  Please try again later.");
	blackberry.app.exit();
}

/*
 * Deals with a failed initial startup of the database.
 * 
 * exception: Exception - The exception that was thrown.
 */
function handleDbInitError(/*Exception*/ exception) {
	var message = exception;
	if(message.message) {
		message = message.message;
	}
	alert("Failed to initialize Database: " + message);
	alert("This application requires an SD card.  Please Ensure that you have one installed and try again.");
	blackberry.app.exit();
}

function handleDbInitFail() {
	alert("Unable to access Database.  Please ensure that you have an SD card installed, and are not using mass storage.");
	blackberry.app.exit();
}

/*
 * Notifies the user of failed database requests.
 * 
 * exception: Exception - The exception that was thrown.
 */
function handleDatabaseError(/*Exception*/ exception) {
	alert("Unable to process your request: " + exception);
}

/*
 * Notifies the user of page load failures due to failed database requests.
 * Only allows the first error on the page to be displayed.
 */
function handleDatabaseLoadError(/*Exception*/ exception) {
	if (!loadFailure) {
		alert("Unable to load page content: " + exception);
		loadFailure = true;
	}
}

/*
 * Exception handler for when the background updates fail to initialize.
 * 
 * exception: Exception - The exception that was thrown.
 */
function handleUpdateInitError(/*Exception*/ exception) {
	alert("Failed to initialize updates: " + exception);
}

/*
 * Sends a request to download a feed.
 * 
 * args: Object - The arguments object which should contain the following attributes:
 * 		url: String - The url which points to the RSS feed.
 * 		feedId: int - (Optional) The ID of the feed being updated.  
 * 				This should always provided when refreshing, but will not be available for new feeds.
 * 		autoUpdate: boolean - (Optional) determines if this refresh was user initiated or not
 */
function requestRss(/*Object*/ args) {
	try {
		var request = new XMLHttpRequest();
		request.onreadystatechange = receiveRss;
		request.url = args.url;
		request.feedId = args.feedId;
		request.autoUpdate = args.autoUpdate;
		request.open("GET", args.url);
		request.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		request.send();
	}
	catch(e) {
		alert("UD: Error requestRss(): " + e); throw e;
	}
}

/*
 * Handles the response to the XMLHttpRequest for a feed.
 */
var sampleDiv = null;  // Used to convert articles from string to DOM subtrees.
function receiveRss() {	
	if (this.readyState == 4) {
		if (!this.feedId)	// This is only when adding a feed
			handleDownloadFinished();  // Let the user interface know that the download has finished.
		try {		
			// Check for errors.
			if (this.status != 200) {
				return;
			}
			// Make sure we got an XML response.
			if (null == this.responseXML) {
				return;
			}
			// Convert the XML data into a form that we can work with.
			var channelElements = this.responseXML.getElementsByTagName("channel");
			if (channelElements.length < 1) {
				alert("Does not appear to be a valid RSS feed.");
				resetForm();
				return;
			}
			if (!sampleDiv){
				sampleDiv = document.createElement("div");
			}
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
				var articles = new Array();
				var articleElements = channel.getElementsByTagName("item");
				for (var j=0; j<articleElements.length; j++) {
					var article = articleElements[j];
					var title = article.getElementsByTagName("title")[0].textContent;
					var link = article.getElementsByTagName("link")[0].childNodes[0].nodeValue;
					var content = article.getElementsByTagName("content:encoded");
					if (content.length > 0) {
						content = content[0].textContent;
					} else {
						content = article.getElementsByTagName("description")[0].textContent;
					}
					sampleDiv.innerHTML = content;
					content = processArticleContent(sampleDiv);
					sampleDiv.innerHTML = "";
					title = htmlEscape(title);
					articles[j] = {title: title, link: link, content:content};
				}
				channels[i] = {title: channelTitle, articles: articles};
			}
			// Now Save the Feed		
			var args = {feedId: this.feedId, feedUrl: this.url, channels: channels, autoUpdate: this.autoUpdate};
			saveFeed(args);
		} catch(e) {
			// TODO: Do something better with the exception!!!
			alert("UD: Error receiveRss(): " + e);
		} 
	}
}

/*
 * Saves the content of a feed.  Will create the feed if it does not exist.
 * 
 * args: Object - The arguments object which should contain the following attributes:
 * 		feedId: int - (Optional) The ID of the feed to update.  Should be omitted for adding a new feed.
 * 		feedUrl: String - (Optional) The URL associated with the feed.  May be omitted if feedId is provided.
 * 		channels: Channel[] - A collection of channel objects containing the following attributes:
 * 				title: String - The name of the channel.
 * 				articles: Article[] - A collection of article objects containing the following attributes:
 * 						title: String - The title of the article.
 * 						link: String - The URL pointing to the content of the article.
 * 						content: String - The Article's content or description (which will be displayed on the details page).
 * 		autoUpdate: boolean - (Optional) determines if this refresh was user initiated or not
 * 
 */
function saveFeed(/*Object*/ args) {
	var timestamp = Math.floor(new Date().getTime() / 1000);  // Current time in seconds.
	var successCallback;
	var failCallback;	
	function saveChannels(/*SQLTransaction*/ stx, Id) {
		var channels = args.channels;
		var length = channels.length;
		for (var i=0; i<length; i++) {
			saveChannel(stx, Id, channels[i]);
		}
	}

	function createFeed(/*SQLTransaction*/ stx) {
		function getFeedId(/*SQLTransaction*/ stx, /*SQLResultSet*/ result) {
			saveChannels(stx, result.insertId);
		}

		stx.executeSql("INSERT INTO Feeds (url, enabled, updated, failed) VALUES (?, 1, ?, 0)", [args.feedUrl, timestamp], getFeedId);
	}

	function updateFeed(/*SQLTransaction*/ stx) {
		// This is a pre-existing feed.
		stx.executeSql("UPDATE Feeds SET updated=? WHERE feedId=?", [timestamp, args.feedId]);  // Set the updated timestamp on the feed.
		stx.executeSql("UPDATE Channels SET stale=1 WHERE feedId=?", [args.feedId]);  // Tentatively assume that all of the Channels in the Feed are stale.
		saveChannels(stx, args.feedId);
	}	

	if (!args.feedId) {		
		// The user is adding a feed
		failCallback = function(/*SQLError*/ error){alert("Add Feed failed:" + error.message);};
		successCallback = function(){handleAddFeedSuccess(args.feedUrl);};
	} else {
		if (args.autoUpdate) {
			// Update started by common.js due to timer
			successCallback = handleAutoUpdate;
		} else {
			// User has initiated a refresh
			if(isRefreshing) {
				successCallback = handleReloadForRefreshAll;
			} else {
				successCallback = reloadListScreen;
			}
		}
		failCallback = function(/*SQLError*/ error){alert("Refresh failed:" + error.message);};
	}
	db.transaction(args.feedId ? updateFeed : createFeed, failCallback, successCallback);
}

/*
 * CallBack for when doing an autoUpdate
 */
function handleAutoUpdate()
{
	var feedCount = autoRefreshCount++;			
	if(feedCount == autoRefreshAmount - 1) {
		setTimeout("startAutoUpdate();", AUTO_REFRESH);			
		if (isRefreshing) {
			// The user requested a refresh during an auto update
			isRefreshing = false;
			reloadListScreen();
		} else {				
			if (inBackground) {
				setNewContentIcons();
			} else if (newContent && sendAlerts) {
				alertNewContent();
			}
		}
		isAutoUpdating = false;
	}			
}

/*
 * Stores the RSS Channel in the database.
 * 
 * channel: Object - A Channel object containing the following attributes:
 * 		title: String - The name of the channel.
 * 		articles: Article[] - A collection of article objects containing the following attributes:
 * 			title: String - The title of the article.
 * 			link: String - The URL pointing to the content of the article.
 * 			content: String - The Article's content or description (which will be displayed on the details page).
 * 
 * isForegroundRequest: Boolean - True if this is the result of the user adding a new feed.  Requires follow-up handling.
 * 		Should be true iff feedId is not provided.
 */
function saveChannel(tx, id, channel) {
	function saveArticles(tx, channelId) {
		var articles = channel.articles;
		var length = articles.length;
		for (var i=0; i<length; i++) {
			saveArticle(tx, channelId, articles[i]);
		}
	}

	function handleChannel(tx, rs) {
		function handleChannelAdded(tx, rs) {
			saveArticles(tx, rs.insertId);
		}
		if (rs.rows.length > 0) {
			var channelId = rs.rows.item(0)["channelId"];
			tx.executeSql('UPDATE Channels SET stale=0 WHERE channelId=?', [channelId]);  // This Channel is not stale!
			tx.executeSql('UPDATE Articles SET stale=1 WHERE channelId=?', [channelId]);  // Tentatively assume all of the Articles in the Channel are stale.
			saveArticles(tx, channelId);
		} else {
			// new Content has been added
			newContent = true;
			tx.executeSql('INSERT INTO Channels (feedId, title, stale) VALUES (?, ?, 0)', [id, channel.title], handleChannelAdded);
		}
	}
	tx.executeSql('SELECT channelId FROM Channels WHERE feedId=? AND title=?', [id, channel.title], handleChannel);
}

/*
 * Stores an RSS Article in the database.
 * 
 * article: Object - An Article object containing the following attributes:
 *		title: String - The title of the article.
 *		link: String - The URL pointing to the content of the article.
 *		content: String - The Article's content or description (which will be displayed on the details page).
 */
function saveArticle(tx, channelId, article) {
	function handleArticle(tx, rs) {
		if (rs.rows.length > 0) {
			var articleId = rs.rows.item(0)["articleId"];
			tx.executeSql('UPDATE Articles SET stale=0 WHERE articleId=?', [articleId]);  // This Article is not stale!
		} else {
			newContent = true;
			tx.executeSql('INSERT INTO ARTICLES (channelId, title, link, content, created, stale, read, saved, failed) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0)', 
					[channelId, article.title, article.link, article.content, Math.floor(new Date().getTime() / 1000)]);
		}
	}

	tx.executeSql('SELECT articleId FROM Articles WHERE channelId=? AND link=?', [channelId, article.link], handleArticle);
}

/*
 * Converts unsafe characters to entities for use in HTML.
 * 
 * s: String - The string to be converted.
 * 
 * returns: The converted string.
 */
function htmlEscape(/*String*/ s) {
	// If it already has HTML entities, convert them back to normal text.
	s = s.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
	// Now convert the special characters to HTML entities.
	return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/*
 * Processes the content of an article for security.  Steps include:
 * Remove javascript and event handlers.
 * Make all links open in a new browser.
 * 
 * content: HTML div - The html tree for the article content.
 */
function processArticleContent(/*HTML div*/ content) {
	var scripts = content.getElementsByTagName("script");
	for (var i=0; i<scripts.length; i++) {
		scripts[i].parentNode.removeChild(scripts[i]);
	}

	// Disable any "onclick" type functionality.
	var elements = content.getElementsByTagName("*");
	for (var i=0; i<elements.length; i++) {
		var elem = elements[i];
		if (elem.hasAttribute("onclick")) { elem.removeAttribute("onclick"); }
		if (elem.hasAttribute("ondblclick")) { elem.removeAttribute("ondblclick"); }
		if (elem.hasAttribute("onfocus")) { elem.removeAttribute("onfocus"); }
		if (elem.hasAttribute("onblur")) { elem.removeAttribute("onblur"); }
		if (elem.hasAttribute("onkeydown")) { elem.removeAttribute("onkeydown"); }
		if (elem.hasAttribute("onkeyup")) { elem.removeAttribute("onkeyup"); }
		if (elem.hasAttribute("onkeypress")) { elem.removeAttribute("onkeypress"); }
		if (elem.hasAttribute("onmousedown")) { elem.removeAttribute("onmousedown"); }
		if (elem.hasAttribute("onmouseup")) { elem.removeAttribute("onmouseup"); }
		if (elem.hasAttribute("onmousemove")) { elem.removeAttribute("onmousemove"); }
		if (elem.hasAttribute("onmouseover")) { elem.removeAttribute("onmouseover"); }
		if (elem.hasAttribute("onmouseout")) { elem.removeAttribute("onmouseout"); }
		if (elem.hasAttribute("onresize")) { elem.removeAttribute("onresize"); }
		if (elem.hasAttribute("onload")) { elem.removeAttribute("onload"); }
	}

	// Make sure all of the links will work correctly.
	var links = content.getElementsByTagName("a");
	for (var i=0; i<links.length; i++) {
		if (links[i].hasAttribute("href")) {
			var link = links[i];
			link.setAttribute("href", processLink(link.getAttribute("href")));
		}
	}
	
	return content.innerHTML.replace(/<nobr>/g, "").replace(/<\/nobr>/g, "");
}

/*
 * Converts an href to function properly on the new page.
 * 
 * value: String - The old href value.
 * 
 * returns: The new href value.
 */
function processLink(/*String*/ value) {
	if (!value) {
		return "";
	}

	value = value.replace(/^\s+|\s+$/g,"");  // Trim.

	// These should be fine..
	if (value.length == 0 || value.indexOf("#") == 0) {
		return value;
	}

	// Eliminate javascript for security.
	if (value.match(/javascript:/i)) {
		return "";
	}

	if ( (value.indexOf(":") > 0) && (value.indexOf('http') != 0) ) {
		// This isn't a URL.  Don't mess with it.
		return value;
	}

	// Make the link invoke the browser.
	return "javascript:invokeBrowser('" + value + "');";
}

/* *************************************************************** *
 * *** ############### Miscellaneous Functions ############### *** *
 * *************************************************************** */

/*
 * Truncates a string to fit in a span without exceeding given width.  Adds ellipsis if
 * 	truncation is required.
 */
function fitToWidth(/*HTML span element*/ element, /*int*/ width) {
	var text = element.innerHTML;
	element.style.visibility = 'hidden';

	// Check if the string already fits.
	if (element.offsetWidth <= width) {
		element.style.visibility = 'visible';
		return;
	}

	// Estimate the amount of the string that should fit.
	element.innerHTML = text + "...";
	var estimatedCharacters = Math.ceil(width * (text.length + 3) / element.offsetWidth) - 3;

	// Handle underestimation. (Increase estimate while there is space available).
	element.innerHTML = text.substring(0, estimatedCharacters) + "...";
	while (estimatedCharacters < text.length && element.offsetWidth < width) {
		element.innerHTML = text.substring(0, ++estimatedCharacters) + "...";
	}

	// Handle overestimation. (Reduce estimate until it fits).
	while (estimatedCharacters > 0 && element.offsetWidth > width) {
		element.innerHTML = text.substring(0, --estimatedCharacters) + "...";
	}

	element.style.visibility = 'visible';
}

/*
 * Callback function for the "Settings" menu option.  Redirects to the settings page.
 */
function goToSettings() {
	window.location.href = "manageSettings.html";
}

/*
 * Callback function for the "Manage Feeds" menu option.  Redirects to the manageFeeds page.
 */
function goToManageFeeds() {
	window.location.href = "manageFeeds.html";
}

/*
 * Determines whether the user has reached their feed limit.
 */
function requestCheckFeedLimit() {
	function respondCheckFeedLimit(tx, results) {		
		var available = results.rows.length < FEEDLIMIT;	
		handleFeedLimit(available);
	}	

	function handleError(tx, error){
		alert("UD: Error requestCheckFeedLimit(): " + error + error.message);
	}

	db.transaction(function(tx){
		tx.executeSql('SELECT feedId FROM Feeds', null, respondCheckFeedLimit, handleError);
	});
}
