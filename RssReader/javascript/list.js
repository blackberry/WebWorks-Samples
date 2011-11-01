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
var filtered = false;
var feedId = undefined;
var channelOpen = undefined;
var refreshAllCount = -1;
/*
 * Initializes the list screen page.  This primarily involves loading content.
 */
function initListScreen() {
	try {
		db.transaction(function(tx){
			tx.executeSql('SELECT * FROM Feeds', null, loadFeedIDs, handleError);
		});
	} catch(/*Exception*/ exception) {
		alert("UD: initListScreen(): " + exception.message);
	}
}

/*
 * Loads Feed IDs into an array for later use
 */
function loadFeedIDs(tx, results) {
	// Makes sure there is at least one feed, otherwise redirects to manage feeds
	if(results.rows.length == 0) {
		goToManageFeeds();
	} else {
		if (results.rows.length == 1) {	
			feedId = results.rows.item(0)['feedId'];
		}	
		// Default behavior is to exit on pressing back
		blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, blackberry.app.exit);
		processFeeds();
	}
}

/*
 * Fatal Error handler.
 */
function handleError(/*Transaction*/ tx, /*Error*/ error) {
	alert("Fatal Error: " + error + error.message);
}

/*
 * Loads the content onto the page.
 */
function processFeeds() {

	function handleChannels(/*Transaction*/ tx, /*Result*/ result) {		
		var rows = result.rows;
		var channelList = new Array();
		for (var i=0; i<rows.length; i++)
			channelList[i] = { id:rows.item(i)['channelId'], title:rows.item(i)['title'] };
		loadChannels(channelList);
	}
	// Parse query string:
	if (!feedId) {
		try {
			var url = blackberry.utils.parseURL(window.location.toString().replace("///", "//"));
			channelOpen =  url.getURLParameter('channelId');
			feedId =  url.getURLParameter('id');
		} catch(e) {alert(e);}
		if (feedId) {
			// User is viewing a single feed so pressing back will take them to all feeds
			blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, handleBack);
			feedId = parseInt(feedId);
			filtered = true;
		}
	}		

	db.transaction(
			function(/*Transaction*/ tx) {			
				// Delete any Channels/Articles which have been marked for deletion.
				tx.executeSql("DELETE FROM Articles WHERE stale=2 AND saved=0");
				tx.executeSql("DELETE FROM Channels WHERE stale=2 and channelId NOT IN (SELECT DISTINCT channelId FROM Articles WHERE saved!=0)");

				if (feedId) {
					tx.executeSql("SELECT channelId, title FROM Channels WHERE feedId=?", [feedId], handleChannels, handleError);
				} else {
					tx.executeSql("SELECT channelId, title FROM Channels", [], handleChannels, handleError);
				}
			}
	);	
}

/*
 * Event handler for the "Back" hardware key.  Makes sure that we go all the way back
 * to the first instance of the list screen in one step, rather than backing through them individually.
 */
function handleBack() {
	// Reset the handler, and go back to the list screen.
	window.location.href = "list.html";
}

/*
 * Loads channel information onto the page.  Once this is done, the menu options are created.
 * 
 * channelList: Channel[] - The channels to be displayed.  Each channel consists of:
 * 		id: int - The ID of the channel.
 * 		title: String - The title of the channel.
 */
function loadChannels(/*Channel[]*/ channelList) {
	// Find the parent element for the channels.
	var element = document.getElementById("feeds");
	// Get the template for the channels.
	var template = document.getElementById("channelTemplate");
	element.innerHTML = "";  // Remove any previous data.
	for (var i=0; i<channelList.length; i++) {
		var channel = channelList[i];
		var node = template.cloneNode(true);
		var title = node.getElementsByTagName("div")[1];
		var img = node.getElementsByTagName("img")[0];		
		node.id = channel.id;
		img.id = channel.id + "_img";
		title.innerHTML = channel.title;
		title.title = channel.title;

		element.appendChild(node);

		// Send a request for the Articles in this Channel.
		getArticlesByChannel(channel.id);
	}	
	createMenuOptions();
}

/*
 * Gets a list of the Articles in a Channel.
 * 
 * channelId: int - The ID of the Channel for which to return articles.
 * 
 * returns: An Array of Articles containing the following:
 * 		articleId: int - The ID of the Article.
 * 		title: String - The title of the Article.
 * 		read: boolean - Whether the user has already viewed this Article.
 * 		created: int - The timestamp when this article was first detected on the feed.
 * Additionally, the array has an additional attribute:
 * 		channelId: int - The ID of the Channel containing these Articles.
 */
