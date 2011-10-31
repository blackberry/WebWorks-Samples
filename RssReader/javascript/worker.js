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
/* ******************************************************************* *
 * *** ############### Worker Pool (Communication) ############### *** *
 * ******************************************************************* */
onmessage=handleMessage;

/*
 * Sends a message to a worker.
 * 
 * func: String - The name of the function to be called in the worker.
 * 
 * args: Object - The parameter to be sent to the function.  Depending on the function, args may be a primitive, or null.
 * 
 * onSuccess: String - The name of the function to be called if the request is successful.
 * 
 * onFailure: String - The name of the function to be called if the request fails.
 */
function sendMessage(/*String*/ func, /*Object*/ args, /*String*/ onSuccess, /*String*/ onFailure) {
	var message = {func: func, args: args, onSuccess: onSuccess, onFailure: onFailure};
	postMessage(message);
}

/*
 * Processes messages received from the main process.
 * 
 * event: Event - The message event object containing all information about the message:
 * 		data: Object - The message content object.  Contains the following attributes.
 * 				func: String - The name of the function to be called in the worker.
 * 				args: Object - (Optional) The parameter to be sent to the function.
 * 						Depending on the function, args may be a primitive, or null.
 * 				onSuccess: String - (Optional) The name of the function to be called if the request is successful.
 * 				onFailure: String - (Optional) The name of the function to be called if the request fails.
 */
function handleMessage(/*Event*/ event) {
	var response = null;
	try {
		if (!event.data.func) {
			return;  // Nothing to do without a function to call. 
		}

		var result = null;
		if (event.data.args) {  // Call the function.
			result = eval(event.data.func)(event.data.args);
		} else {
			result = eval(event.data.func)();
		}

		if (event.data.onSuccess) { // Create the success reply.
			response = {func:event.data.onSuccess, args: result};
		}
	} catch(exception) {
		sendMessage("alert", "Exception caught: " + exception);
		// Check for database exceptions:
		if (exception.indexOf("net.rim.device.api.database.DatabaseException:") >= 0) {
			if (exception.indexOf("Cannot determine path to local storage.") >= 0) {
				response = {func:"handleDbUnavailableError"};  // Can't access SD card.
			} else if (exception.indexOf("disk I/O error")) {
				response = {func:"handleDbAccessError"};  // disk I/O error.
			} else if (event.data.onFailure) {
				response = {func: event.data.onFailure, args: exception}; // generic handler.
			} else {
				response = {func:"alert", args:exception}; // default (alert the user of error).
			}
		} else if (event.data.onFailure) { // Create the failure reply.
			response = {func: event.data.onFailure, args: exception};
		}
	}
	if (response) {  // Send back the response.
		sendMessage(response.func, response.args);
	}
}

function alert(/*String*/ message) {
	sendMessage("alert", message);
}

/* ************************************************************* *
 * *** ############### Background Processing ############### *** *
 * ************************************************************* */
var isRefreshing = false; // Are we doing a manual refresh?
var isBackground = false;
var newContent = false;

/*
 * Start up the background processing of updates.
 */
function initUpdates() {
	// TODO: Make this work!!! (May have to move it to the main process).
	// Set repeating callbacks to start the periodic updates.
//	setInterval(startUpdateCycle, MILLISECONDS_PER_HOUR * getRefreshRate());
//	setTimeout(performUpdate, 1);  // Handle any updates that are currently due.
}

/*
 * Start the process of updating all of the feeds.
 */
function startUpdateCycle() {
	// Cancel any pending requests.
	sendMessage("clearRequest");

	// Make sure everything will be updated.
	prepareForUpdate();

	// Initiate the first update.
	performUpdate();
}

/*
 * Initiates update request on an eligible feed or article.
 */
