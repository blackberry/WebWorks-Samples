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
var article = null;
var markUnreadMenuItem = null;
var saveMenuItem = null;
var feedId = null;

/*
 * Replace the page contents with an error message.
 */
function showError(/*String*/ message) {
	document.getElementById("feed").innerHTML = "<span class='errorMsg'>" + message + "</span>";
}

/*
 * Initialize the page.
 */
function initDetailsPage() {
	// Parse the URL so we can get the query parameters easily.
	// NOTE: the parser doesn't like the /// in local:///... .
	var url = blackberry.utils.parseURL(window.location.toString().replace("///", "//"));

	// Determine which article we are supposed to display
	var id = -1;
	try {  // Catch any errors, so we can display an error message.
		id = parseInt(url.getURLParameter("id"));
	} catch(e) {
		// Don't know what to display.  Show an error and give up.  (This shouldn't happen).
		showError('Invalid Page!!!');
		return;
	}

	try {
		feedId = parseInt(url.getURLParameter("feedId"));
	} catch(e) {
		// if this errors the user will go back to all feeds so not a big concern
	}	
	loadDetailsPage(id);
	blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, handleBack);
}

/*
 * Event handler for the "Back" hardware key.  Makes sure that we go all the way back
 * to the list screen in one step, rather than backing through articles.
 */
function handleBack() {
	// Reset the handler, and go back to the list screen.	
	
	function changePage(/*Transaction*/ tx, /*Result*/ result) {
		var target = "list.html";
		if (result.rows.length > 0) {
			target = target + "?channelId=" + result.rows.item(0)['channelId'];
			if (feedId) {
				target = target + "&id=" + feedId;
			}
		} else {
			if (feedId) {
				target = target + "?id=" + feedId;
			}						
		}		
		window.location.href = target;
	}
	
	function goBackError(/*Transaction*/ tx, /*Error*/ error) {
		alert("Fatal Error: " + error + error.message);
	}
	
	db.transaction(
			function(/*Transaction*/ tx) {			
					tx.executeSql("SELECT channelId FROM Articles WHERE articleId=?", [article.id], changePage, goBackError);					
			}
	);	
}

/*
 * Processes the article header to update the page.
 * 
 * _article: Object - An article object containing the following attributes:
 * 		id: int - The ID of this article.
 * 		saved: boolean - Whether this article has been marked saved.
 * 		link: String - The URL associated with this article.
 * 		title: String - The title of this article.
 */
function handleArticleHeader(/*Article*/ _article) {
	article = _article;  // Store the values for use in Menu Item callback functions and the Back function.
	setTitle(article.title); // Set the Title field on the page.
	createMenu(article.saved);  // Set up the menu options.
}

/*
 * Sets the page content for the article.
 * 
 * content: String - The content to set on the page.
 */
function setContent(/*String*/ content) {
	document.getElementById("feed").innerHTML = content;
}

/*
 * Sets the title at the top of the page.
 * 
 * title: String - The title to be set on the page.
 */
function setTitle(/*String*/ title) {
	var titleElement =  document.getElementById("title");
	titleElement.innerHTML = title;  // Set the text for the title bar.
	titleElement.title = title;  // Set the tooltip for the title bar.
	fitToWidth(titleElement, screen.width);
}

/*
 * Sets up the "Next" button and menu Item.
 * 
 * id: int - The ID of the previous article, or -1 if there is no previous article.
 */
function setPrevButton(/*int*/ id) {
	var button = document.getElementById("prevButton");

	if (id < 0) {
		// No Item to point to.  Gray out the button.
		button.style.color = "gray";
		return;
	}

	// Set the link for the button.
	article.prev = id;

	// Add "Previous" menu option.
	var menuItem = new blackberry.ui.menu.MenuItem(false, 0x11001, "Previous", goToPrev);
	blackberry.ui.menu.addMenuItem(menuItem);
}

/*
 * Sets up the "Next" button and menu Item.
 * 
 * id: int - The ID of the next article, or -1 if there is no next article.
 */
function setNextButton(/*int*/ id) {
	var button = document.getElementById("nextButton");

	if (id < 0) {
		// No Item to point to.  Gray out the button.
		button.style.color = "gray";
		return;
	}

	// Set the link for the button.
	article.next = id;

	// Add "Next" menu option.
	var menuItem = new blackberry.ui.menu.MenuItem(false, 0x11002, "Next", goToNext);
	blackberry.ui.menu.addMenuItem(menuItem);
}