function getArticlesByChannel(/*int*/ channelId) {	

	function openArticle(tx, result) {
		var rows = result.rows;
		var articles = new Array();
		for (var i=0; i<rows.length; i++) {
			var article = new Object();
			article.articleId = rows.item(i)['articleId'];
			article.title = rows.item(i)['title'];
			article.read = rows.item(i)['read'];
			article.created = 1000 * rows.item(i)['created'];			                                      
			article.channelId = channelId;
			articles[i] = article;			
		}
		setChannelBody(articles);
	}
	db.transaction(
			function(/*Transaction*/ tx) {
				tx.executeSql('SELECT articleId, title, read, created FROM Articles WHERE channelId=? ORDER BY created DESC, rowId ASC', [channelId], openArticle);
			});
}

/*
 * Adds menu options to the page.
 */
function createMenuOptions() {
	// Make sure we are starting from a clean slate.
	if (blackberry.ui.menu.getMenuItems().length > 0) {
		blackberry.ui.menu.clearMenuItems();
	}

	var menuItem = new blackberry.ui.menu.MenuItem(false, 2, "Settings", goToSettings);
	blackberry.ui.menu.addMenuItem(menuItem);
	menuItem = new blackberry.ui.menu.MenuItem(false, 2, "Manage Feeds", goToManageFeeds);
	blackberry.ui.menu.addMenuItem(menuItem);

	if (!feedId && !filtered) {
		menuItem = new blackberry.ui.menu.MenuItem(false, 6, "Refresh All", refreshAll);
		blackberry.ui.menu.addMenuItem(menuItem);
		blackberry.ui.menu.setDefaultMenuItem(menuItem);
	}
	else
	{
		menuItem = new blackberry.ui.menu.MenuItem(false, 6, "Refresh", refresh); 
		blackberry.ui.menu.addMenuItem(menuItem);
		blackberry.ui.menu.setDefaultMenuItem(menuItem);
	}

	if (filtered) {
		menuItem = new blackberry.ui.menu.MenuItem(false, 1, "All Feeds", handleBack);
		blackberry.ui.menu.addMenuItem(menuItem);
		menuItem = new blackberry.ui.menu.MenuItem(false, 3, "previous", swipeLeft);
		blackberry.ui.menu.addMenuItem(menuItem);
		menuItem = new blackberry.ui.menu.MenuItem(false, 4, "next", swipeRight);
		blackberry.ui.menu.addMenuItem(menuItem);
	}

	if (feedId) {
		menuItem = new blackberry.ui.menu.MenuItem(false, 5, "Mark All Read", markAllRead);
		blackberry.ui.menu.addMenuItem(menuItem);
	}

	if (!feedId && !filtered) {
		menuItem = new blackberry.ui.menu.MenuItem(false, 1, "Single Feed", filter);
		blackberry.ui.menu.addMenuItem(menuItem);
	}
}


/*
 * Redirects to a single feed page.
 * This can be reached through left and right swipes (or prev/next menu items),
 * 		or the single feed menu item.
 * 
 * feedId: int - The ID of the feed to be directed to.
 */
function useFilter(/*int*/ feedId) {
	window.location.href="list.html?id=" + feedId;// + "&depth=" + (depth+1);
}

/*
 * Handler for the "Mark All Read" menu item.
 * Marks all items in the current feed as read.
 */
function markAllRead() {
	// Update in the database.
	setReadByFeed(feedId, true);
	// Update on the page.
	// TODO: FIX THIS!!!
	var links = document.getElementsByTagName("span");
	for (var i=0; i<links.length; i++) {
		if (links[i].className == "unread") {
			links[i].className = "read";
		}
	}
}

/*
 * Handler for the "Single Feed" menu item.
 * Allows the user to select a single feed to display.
 */
function filter() {
	db.transaction(getFeedList, handleError, processFilter);
	function handleError(/*SQLError*/ error) {
		alert("Error Get Feed List: " + error.message);
	}
}

/*
 * Second part of the filter process.
 * Presents the user with a list of feeds to display.
 * When the user selects one, they will be redirected to that page.
 * 
 * feedList: Feed[] - The current set of feeds.
 */