function performUpdate() {
	// Find a feed to update.
	var feed = getFeedToUpdate(isRefreshing);

	if (feed && feed.age > (getRefreshRate() * MILLISECONDS_PER_HOUR)) {
		// Send a request to the main process to get the current feed.
		sendMessage("requestRss", {url: feed.url, feedId: feed.feedId});
		return;
	}

	// If this was a manual update, need to re-load the list screen.
	if (isRefreshing) {
		sendMessage("reload");
	}

	// No Feeds or articles to update.  Time to check if we need to notify the user of updates.
	if (isBackground && newContent && getAlerts()) {
		// Alert the user that new content is available.
		sendMessage("alertNewContent");
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
 */
function saveFeed(/*Object*/ args) {
	// Make sure we have the ID for the feed (even if we have to create one).
	var feedId = args.feedId;
	var isNew = false;
	if (!feedId) {
		feedId = getFeedIdByUrl(args.feedUrl);
		if (feedId < 0) {
			isNew = true;
			feedId = createFeed(args.feedUrl);
		}
	}

	setFeedUpdated(feedId); // Set the updated timestamp on the feed.
	setChannelsStale(feedId); // Tentatively assume that all of the Channels in the Feed are stale.

	// Process the channels.
	var length = args.channels.length;
	for (var i=0; i<length; i++) {
		var channel = args.channels[i];
		// Get the channel ID.  (Create it if it doesn't exist).
		var channelId = getChannelId({feedId: feedId, title: channel.title});  // This clears the stale status.

		// Process the article headers.
		setArticlesStale(channelId);  // Tentatively assume that all of the Articles in the Channel are stale.
		var articles = channel.articles;
		for (var j=0; j<articles.length; j++) {
			var article = articles[j];
			createArticle({channelId: channelId, title: article.title, link: article.link, content: article.content});  // This clears the stale status.
		}
		promoteStaleArticles(channelId);  // Any Articles still marked as stale are marked for deletion.
	}

	promoteStaleChannels(feedId);  // Any Channels still marked as stale are marked for deletion.

	// Start processing another update, unless this was a new feed added by the user.
	if (!isNew) {
		performUpdate();
	}

	// Check for new content.
	if (isBackground && !newContent && hasNewContent(feedId)) {
		sendMessage("setNewContentIcons");
		newContent = true;
	}

	return args.feedUrl;
}

/*
 * Deals with a feed which was not downloaded successfully.
 * 
 * feedId: int - The ID of the feed which failed to download.
 */
function handleFailedFeed(/*int*/ feedId) {
	setFailedFeed(feedId);  // Mark the feed so we don't try it again until the next update cycle.
	performUpdate();  // Start another update.
}

/*
 * Updates the worker's knowledge of the background status.
 * 
 * status: boolean - True if the app is now in the background.  False if it is in the foreground.
 */
function setBackground(/*boolean*/ status) {
	isBackground = status;
	newContent = false;
}

/* **************************************************** *
 * *** ############### Page Loaders ############### *** *
 * **************************************************** */

/*
 * Page Loader for details.js
 * Sends content to the details page.
 * 
 * articleId: int - The ID of the article to be viewed.
 */
function loadDetailsPage(/*int*/ articleId) {
	// Get the article from the database.
	var article = getArticleById(articleId);
	if (!article) {
		// The article is no longer available.  Send the user back to the list screen.
		sendMessage("handleBack");
		return;
	}

	sendMessage("setContent", article.content);  // Send the article to the page to be loaded.
	setRead({id: articleId, status: true});  // Mark the article as read.

	// Send the rest of the article data to the page.
	sendMessage("handleArticleHeader", {id: articleId, title: article.title, link: article.link, saved: article.saved});

	// Set up the previous and next buttons.
	sendMessage("setPrevButton", getPreviousArticleId(articleId));
	sendMessage("setNextButton", getNextArticleId(articleId));
}

/* ************************************************** *
 * *** ############### Database ############### *** *
 * ************************************************** */

/*
 * This file handles all of the database access for the RSS Reader.
 * There are 3 database tables used for this project:
 * 		Profile - A single row table storing the following user settings:
 * 			downloadType: int - Controls what information is downloaded during updates.
 * 			refreshRate: int - The number of hours between content updates.
 * 			alert: boolean - If this is set to true, alert popups will be generated when new content is downloaded.
 * 
 * 		Feeds - Information about RSS download sites.  Contains the following:
 * 			feedId: int - A unique ID for this Feed.
 * 			url: String - The web address containing the RSS XML Feed.
 * 			enabled: boolean - Does the user want to be able to browse this Feed, and have the contents updated while offline?
 * 			updated: int - A timestamp for the last time this Feed was updated.
 * 			failed: boolean - A flag indicating that a recent attempt to download failed.
 * 
 * 		Channels - Information about a single Channel of a Feed.  Contains the following:
 * 			channelId: int - A unique ID for this Channel.
 * 			feedId: int - The ID of the Feed containing this Channel.
 * 			title: String - The name of the Channel.
 * 			stale: boolean - A flag used during updates to determine whether this Channel is still in the Feed.
 * 
 * 		Articles - Information about a single RSS article.  Contains the following:
 * 			articleId: int - A unique ID for this Article. 
 * 			channelId: int - The ID of the Channel containing this Article.
 * 			title: String - The Title of the Article.
 * 			link: String - The URL pointing to the contents of the Article.
 * 			content: String - The content of the article.
 * 			created: int - Timestamp for when this Article was first added to the database.
 * 			stale: boolean - A flag used during updates to determine whether this Article is still in the Channel.
 * 			read: boolean - A flag for marking whether the user has viewed this article.
 * 			saved: boolean - A flag set when the user saves this article for offline viewing.
 * 			failed: boolean - A flag indicating that a recent attempt to download the contents failed.
 */

var MILLISECONDS_PER_HOUR = 3600000;
var profileDefaults = {
		DOWNLOAD_TYPE : 0,
		REFRESH_RATE : 2,
		ALERTS: false
};

//Open the database.
var db = null;
//function initDb() {
//// Open the database.
//try {
//db = openDatabaseSync("rss-database", "1.0", "RSS Widget Database", 200000);
//if (!db) {
//sendMessage("handleDbInitFail");
//close();
//}
//} catch(/*Exception*/ exception) {
//sendMessage("handleDbInitError", exception.message);  // Advise the main thread that the database did not open.
//close();
//}
//}

//function initDb() {
//// Callback for openDatabase if the database is newly created.  Sets the version number and sets up the tables.
//function createDatabase(/*Database*/ database) {
//// 
//function createTables(/*Transaction*/ tx) {
//// Create the tables.
//tx.executeSql('CREATE TABLE Profile (downloadType INT, refreshRate INT, alert INT)');
//tx.executeSql('CREATE TABLE Feeds (feedId INTEGER PRIMARY KEY, url TEXT, enabled INT, updated INT, failed INT)');
//tx.executeSql('CREATE TABLE Channels (channelId INTEGER PRIMARY KEY, feedId INT, title TEXT, stale INT)');
//tx.executeSql('CREATE TABLE Articles (articleId INTEGER PRIMARY KEY, channelId INT, title TEXT, link TEXT, content TEXT, created INT, stale INT, read INT, saved INT, failed INT)');

//// Create Indexes.
//tx.executeSql('CREATE UNIQUE INDEX FeedIndex ON feeds(url COLLATE NOCASE)');
//tx.executeSql('CREATE UNIQUE INDEX ChannelIndex ON Channels(feedId, title)');
//tx.executeSql('CREATE UNIQUE INDEX ArticleIndex ON Articles(channelId, link)');

//// Create Triggers.
//tx.executeSql('CREATE TRIGGER feedCascade BEFORE DELETE ON Feeds FOR EACH ROW BEGIN DELETE FROM Channels WHERE feedId=OLD.feedId; END');
//tx.executeSql('CREATE TRIGGER channelCascade BEFORE DELETE ON Channels FOR EACH ROW BEGIN DELETE FROM Articles WHERE channelId=OLD.channelId; END');
//alert("Tables Created.");

//// Obviously there is no Feed data.  Re-direct to Manage Feeds.
//sendMessage("goToManageFeeds");
//}

//try{
//database.transaction(createTables);
////database.changeVersion("", "1.0", createTables);
//} catch(e) {
//alert("Exception: " + e);
//throw e;
//}
//}

//// Open the database.
//try {
//db = openDatabase("rss-database", "1.0", "RSS Widget Database", 200000, createDatabase);
//if (!db) {
//sendMessage("handleDbInitFail");
//close();
//}
//} catch(/*Exception*/ exception) {
//sendMessage("handleDbInitError", exception.message);  // Advise the main thread that the database did not open.
//close();
//}
//}

/*
 * Initializes the database.
 */
//function initDb() {
//db.open('rss-database');

//try {
//// Create the tables if necessary.
//var prefix = 'CREATE TABLE IF NOT EXISTS ';
//db.execute(prefix + 'Profile (downloadType INT, refreshRate INT, alert INT)').close();
//db.execute(prefix + 'Feeds (feedId INTEGER PRIMARY KEY, url TEXT, enabled INT, updated INT, failed INT)').close();
//db.execute(prefix + 'Channels (channelId INTEGER PRIMARY KEY, feedId INT, title TEXT, stale INT)').close();
//db.execute(prefix + 'Articles (articleId INTEGER PRIMARY KEY, channelId INT, title TEXT, link TEXT, content TEXT, created INT, stale INT, read INT, saved INT, failed INT)').close();

//// Create Indexes if necessary.
//prefix = 'CREATE UNIQUE INDEX IF NOT EXISTS ';
//db.execute(prefix + 'FeedIndex ON feeds(url COLLATE NOCASE)').close();
//db.execute(prefix + 'ChannelIndex ON Channels(feedId, title)').close();
//db.execute(prefix + 'ArticleIndex ON Articles(channelId, link)').close();

//// Create Triggers if necessary.
//prefix = 'CREATE TRIGGER IF NOT EXISTS ';
//db.execute(prefix + 'feedCascade BEFORE DELETE ON Feeds FOR EACH ROW BEGIN DELETE FROM Channels WHERE feedId=OLD.feedId; END').close();
//db.execute(prefix + 'channelCascade BEFORE DELETE ON Channels FOR EACH ROW BEGIN DELETE FROM Articles WHERE channelId=OLD.channelId; END').close();
//} finally {
//db.close();
//}
//}

/*          *******************************************          *
 *          ***   Profile Table related functions   ***          *
 *          *******************************************          */

///* 
//* Gets the current download option value.
//* 
//* returns: The int value of the download type.
//*/
//function getDownloadOption() {
//var value = profileDefaults.DOWNLOAD_TYPE;
//db.open('rss-database');

//try {
//var result = db.execute('SELECT downloadType FROM Profile LIMIT 1');
//if (result.isValidRow()) {
//value = result.field(0);
//}
//result.close();
//} finally {
//db.close();
//}

//return value;
//}

///*
//* Gets the current refresh rate.
//* 
//* returns: The number of hours between updates.
//*/
//function getRefreshRate() {
//var value = profileDefaults.REFRESH_RATE;
//db.open('rss-database');

//try {
//var result = db.execute('SELECT refreshRate FROM Profile LIMIT 1');
//if (result.isValidRow()) {
//value = result.field(0);
//}
//result.close();
//} finally {
//db.close();
//}

//return value;
//}

///*
//* Check the current user setting for alerts.
//* 
//* returns: True if the user has requested to be alerted when there is new content.
//*/
//function getAlerts() {
//var value = profileDefaults.ALERTS;
//db.open('rss-database');

//try {
//var result = db.execute('SELECT alert FROM Profile LIMIT 1');
//if (result.isValidRow()) {
//value = (result.field(0) != 0);
//}
//result.close();
//} finally {
//db.close();
//}

//return value;
//}

///*          *****************************************          *
//*          ***   Feeds Table related functions   ***          *
//*          *****************************************          */

///*
//* Adds a Feeds to the database.
//* 
//* url: The url of the Feed to add.
//* 
//* returns: The ID of the inserted Feed, or -1 on failure.
//*/
//function createFeed(/*String*/ url) {
//var feedId = -1;
//db.open('rss-database');

//try {
//// Add the url to the table.
//var now = new Date().getTime();
//var timestamp = Math.floor(now / 1000);  // Current time in seconds.
//db.execute('INSERT INTO Feeds (url, enabled, updated, failed) VALUES (?, 1, ?, 0)', [url, timestamp]).close();

//// Look it up to find the ID associated with it.
//var feedIds = db.execute('SELECT feedId FROM Feeds WHERE rowId=?', [db.lastInsertRowId]);
//feedId = feedIds.field(0);
//feedIds.close();
//} finally {
//db.close();
//}

//return feedId;
//}

///*
//* Removes a Feed from the database, as well as any Channels and Articles which are
//* associated with the Feed.
//* 
//* feedId: The ID for the Feed to be removed.
//*/
//function destroyFeed(/*int*/ feedId) {
//db.open('rss-database');
//try {
//db.execute('DELETE FROM Feeds WHERE feedId=?', [feedId]).close();
//} finally {
//db.close();
//}
//}

///*
//* Looks up the ID for a Feed by the URL.
//* 
//* url: String - The URL of the Feed to be looked up.
//* 
//* returns: The ID associated with the URL.  Returns -1 if not found.
//*/
//function getFeedIdByUrl(/*String*/ url) {
//var value = -1;
//db.open('rss-database');

//try {
//var result = db.execute('SELECT feedId FROM Feeds WHERE url=?', [url]);
//if (result.isValidRow()) {
//value = result.field(0);
//}
//result.close();
//} finally {
//db.close();
//}

//return value;
//}

///*
//* Finds the least updated Feed which hasn't recently failed to update.
//* 
//* allowUnsubscribed: boolean - Unsubscribed (not enabled) feeds will not be returned if this evaluates to false.
//* 
//* returns: A Feed containing the following attributes:
//* 		feedId: int - The ID of the Feed.
//* 		url: String - The URL pointing the the Feed's RSS XML.
//* 		age: int - The number of milliseconds since this feed was updated.
//*/
//function getFeedToUpdate(/*boolean*/ allowUnsubscribed) {
//var feed = null;
//db.open('rss-database');

//try {
//var result;
//if (allowUnsubscribed) {
//result = db.execute('SELECT feedId, url, updated FROM Feeds WHERE failed=0 ORDER BY updated ASC');
//} else {
//result = db.execute('SELECT feedId, url, updated FROM Feeds WHERE failed=0 AND enabled!=0 ORDER BY updated ASC');
//}
//if (result.isValidRow()) {
//feed = new Object();
//feed.feedId = result.field(0);
//feed.url = result.field(1);
//feed.age = (new Date().getTime() - 1000 * result.field(2));
//}
//result.close();
//} finally {
//db.close();
//}

//return feed;
//}

///*
//* Adjusts anything that would make a feed or article ineligible for updating
//* (except the user preference to not download article content).
//*/
//function prepareForUpdate() {
//db.open('rss-database');

//try {
//// Reset any failure flags which would prevent downloading.
//db.execute('UPDATE Feeds SET failed=0').close();

//// Determine the time between updates.
//var updateRate = profileDefaults.REFRESH_RATE;
//var result = db.execute('SELECT refreshRate FROM Profile LIMIT 1');
//if (result.isValidRow()) {
//updateRate = result.field(0);
//}
//result.close();

//// Determine the maximum last update timestamp which would be eligible for update, now.
//var time = Math.floor( (new Date().getTime() - (updateRate * MILLISECONDS_PER_HOUR)) / 1000);

//// Push back all the update timestamps which might prevent update eligibility.
//db.execute('UPDATE Feeds SET updated=? WHERE updated>?', [time, time]).close();
//} finally {
//db.close();
//}
//}


///*
//* Sets the timestamp on the Feed to show that it is current.
//* 
//* feedId: int - The ID of the Feed to mark as updated.
//*/
//function setFeedUpdated(/*int*/ feedId) {
//db.open('rss-database');
//try {
//var timestamp = Math.floor(new Date().getTime() / 1000);  // Current time in seconds.
//db.execute('UPDATE Feeds SET updated=? WHERE feedId=?', [timestamp, feedId]).close();
//} finally {
//db.close();
//}
//}

///*
//* Sets the failed flag for a Feed.
//* 
//* feedId: The ID of the Feed for which to set the flag.
//*/
//function setFailedFeed(/*int*/ feedId) {
//db.open('rss-database');
//try {
//db.execute('UPDATE Feeds SET failed=1 WHERE feedId=?', [feedId]).close();
//} finally {
//db.close();
//}
//}

///*
//* Determines whether new content has been added to a Feed.
//* This is based on an assumption that setFeedUpdated was called before
//* adding the articles.
//* 
//* feedId: int - The ID of the Feed to check.
//* 
//* returns: true if there is new content in the feed; false otherwise.
//*/
//function hasNewContent(/*int*/ feedId) {
//var value = false;
//db.open('rss-database');

//try {
//var result = db.execute ('SELECT updated FROM Feeds WHERE feedId=?', [feedId]);
//if (result.isValidRow()) {
//var timestamp = result.field(0);
//result.close();
//result = db.execute('SELECT articleId FROM Channels INNER JOIN Articles ON Channels.channelId=Articles.channelId WHERE Channels.feedId=? AND Articles.created>? LIMIT 1', [feedId, timestamp]);
//if (result.isValidRow()) {
//value = true;
//}
//}
//result.close();
//} finally {
//db.close();
//}

//return value;
//}

///*
//* Gets a list of all of the Feeds.
//* 
//* returns:  An Array of Feed objects containing the following attributes:
//* 		id: int - The ID of the Feed.
//* 		url: String - Link used when refreshing the Feed.
//* 		name: String - The name of the first Channel in the Feed.
//* 		enabled: boolean - Is the Feed enabled for data refresh/display?
//*/
//function getFeedList() {
//var feedList = new Array();
//db.open('rss-database');

//try {
//var feeds = db.execute('SELECT feedId, url, enabled FROM Feeds');
//for (var i=0; feeds.isValidRow(); feeds.next()) {
//var feed = new Object();
//feed.id = feeds.field(0);
//feed.url = feeds.field(1);
//feed.enabled = (feeds.field(2) != 0);
//var channel = db.execute('SELECT title FROM Channels WHERE feedId=? LIMIT 1', [feed.id]);
//feed.name = channel.isValidRow() ? channel.field(0) : feed.url.substring(1+feed.url.indexOf(":"));
//channel.close();
//feedList[i++] = feed;
//}
//feeds.close();
//} finally {
//db.close();
//}

//return feedList;
//}

///*
//* Gets a list of the enabled Feeds.
//* TODO: Remove this function if it is not going to be used.
//* 
//* returns: An Array of Feed objects containing the following attributes:
//* 		id - int.  The ID of the Feed.
//* 		url - String.  The URL associated with the Feed.
//*/
//function getEnabledFeedList() {
//var feedList = new Array();
//db.open('rss-database');

//try {
//var feeds = db.execute('SELECT feedId, url FROM Feeds WHERE enabled != 0');
//for (var i=0; feeds.isValidRow(); feeds.next()) {
//var feed = new Object();
//feed.id = feeds.field(0);
//feed.url = feeds.field(1);
//var channel = db.execute('SELECT title FROM Channels WHERE feedId=? LIMIT 1', [feed.id]);
//feed.name = channel.isValidRow() ? channel.field(0) : feed.url.substring(3+feed.url.indexOf("://"));
//channel.close();
//feedList[i++] = feed;
//}
//feeds.close();
//} finally {
//db.close();
//}

//return feedList;
//}

///*          ********************************************          *
//*          ***   Channels Table related functions   ***          *
//*          ********************************************          */

///*
//* Adds a Channel to the database if it does not already exist.  If the Channel
//* does exist, this function acts as a look-up.
//* 
//* args: Object - The arguments object which should contain the following attributes:
//* 		feedId: int - The ID of the Feed which will contain the Channel.
//* 		title: String - The title of the feed.
//* 
//* returns: The ID of the Channel.  Returns -1 if some error occurs.
//*/
//function getChannelId(/*Object*/ args) {
//var channelId = -1;
//db.open('rss-database');

//try {
//// Attempt to look up the channel.
//var channel = db.execute('SELECT channelId FROM Channels WHERE feedId=? AND title=?', [args.feedId, args.title]);
//if (channel.isValidRow()) {
//channelId = channel.field(0);
//db.execute('UPDATE Channels SET stale=0 WHERE channelId=?', [channelId]).close();
//} else {
//channel.close();
//db.execute('INSERT INTO Channels (feedId, title, stale) VALUES (?, ?, 0)', [args.feedId, args.title]).close();
//channel = db.execute('SELECT channelId, feedId, title FROM Channels WHERE rowId=?', [db.lastInsertRowId]);
//if (channel.isValidRow()) {
//channelId = channel.field(0);
//}
//}
//channel.close();
//} finally {
//db.close();
//}

//return channelId;
//}

///*
//* Returns an array of all of the Channels.
//* 
//* returns: An array of Channel Objects containing the following attributes:
//* 		id : int - The ID of the Channel.
//* 		title: String - The title for the Channel.
//*/
//function getAllChannels() {
//var channelList = new Array();
//db.open('rss-database');

//try {
//var result = db.execute('SELECT channelId, title FROM Channels');
//for (var i=0; result.isValidRow(); result.next()) {
//var channel = new Object();
//channel.id = result.field(0);
//channel.title = result.field(1);
//channelList[i++] = channel;
//}
//result.close();
//} finally {
//db.close();
//}

//return channelList;
//}

///*
//* Returns an array of all of the Channels associated with enabled Feeds.
//* TODO: Remove this function if it is not going to be used.
//* 
//* returns: An array of Channel Objects containing the following attributes:
//* 		id : int - The ID of the Channel.
//* 		title: String - The title for the Channel.
//*/
//function getEnabledChannels() {
//var channelList = new Array();
//db.open('rss-database');

//try {
//var result = db.execute('SELECT channelId, title FROM Feeds INNER JOIN Channels ON Feeds.feedId=Channels.feedId WHERE Feeds.enabled!=0');
//for (var i=0; result.isValidRow(); result.next()) {
//var channel = new Object();
//channel.id = result.field(0);
//channel.title = result.field(1);
//channelList[i++] = channel;
//}
//result.close();
//} finally {
//db.close();
//}

//return channelList;
//}

///*
//* Returns an array of all of the Channels associated with the request Feed.
//* 
//* feedId: int - The ID of the Feed to get Channels for.
//* 
//* returns: An array of Channel Objects containing the following attributes:
//* 		id : int - The ID of the Channel.
//* 		title: String - The title for the Channel.
//*/
//function getChannelsByFeedId(/*int*/ feedId) {
//var channelList = new Array();
//db.open('rss-database');

//try {
//var result = db.execute('SELECT channelId, title FROM Channels WHERE feedId=?', [feedId]);
//for (var i=0; result.isValidRow(); result.next()) {
//var channel = new Object();
//channel.id = result.field(0);
//channel.title = result.field(1);
//channelList[i++] = channel;
//}
//result.close();
//} finally {
//db.close();
//}

//return channelList;
//}

///*
//* Marks all of the Channels in a Feed as stale.
//* 
//* feedId: int - The ID of the Feed containing the Channels to mark.
//*/
//function setChannelsStale(/*int*/ feedId) {
//db.open('rss-database');
//try {
//db.execute('UPDATE Channels SET stale=1 WHERE feedId=?', [feedId]).close();
//} finally {
//db.close();
//}
//}

///*
//* Marks Channels within a Feed to be deleted if they are stale.
//* 
//* feedId: int - The ID of the Feed containing the Channels to be marked.
//*/
//function promoteStaleChannels(/*int*/ feedId) {
//db.open('rss-database');
//try {
//db.execute('UPDATE Channels SET stale=2 WHERE stale=1 AND feedId=?', [feedId]).close();
//} finally {
//db.close();
//}
//}

///*          ********************************************          *
//*          ***   Articles Table related functions   ***          *
//*          ********************************************          */

///*
//* Returns information about a specific Article.
//* 
//* articleId: int - The ID of the requested Article.
//* 
//* returns: An Article containing the following (or null if not found):
//* 		channelId: int - The ID of the Channel containing the Article.
//* 		title: String - The title of the Article.
//* 		link: String - The URL that points to the content of the article.
//* 		content: String - The content of the Article.
//* 		saved: boolean - Whether this article is currently marked as saved.
//*/
//function getArticleById(/*int*/ articleId) {
//var article = null;
//db.open('rss-database');

//try {
//result = db.execute('SELECT channelId, title, link, content, saved FROM Articles WHERE articleId=?', [articleId]);
//if (result.isValidRow()) {
//article = new Object();
//article.channelId = result.field(0);
//article.title = result.field(1);
//article.link = result.field(2);
//article.content = result.field(3);
//article.saved = (result.field(4) != 0);
//}
//result.close();
//} finally {
//db.close();
//}

//return article;
//}

///*
//* Gets a list of the Articles in a Channel.
//* 
//* channelId: int - The ID of the Channel for which to return articles.
//* 
//* returns: An Array of Articles containing the following:
//* 		articleId: int - The ID of the Article.
//* 		title: String - The title of the Article.
//* 		read: boolean - Whether the user has already viewed this Article.
//* 		created: int - The timestamp when this article was first detected on the feed.
//* Additionally, the array has an additional attribute:
//* 		channelId: int - The ID of the Channel containing these Articles.
//*/
//function getArticlesByChannel(/*int*/ channelId) {
//var articles = new Array();
//db.open('rss-database');

//try {
//var result = db.execute('SELECT articleId, title, read, created FROM Articles WHERE channelId=? ORDER BY created DESC, rowId ASC', [channelId]);
//for(var i=0; result.isValidRow(); result.next()) {
//var article = new Object();
//article.articleId = result.field(0);
//article.title = result.field(1);
//article.read = result.field(2);
//article.created = 1000 * result.field(3);
//article.channelId = channelId;
//articles[i++] = article;
//}
//result.close();
//} finally {
//db.close();
//}

//return articles;
//}

///*
//* Returns the ID of the previous Article in the Channel.
//* 
//* articleId: int - The ID of the current Article.
//* 
//* returns: The ID of the previous Article in the Channel, or -1 if no such Article exists.
//*/
//function getPreviousArticleId(/*int*/ articleId) {
//var prev = -1;
//db.open('rss-database');

//try {
//// Start by getting information about the article.
//var result = db.execute('SELECT channelId, rowId, created FROM Articles WHERE articleId=?', [articleId]);
//if (result.isValidRow()) {
//var channelId = result.field(0);
//var rowId = result.field(1);
//var created = result.field(2);
//// Look for a previous Article with the same created date.
//result.close();
//result = db.execute('SELECT articleId FROM Articles WHERE channelId=? AND created=? AND rowId<? ORDER BY rowId DESC LIMIT 1', [channelId, created, rowId]);
//if (result.isValidRow()) {
//prev = result.field(0);
//} else {
//// Look for the latest Article with a previous created date.
//result.close();
//result = db.execute('SELECT articleId FROM Articles WHERE channelId=? AND created<? ORDER BY created DESC LIMIT 1', [channelId, created]);
//if (result.isValidRow()) {
//prev = result.field(0);
//}
//}
//}
//result.close();
//} finally {
//db.close();
//}

//return prev;
//}

///*
//* Returns the ID of the next Article in the Channel.
//* 
//* articleId: int - The ID of the current Article.
//* 
//* returns: The ID of the next Article in the Channel, or -1 if no such Article exists.
//*/
//function getNextArticleId(/*int*/ articleId) {
//var next = -1;
//db.open('rss-database');

//try {
//// Start by getting information about the article.
//var result = db.execute('SELECT channelId, rowId, created FROM Articles WHERE articleId=?', [articleId]);
//if (result.isValidRow()) {
//var channelId = result.field(0);
//var rowId = result.field(1);
//var created = result.field(2);
//// Look for a next Article with the same created date.
//result.close();
//result = db.execute('SELECT articleId FROM Articles WHERE created=? AND rowId>? ORDER BY rowId ASC LIMIT 1', [created, rowId]);
//if (result.isValidRow()) {
//next = result.field(0);
//} else {
//// Look for the latest Article with a previous created date.
//result.close();
//result = db.execute('SELECT articleId FROM Articles WHERE created>? ORDER BY created ASC LIMIT 1', [created]);
//if (result.isValidRow()) {
//next = result.field(0);
//}
//}
//}
//result.close();
//} finally {
//db.close();
//}

//return next;
//}

///*
//* Sets the read status of an Article.
//* 
//* args: Object - The arguments object which should contain the following attributes:
//* 		id: int - The ID of the Article.
//* 		status: boolean - The new read status for the Article.
//*/
//function setRead(/*Object*/ args) {
//db.open('rss-database');
//try {
//db.execute('UPDATE Articles SET read=? WHERE articleId=?', [args.status ? 1 : 0, args.id]).close();
//} finally {
//db.close();
//}
//}

///*
//* Sets the read status of all Articles within a given Feed.
//* 
//* args: Object - The arguments object which should contain the following attributes:
//* 		feed: int - The Feed containing the articles to mark.
//* 		status: boolean - The new read status for the Articles.
//*/
//function setReadByFeed(/*Object*/ args) {
//db.open('rss-database');

//try {
//var result = db.execute('SELECT channelId FROM Channels WHERE feedId=?', [args.feed]);
//while (result.isValidRow()) {
//db.execute("UPDATE Articles SET read=? WHERE channelId=?", [args.status ? 1 : 0, result.field(0)]).close();
//result.next();
//}
//result.close();
//} finally {
//db.close();
//}
//}

///*
//* Sets the saved status of an Article.
//*
//* args: Object - The arguments object which should contain the following attributes:
//* 		id: int - The ID of the Article.
//* 		status: boolean - The new saved status for the Article.
//*/
//function setSaved(/*Object*/ args) {
//db.open('rss-database');
//try {
//db.execute('UPDATE Articles SET saved=? WHERE articleId=?', [args.status ? 1 : 0, args.id]).close();
//} finally {
//db.close();
//}
//}

///*
//* Marks Articles within a Channel to be deleted if they are stale.
//* 
//* channelId: int - The ID of the Channel containing the Articles to be marked.
//*/
//function promoteStaleArticles(/*int*/ channelId) {
//db.open('rss-database');
//try {
//db.execute('UPDATE Articles SET stale=2 WHERE stale=1 AND channelId=?', [channelId]).close();
//} finally {
//db.close();
//}
//}