/*
 * Creates all of the menu items for this page.
 * 
 * saved: boolean - Whether this article is currently marked as saved in the database.
 */
function createMenu(/*boolean*/ saved) {
	markUnreadMenuItem = new blackberry.ui.menu.MenuItem(false, 0x00001, "Mark as Unread", markUnread);
	blackberry.ui.menu.addMenuItem(markUnreadMenuItem); // Unread
	saveMenuItem = new blackberry.ui.menu.MenuItem(false, 0x00002, (saved?"Delete":"Save"), toggleSaved);
	blackberry.ui.menu.addMenuItem(saveMenuItem); // Save

	// This Space reserved for Prev and Next options.

	var menuItem = new blackberry.ui.menu.MenuItem(false, 0x22001, "Go To Feed Source", goToSource);
	blackberry.ui.menu.addMenuItem(menuItem); // Source
	blackberry.ui.menu.setDefaultMenuItem(menuItem);

	menuItem = new blackberry.ui.menu.MenuItem(false, 0x33001, "Send Email", sendEmail);
	blackberry.ui.menu.addMenuItem(menuItem); // Email

	menuItem = new blackberry.ui.menu.MenuItem(false, 0x44001, "Settings", goToSettings);
	blackberry.ui.menu.addMenuItem(menuItem);
	menuItem = new blackberry.ui.menu.MenuItem(false, 0x44002, "Manage Feeds", goToManageFeeds);
	blackberry.ui.menu.addMenuItem(menuItem);
}

/*
 * Marks the article as not having been read.
 */
function markUnread() {
	setRead(article.id, false);
	// Remove the menu item.
	blackberry.ui.menu.removeMenuItem(markUnreadMenuItem);
	markUnreadMenuItem = null;
}

/*
 * Changes the saved status of the article.
 */
function toggleSaved() {
	setSaved(article.id, !article.saved);
}

/*
 * Opens the previous article in the channel.
 */
function goToPrev() {
	var target = "details.html?id=" + article.prev;
	if (feedId) {
		target = target + "&feedId=" + feedId;
	}
	window.location.href = target;
}

/*
 * Opens the next article in the channel.
 */
function goToNext() {
	var target = "details.html?id=" + article.next;
	if (feedId) {
		target = target + "&feedId=" + feedId;
	}
	window.location.href = target;
}

/*
 * Opens the source page for the article in the browser.
 */
function goToSource() {
	invokeBrowser(article.link);
}

/*
 * Opens an e-mail, setting the subject (article title) and body (URL to the article).
 */
function sendEmail() {
	var args = new blackberry.invoke.MessageArguments('', article.title, article.link);
	args.view = blackberry.invoke.MessageArguments.VIEW_NEW;

	blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES, args);
}

/*
 * Advises the user of the new saved status of the article.
 */
function confirmSaved() {
	if (article.saved) {
		// Un-Save the current Item.
		article.saved = false;
		saveMenuItem.caption = "Save";
		alert("This article is no longer saved.");
	} else {
		// Save the current Item.
		article.saved = true;
		saveMenuItem.caption = "Delete";
		alert("This article has been saved.");
	}
}

/*
 * Opens a URL in the browser.
 * 
 * url: String - The URL to be opened.
 */
function invokeBrowser(/*String*/ url) {
	var args = new blackberry.invoke.BrowserArguments(url);
	blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
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

	db.transaction(getArticleById, handleError);

	function handleError(/*SQLError*/ error) {
		alert("Error loading the details page: " + error.message);
	}

	function getArticleById(tx) {
		article = null;
		tx.executeSql("SELECT channelId, title, link, content, saved FROM Articles WHERE articleId=?;", [articleId], handleGetArticleById, null); 
		function handleGetArticleById(tx, results) {
			if (results.rows.length > 0) {
				for ( var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					article = new Object();
					article.id = articleId;
					article.channelId = row.channelId;
					article.title = row.title;
					article.link = row.link;
					article.content = row.content;
					article.saved = (row.saved != 0);
				}
			}
			if (!article) {
				// The article is no longer available.  Send the user back to the list screen.
				handleBack();
				return;
			}

			setContent(article.content);  // Send the article to the page to be loaded.
			tx.executeSql('UPDATE Articles SET read=? WHERE articleId=?', [1, articleId]);

			// Send the rest of the article data to the page.
			handleArticleHeader(article);

			// Set up the previous and next buttons.
			getPreviousArticleId(tx, articleId);
			getNextArticleId(tx, articleId);

		}
	}
}