function processFilter(/*Feed[] feedList*/) {
	var feedNames = [],
        rowHeight,
        visibleRows,
        options;
        
	for (var j=0; j<feedList.length; j++) {
		feedNames[j] = feedList[j].name;
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
        'title' : "Which feed would you like to view?",
        'rowHeight': rowHeight,
        'visibleRows': visibleRows,
        'selectedIndex': defaultChoice,
        'items' : feedNames
    };
    
    // Open the spin dialog
    blackberry.ui.Spinner.open(options, 
        function (choice) {
            if (choice != undefined) {
                useFilter(feedList[choice].id);
            }
        }
    );
}

/*
 * Adds the article links to a channel on the page.
 * 
 * articles: Article[] - The articles to be added to a channel.  Each article contains the following:
 * 		articleId: int - The ID of the Article.
 * 		title: String - The title of the Article.
 * 		read: boolean - Whether the user has already viewed this Article.
 * Additionally, the array has an additional attribute:
 * 		channelId: int - The ID of the Channel containing these Articles.
 */
function setChannelBody(/*Article[]*/ articles) {
	if (articles.length <= 0) {
		return;
	}

	var channelId = articles[0].channelId;  // Get the Channel ID.

	// Create the body div for the channel.
	var body = document.createElement("div");
	body.className = "channelBody";
	body.style.display = "none";
	body.id = channelId + "_body";

	// Get the template for the articles.
	var template = document.getElementById("articleTemplate");
	var dateTemplate = document.getElementById("dateTemplate");
	var created = "";  // The last date that was displayed in this feed.
	for (var i=0; i<articles.length; i++) {
		var article = articles[i];
		var node = template.cloneNode(true);
		// TODO:Change or remove the ID of node!!! 
		var span = node.getElementsByTagName("span")[0];
		var date = new Date(article.created).toLocaleDateString();
		if (date != created) {
			var dateNode = dateTemplate.cloneNode(true);
			dateNode.removeAttribute("id");  // Clear the id, to prevent duplicate id's on the page.
//			dateNode.id = "";  // Clear the id, to prevent duplicate id's on the page.
			dateNode.getElementsByTagName("p")[0].innerHTML = date;
			created = date;
			body.appendChild(dateNode);
		}
		span.innerHTML = article.title;
		span.className = article.read ? "read" : "unread";
		node.value = article.articleId;
		body.appendChild(node);
	}

	var channel = document.getElementById(channelId);
	channel.appendChild(body);
	
	// Open Channel if returning from an article from this channel
	// or if there is only one feed on the screen
	if ((channelOpen && channelOpen == channelId) || (feedId)) {	
		handleChannelClick(channel.childNodes[1]);
	}	
}

/*
 * Click handler for an article header.  Redirects to the details page for the article.
 * 
 * id: int - The ID of the article to be opened.
 */
function handleClick(/*int*/ id) {
	var target = "details.html?id=" + id;
	if (feedId) {
		target = target + "&feedId=" + feedId;
	}
	window.location.href = target;
}

/*
 * Switches to the previous feed.
 * This is a handler for the extension code which catches left swipes.
 * It is also used by the previous menu item.
 */
function swipeLeft() {
	if (typeof(feedId) != "undefined" && feedId >= 0) {
		db.transaction(getFeedList, handleError, moveLeft);
		function handleError(/*SQLError*/ error) {
			alert("Error Get Feed List: " + error.message);
		}
	}
}

/*
 * Switches to the next feed.
 * This is a handler for the extension code which catches right swipes.
 * It is also used by the next menu item.
 */
function swipeRight() {
	if (typeof(feedId) != "undefined" && feedId >= 0) {
		db.transaction(getFeedList, handleError, moveRight);
		function handleError(/*SQLError*/ error) {
			alert("Error Get Feed List: " + error.message);
		}
	}
}

/*
 * Second half of the swipeLeft functionality.  Opens the previous feed in the list.
 * Will wrap (if the first feed on the list is the current feed, goes to the last on the list).
 * 
 * feedList: Feed[] - The list of feeds which we are moving through.
 */
function moveLeft(/*Feed[] feedList*/) {
	var currentFeedIndex = getIndex(feedList);
	// Modulus with a negative dividend may yield the wrong (negative) results.
	// To compensate, we add the divisor (feedList.length) to decremented values (currentFeedIndex - 1)
	// to guarantee non-negativity, while keeping modular congruence.
	var prevFeedIndex = (feedList.length + currentFeedIndex - 1) % feedList.length;
	useFilter(feedList[prevFeedIndex].id);
}

