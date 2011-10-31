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
addEventListener('load',doLoad,false);

var feedCount = -1;  // int: The total number of feeds.
var unsubscribed;
var subscribed;
var addFeedDiv;
var template;
var promptPanel;

/*
 * Perform the initial page load.
 */
function doLoad() {
	// open DB and Queue up a database call to load the feeds.
	openDB(loadPage);
	promptPanel = document.getElementById('prompt');	
	promptPanel.style.display = 'none';
}

/*
 * Gets the feeds from the database, and loads them on the page.
 */
function loadPage() {
	function requestFeeds(/*SQLTransaction*/ tx) {		
		function handleFeeds(/*SQLTransaction*/ tx, /*SQLResultSet*/ result) {
			function handleFeed(/*SQLTransaction*/ tx, /*SQLResultSet*/ result) {
				var row = result.rows.item(0);
				if (row) {
					// Display the feed on the page.
					displayFeed({id:row["feedId"], url:row["url"], enabled:row["enabled"]!=0, name:row["title"]});
				}
			}

			var rows = result.rows;
			feedCount = rows.length;
			handleFeedCount();
			for (var i=0; i<feedCount; i++) {
				var id = rows.item(i)["feedId"];
				tx.executeSql("SELECT Feeds.feedId, url, enabled, title FROM Feeds LEFT JOIN Channels ON Feeds.feedId=Channels.feedId WHERE Feeds.feedId=? LIMIT 1", [id], handleFeed);
			}
		}

		tx.executeSql("Select feedId FROM Feeds", null, handleFeeds);		
	}

	function handleError(/*SQLError*/ error) {
		alert("Error loading the feed list: " + error.message);
	}

	// Locate important UI Elements.  (These will be necessary for processing the data when it comes back from loadPage).
	unsubscribed = document.getElementById("unsubscribed");
	subscribed = document.getElementById("subscribed");
	addFeedDiv = document.getElementById("addFeed");
	template = document.getElementById("feedTemplate");

	db.readTransaction(requestFeeds, handleError);
}

/*
 * Sets up event handlers based on the number of feeds.
 */
function handleFeedCount() {
	// Set the BACK key functionality.
	if (feedCount <= 0)
		// No feeds.  Back key requires exit from app.
		blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, blackberry.app.exit);
	else
		// Feeds exist.  Ok to use default back functionality.
		blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, null);

	if (feedCount < FEEDLIMIT) {
		// Feeds within limit.
		document.getElementById("addFeed").onclick = addFeed;

		// Add the menu item for adding feeds.
		if (blackberry.ui.menu.getMenuItems().length > 0) {
			blackberry.ui.menu.clearMenuItems();
		}

		var menuItem = new blackberry.ui.menu.MenuItem(false, 1, "New", addFeed);
		blackberry.ui.menu.addMenuItem(menuItem); // New
		blackberry.ui.menu.setDefaultMenuItem(menuItem);
	} else {
		document.getElementById("addFeed").onclick = addFeedFail;
	}
}

/*
 * Changes event handlers (if necessary) after the number of feeds is decremented.
 */
function handleFeedCountChange() {
	switch (feedCount) {
	case FEEDLIMIT - 1:
		// Feeds within limit.
		document.getElementById("addFeed").onclick = addFeed;

		// Add the menu item for adding feeds.
		var menuItem = new blackberry.ui.menu.MenuItem(false, 1, "New", addFeed);
		blackberry.ui.menu.addMenuItem(menuItem); // New
		blackberry.ui.menu.setDefaultMenuItem(menuItem);
		break;
	case 0: // 
		// No feeds.  Back key requires exit from app.
		blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, blackberry.app.exit);
		break;
	case -1: // How did this happen?
		alert("Internal Error.  Invalid count.");
		break;
	default: // No changes required.
	}
}

/*
 * feed: Feed - Contains information about the feed to be created:
 * 		name: String - The name of the feed.
 * 		url: String - The update URL for the feed.
 * 		enabled: boolean - Whether this feed is currently "subscribed".
 * 		id: int - The database ID for the feed.
 */
function displayFeed(/*Feed*/ feed) {
	try{		
		// Create the UI Element for the feed.
		var node = template.cloneNode(true);
		var children = node.getElementsByTagName("div");
		children[0].innerHTML = feed.name;
		children[1].innerHTML = feed.url;
		node.enabled = feed.enabled;
		node.id = feed.id;

		// Add the UI Element to the page.
		if (node.enabled)
			//subscribed.appendChild(feed);
			subscribed.appendChild(node);
		else
			//unsubscribed.appendChild(feed);
			unsubscribed.appendChild(node);
	} catch(e){alert("In DisplayFeed :" + e); throw e;}
}

/*
 * Re-directs to the add feed page.  This should not be called if the user is at/over the feed limit.
 */
function addFeed() {
	if (promptOpen) return;	// A prompt is open so ignore
	window.location.href = "addFeed.html";
}

/*
 * Alerts the user that they have reached the feed limit.
 * Call this when the user is at/over the feed limit, and requests to add a feed.
 */
function addFeedFail() {
	if (promptOpen) return;	// A prompt is open so ignore
	alert("You are already at the " + FEEDLIMIT + " feed limit");
}