///*
//* Returns the ID of the previous Article in the Channel.
//* 
//* articleId: int - The ID of the current Article.
//* 
//* returns: The ID of the previous Article in the Channel, or -1 if no such Article exists.
//*/
function getPreviousArticleId(tx, /*int*/ articleId) {
	tx.executeSql('SELECT channelId, created FROM Articles WHERE articleId=?', [articleId], handleGetPreviousArticleId);

	function handleGetPreviousArticleId(tx, results1){
		if (results1.rows.length > 0) {
			var prow = results1.rows.item(0);
			var pchannelId = prow.channelId;
			var pcreated = prow.created;
		}

		// Look for a previous Article with the same created date.
		tx.executeSql('SELECT articleId FROM Articles WHERE channelId=? AND created=? AND articleId<? ORDER BY rowId DESC LIMIT 1', [pchannelId, pcreated, articleId], function(tx, results2){
			if (results2.rows.length > 0) {
				setPrevButton(results2.rows.item(0).articleId);
			} else {
				// Look for the latest Article with a previous created date.
				tx.executeSql('SELECT articleId FROM Articles WHERE channelId=? AND created<? ORDER BY created DESC LIMIT 1', [pchannelId, pcreated], function(tx, results3){
					if (results3.rows.length > 0) {
						setPrevButton(results3.rows.item(0).articleId);
					}
				});
			}
		});		
	}
//	return prev;
}

/*
 * Returns the ID of the next Article in the Channel.
 * 
 * articleId: int - The ID of the current Article.
 * 
 * returns: The ID of the next Article in the Channel, or -1 if no such Article exists.
 */
function getNextArticleId(tx, /*int*/ articleId) {
	// Start by getting information about the article.
	tx.executeSql('SELECT channelId, rowId, created FROM Articles WHERE articleId=?', [articleId], handleGetNextArticleId);
	function handleGetNextArticleId(tx, results4){
		if (results4.rows.length > 0) {
			var nrow = results4.rows.item(0);
			var nchannelId = nrow.channelId;
			var ncreated = nrow.created;
		}

		tx.executeSql('SELECT articleId FROM Articles WHERE channelId=? AND created=? AND articleId>? ORDER BY rowId ASC LIMIT 1', [nchannelId, ncreated, articleId], function(tx, results5){
			if (results5.rows.length > 0) {
				setNextButton(results5.rows.item(0).articleId);
			} else {
				// Look for the latest Article with a previous created date.
				tx.executeSql('SELECT articleId FROM Articles WHERE channelId=? AND created>? ORDER BY created ASC LIMIT 1', [nchannelId, ncreated], function(tx, results6){
					if (results6.rows.length > 0) {
						setNextButton(results6.rows.item(0).articleId);
					}
				});
			}
		});
	} 
//	return next;
}

/*
 * Sets the read status of an Article.
 * 
 * args: Object - The arguments object which should contain the following attributes:
 * 		id: int - The ID of the Article.
 * 		status: boolean - The new read status for the Article.
 */
function setRead(id, flag) {
	db.transaction(
			function(tx){
				tx.executeSql('UPDATE Articles SET read=? WHERE articleId=?', [flag ? 1 : 0, id]);
			}, function(err){alert("Error on reading the details page: " + err.message);});
}


/*
 * Sets the saved status of an Article.
 *
 * args: Object - The arguments object which should contain the following attributes:
 * 		id: int - The ID of the Article.
 * 		status: boolean - The new saved status for the Article.
 */
function setSaved(id, flag) {
	db.transaction(
			function(tx){
				tx.executeSql('UPDATE Articles SET saved=? WHERE articleId=?', [flag ? 1 : 0, id]);
			}, function(err){alert("Error on saving the details page: " + err.message);}, confirmSaved);
}