/*
 * Second half of the swipeRight functionality.  Opens the next feed in the list.
 * Will wrap (if the last feed on the list is the current feed, goes to the first on the list).
 * 
 * feedList: Feed[] - The list of feeds which we are moving through.
 */
function moveRight(/*Feed[] feedList*/) {
	var currentFeedIndex = getIndex(feedList);
	var nextFeedIndex = (currentFeedIndex + 1) % feedList.length;
	useFilter(feedList[nextFeedIndex].id);
}

/*
 * Determines the index of the current feed in an array of feeds.
 * 
 * feeds: Feed[] - The array of feeds from which to find the index of the current feed.
 * 
 * returns: The index of the current feed, or -1 if not found.
 */
function getIndex(/*Feed[]*/ feeds) {
	var index;
	for (index = feeds.length-1; index>=0 && feeds[index].id != feedId; index-- );  // This loop intentionally left empty.

	return index;
}

/*
 * Highlights the selected channel header.
 * 
 * header: HTML Element - The channelHeader div which is selected.
 */
function handleChannelSelect(/*HTML Element*/ header) {
	if (blackberry.focus.getFocus() != header.id) { 
		return;
	}

	var img = header.getElementsByTagName("img")[0];
	setSelected(img, img.src); // Change the highlighted image.
}

/*
 * Opens / Closes the selected channel, as well as highlighting the header.
 * 
 * header: HTML Element - The header (channelHeader div) of the channel to be opened or closed.
 */
function handleChannelClick(/*HTML Element*/ header){
	var img = header.getElementsByTagName("img")[0];
	var src = img.src;
	var body = document.getElementById(header.parentNode.id + "_body");

	if (body.style.display == 'none') {  // Open the channel.
		body.style.display = 'block';
		src = src.replace(/closed_arrow/, "open_arrow");
	} else {  // Close the channel.
		body.style.display = 'none';
		src = src.replace(/open_arrow/, "closed_arrow");
	}

	setSelected(img, src); // Change the highlighted image.
}

/*
 * Highlights the selected indicator image, and removes highlighting from any previous selected image.
 * 
 * selected: HTML img - The selected indicator image.
 * 
 * src: String - The source url for the (unhighlighted) selected indicator image.
 */
var lastSelected = null;
function setSelected(/*HTML img*/ selected, /*String*/ src) {
	// Clear previous selection.
	if (lastSelected) {
		lastSelected.src = lastSelected.src.replace(/_arrow_blue.png/, "_arrow.png");
	}

	lastSelected = selected;  // Remember which one is selected for next time.
	selected.src = src.replace(/_arrow.png/, "_arrow_blue.png");  // Highlight the current selection.
}

/*
 * Removes highlighting from the previous image on which setSelected was called.
 */
function clearSelected() {
	// Clear previous selection.
	if (lastSelected) {
		lastSelected.src = lastSelected.src.replace(/_arrow_blue.png/, "_arrow.png");
		lastSelected = null;
	}
}

function getFeedList(tx) {
	feedList = new Array();
	tx.executeSql("SELECT feedId, url, enabled FROM Feeds;", null, handleGetFeedList);

	function handleGetFeedList(tx, results) {
		if (results.rows.length > 0) {
			var k = 0;
			for ( var i = 0; i < results.rows.length; i++) {
				tx.executeSql("SELECT title, feedId FROM Channels WHERE feedId=? LIMIT 1;", [results.rows.item(i).feedId], function(tx, channelsResults){
//					feed.url = row.url;
//					feed.enabled = (row.enabled != 0);
					var feed = new Object();
					if (channelsResults.rows.length > 0) {
						var row = channelsResults.rows.item(0);
						feed.name = row.title;
						feed.id = row.feedId;
						feedList[k++] = feed;
					}
//					feed.name = feed.url.substring(1+feed.url.indexOf(":"));						
				}); 
			}
		}
	}
}


/*
 * Sets the read status of all Articles within a given Feed.
 * 
 * args: Object - The arguments object which should contain the following attributes:
 * 		feed: int - The Feed containing the articles to mark.
 * 		status: boolean - The new read status for the Articles.
 */
function setReadByFeed(id, flag) {
	db.transaction(function(tx){tx.executeSql('SELECT channelId FROM Channels WHERE feedId=?', [id], handleSetReadByFeed);});
	function handleSetReadByFeed(tx, results){
		for(var i = 0; i < results.rows.length; i++) 
		{
			tx.executeSql("UPDATE Articles SET read=? WHERE channelId=?", [flag ? 1 : 0, results.rows.item(i).channelId]);
		}
	}
}