var currentFeed = null;
var promptOpen = false;
/*
 * Click handler for a feed entry.  Gives the user options to subscribe/unsubscribe or delete (or cancel).
 * 
 * feed: HTML Element - The feed that was clicked on.
 */
function handleClick(/*HTML Element*/ feed) {
	if (promptOpen) return;	// A prompt is open so ignore
	promptOpen = true;
	currentFeed = feed;
	var name = feed.getElementsByTagName("div")[0].innerHTML;	
	var title = document.getElementById('promptTitle');
	title.innerHTML = "What would you like to do with '" + name + "'?";
	var status = document.getElementById('subscribeStatus');
	status.innerHTML = feed.enabled ? "Unsubscribe" : "Subscribe";	
	blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, promptBack);
	promptPanel.style.display = 'block';	
	// Force a pause so that prompt panel is visible first
	setTimeout("promptFocus('promptStatus');", 250);
}

/*
 * Used to contain the focus inside the prompt
 */
function promptFocus(id) {
	resetAllImages();
	var button = document.getElementById(id);
	button.style.backgroundPosition = 'bottom right';
	button.firstChild.style.backgroundPosition = 'bottom left';
	blackberry.focus.setFocus(id);
}

/*
 * reset all images on the form to unfocused
 */
function resetAllImages() {
	var button = document.getElementById('promptStatus');
	button.style.backgroundPosition = 'top right';
	button.firstChild.style.backgroundPosition = 'top left'; 

	var button = document.getElementById('promptDelete');
	button.style.backgroundPosition = 'top right';
	button.firstChild.style.backgroundPosition = 'top left'; 
}

/*
 * Back function for when the prompt is shown, so that pressing removes the prompt
 * doesn't leave the page
 */
function promptBack() {	
	promptOpen = false;
	promptPanel.style.display = 'none';
	document.getElementById('addFeed').focus();
	blackberry.focus.setFocus("addFeed");
	handleFeedCount();	// reset Back Function
}

/*
 * Changes the enabled status of a feed (updates the UI and database).
 * 
 * feed: HTML Element - The feed to be changed.
 */
function toggleEnabled(/*HTML Element*/ feed) {
	feed.enabled = !feed.enabled;  // Update the enabled status locally
	// Update the enabled status in the database.
	setFeedEnabled({feedId: feed.id, enabled: feed.enabled ? 1:0});
	// Update the display.
	var newParent = feed.enabled ? document.getElementById("subscribed") : document.getElementById("unsubscribed");
	feed.parentNode.removeChild(feed);  // Remove it from it's old location.
	newParent.appendChild(feed);
	promptBack(); // Reset Back Function and hide Prompt
}


/*
 * Marks a Feed as either enabled, or disabled.
 * 
 * args: Object - The arguments object which should contain the following attributes:
 * 		feedId: The ID for the Feed to be changed.
 * 		enabled: The new value for the enabled status.
 */
function setFeedEnabled(/*Object*/ args) {
	db.transaction(function(tx) {
		tx.executeSql('UPDATE Feeds SET enabled=? WHERE feedId=?', [args.enabled, args.feedId]);
	}, handleDatabaseError);
}

/*
 * Removes a feed (both from the UI and the database.
 * 
 * feed: HTML Element - The feed to be removed.
 */
function deleteFeed(/*HTML Element*/ feed) {
	moveFocus(feed);
	destroyFeed(feed.id);
	feed.parentNode.removeChild(feed);  // Remove from the display.
	promptBack(); // Reset Back Function and hide Prompt
}

/*
 * Removes a Feed from the database, as well as any Channels and Articles which are
 * associated with the Feed.
 * 
 * feedId: The ID for the Feed to be removed.
 */
function destroyFeed(/*int*/ feedId) {
	db.transaction(function(tx) {
		tx.executeSql('DELETE FROM feeds WHERE feedId=?', [feedId]);
	}, handleDatabaseError);	
}

/*
 * Moves the focus away from a feed which is going to be deleted.
 * 
 * feed: HTML Element - The feed which is being removed.
 */
function moveFocus(/*HTML Element*/ feed) {
	// Make sure navigation mode is enabled.
	if (!blackberry.focus) {
		return;
	}

	try {
		var feeds = feed.parentNode.childNodes;

		if (feeds.length > 1) {
			// Find the current feed in the list.
			var index;
			for (index=feeds.length; index>=0 && feed != feeds[index]; index--);  // This loop intentionally left empty.

			// Get the index for the next (or previous) feed in the list.
			if (++index >= feeds.length) {
				index = feeds.length - 2;
			}

			blackberry.focus.setFocus(feeds[index].id);
			return;
		}

		if (feed.parentNode.id == "subscribed") {
			feeds = document.getElementById("unsubscribed").childNodes;
			if (feeds.length > 0) {
				blackberry.focus.setFocus(feeds[0].id);
				return;
			}
		} else {
			feeds = document.getElementById("subscribed").childNodes;
			if (feeds.length > 0) {
				blackberry.focus.setFocus(feeds[0].id);
				return;
			}
		}
	} catch(e) {
		alert(e);
	}

	blackberry.focus.setFocus("addFeed");
}