/*
 * Handler for the "Refresh" menu option.  Initiates a manual update of all feeds.
 */
function refresh() {
	// Make sure everything will be updated.
	prepareForUpdate();

	// Initiate the first update.
	performUpdate();
}



/*
 * Adjusts anything that would make a feed or article ineligible for updating
 * (except the user preference to not download article content).
 */
function prepareForUpdate() {
	db.transaction(function(tx){
		// Reset any failure flags which would prevent downloading.
		tx.executeSql('UPDATE Feeds SET failed=0');

		// Determine the time between updates.
		var updateRate = profileDefaults.REFRESH_RATE;
		tx.executeSql('SELECT refreshRate FROM Profile LIMIT 1', null, handlePrepareForUpdate);
		function handlePrepareForUpdate(tx, results)
		{
			if (results.rows.length > 0) {
				updateRate = results.rows.item(0).refreshRate;

			}
			// Determine the maximum last update timestamp which would be eligible for update, now.
			var time = Math.floor( (new Date().getTime() - (updateRate * MILLISECONDS_PER_HOUR)) / 1000);
			// Push back all the update timestamps which might prevent update eligibility.
			tx.executeSql('UPDATE Feeds SET updated=? WHERE updated>?', [time, time]);
		}
	});
}


/*
 * Initiates update request on an eligible feed or article.
 */
var refreshFeed;
function performUpdate() {
	if(isRefreshing)
	{
		// 	Find a feed to update.
		db.transaction(getAllFeedsToUpdate, null,handlePerformUpdateAll);
	}
	else
	{
		// 	Find a feed to update.
		db.transaction(getFeedToUpdate, null,handlePerformUpdate);
	}
	function handlePerformUpdate()
	{
		if (refreshFeed && refreshFeed.age > (userRefreshRate * MILLISECONDS_PER_HOUR)) {
			// Send a request to the main process to get the current feed.
			requestRss({url: refreshFeed.url, feedId: refreshFeed.feedId});
		}
	}

	function handlePerformUpdateAll()
	{
		for (var j=0; j<feedList.length; j++) {
			if (feedList[j].age > (userRefreshRate * MILLISECONDS_PER_HOUR)) {
				// Send a request to the main process to get the current feed.
				requestRss({url: feedList[j].url, feedId: feedList[j].feedId});
			}
		}
	}
}



/*
 * Finds the least updated Feed which hasn't recently failed to update.
 * 
 * allowUnsubscribed: boolean - Unsubscribed (not enabled) feeds will not be returned if this evaluates to false.
 * 
 * returns: A Feed containing the following attributes:
 * 		feedId: int - The ID of the Feed.
 * 		url: String - The URL pointing the the Feed's RSS XML.
 * 		age: int - The number of milliseconds since this feed was updated.
 */
function getFeedToUpdate(tx) {
	refreshFeed = null;
	var result;
	tx.executeSql('SELECT feedId, url, updated FROM Feeds WHERE failed=0 and feedId = ? ORDER BY updated ASC', [feedId], handleGetFeedToUpdate);

	function handleGetFeedToUpdate(tx, results)
	{
		if (results.rows.length > 0) {
			refreshFeed = new Object();
			refreshFeed.feedId = results.rows.item(0).feedId;
			refreshFeed.url = results.rows.item(0).url;
			refreshFeed.age = (new Date().getTime() - 1000 * results.rows.item(0).updated);
		}
	}	
}

/*
 * Loads the content onto the page.
 */
function reloadListScreen() {
	window.history.go(0);
}

function handleReloadForRefreshAll()
{
	refreshAllCount++;

	if(feedList.length == refreshAllCount)
	{
		isRefreshing = false;
		reloadListScreen();
	}
}
/*
 * Check the current user setting for alerts.
 * 
 * returns: True if the user has requested to be alerted when there is new content.
 */
function getAlerts() {
	var value = profileDefaults.ALERTS;
	db.transaction(function(tx){
		tx.executeSql('SELECT alert FROM Profile LIMIT 1', null, handleGetAlerts);
	});

	function handleGetAlerts(tx, results)
	{
		if (results.rows.length > 0) {
			value = (results.rows.item(0).alert != 0);
		}
	}
	return value;
}

function refreshAll()
{
	isRefreshing = true;
	// If an auto update is in progress, setting isRefreshing to true will convert it to a user refresh
	if (!isAutoUpdating) {
		refreshAllCount = 0 ;
		refresh();
	}
}
