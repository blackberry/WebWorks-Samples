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

/**
 * Create callback methods that are invoked when a 
 *	user selects their corresponding menu item
 * @return
 */
function appWorld()
{
	alert("Open App World menu item selected");
	debug.log("contextualMenuItem", "Open App World menu item selected", debug.info);
}
function showAbout()
{
	alert("About menu item selected");
	debug.log("contextualMenuItem", "About menu item selected", debug.info);
}
function reloadPage()
{
	alert("Refresh menu item selected");
	debug.log("contextualMenuItem", "Refresh menu item selected", debug.info);
}
function shareApp()
{
	alert("Share menu item selected");
	debug.log("contextualMenuItem", "Share menu item selected", debug.info);
}


/**
 * The following functions are used to demonstrate how you can contextualise the menu,
 * 		by adding or removing items while the user has your application open.
 * 		This allows you to modify the menu, based on the current state of the
 * 		This allows you to modify the menu, based on the current state of the
 * 		application, creating a contextual user experience.
 * @return nothing
 */
function contextualMenuItem()
{
	alert("Custom menu item selected");
	debug.log("contextualMenuItem", "menu item selected", debug.info);
}
function addCustomMenuItem()
{
	try
	{
	
		if ((window.blackberry === undefined) || (blackberry.ui.menu === undefined))
		{
			alert("blackberry.ui.menu object is undefined.  Unable to complete action.");
			debug.log("record", "blackberry.ui.menu object is undefined.", debug.error);
			return false;
		}

		var ele = document.getElementById("txtMyMenu");
		if (ele)
		{
			var caption = ele.value;
			var mi_custom = new blackberry.ui.menu.MenuItem(false, 99, caption, contextualMenuItem);
			blackberry.ui.menu.addMenuItem(mi_custom);
			debug.log("addCustomMenu", "'" + caption + "' item added to menu", debug.info);
		}
		
	} 
	catch (e) {
		debug.log("addCustomMenuItem", e, debug.exception);
	}
}

/**
 * Adds MenuItem objects to the application menu
 * @see http://www.blackberry.com/developers/docs/widgetapi/ 
 * @return nothing
 */
function doPageLoad() 
{
	try 
	{
	
		if ((window.blackberry === undefined) || (blackberry.ui.menu === undefined))
		{
			debug.log("doPageLoad", "blackberry.ui.menu object is undefined.", debug.error);
			prependContent("details", "<p><i><b>blackberry.ui.menu</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		//create MenuItem objects:
		//
		//   @param isSeparator (Boolean) - true/false whether this item is a menu separator
		//   @param ordinal (Number) - specifies sort order within the menu.  Lower ordinal values have higher position in menu.
		//   @param caption (String) - text to be displayed in menu for this menu item.
		//   @param iscallback (OnClick) - JavaScript function name to be called when user selects this menu item. 
		// 
		var mi_top       = new blackberry.ui.menu.MenuItem(true,  0);
		var mi_appWorld  = new blackberry.ui.menu.MenuItem(false, 1, "Open App World", appWorld);
		var mi_about     = new blackberry.ui.menu.MenuItem(false, 2, "About", showAbout);
		var mi_reload    = new blackberry.ui.menu.MenuItem(false, 3, "Refresh", reloadPage);
		var mi_middle    = new blackberry.ui.menu.MenuItem(true,  4);
		var mi_share     = new blackberry.ui.menu.MenuItem(false, 5, "Share ...", shareApp);
		var mi_bottom    = new blackberry.ui.menu.MenuItem(true,  6);

		
		//Optionally remove any default menu items:
		//
		blackberry.ui.menu.clearMenuItems();

		
		//Add your own custom MenuItem objects to the menu:
		//
		blackberry.ui.menu.addMenuItem(mi_top);
		blackberry.ui.menu.addMenuItem(mi_appWorld);
		blackberry.ui.menu.addMenuItem(mi_about);
		blackberry.ui.menu.addMenuItem(mi_reload);
		blackberry.ui.menu.addMenuItem(mi_middle);
		blackberry.ui.menu.addMenuItem(mi_share);
		
		
		//Optionally check to see if a menu item already exists:
		//
		if (blackberry.ui.menu.hasMenuItem(mi_bottom))
		{
			blackberry.ui.menu.removeMenuItem(mi_bottom);
		}
		blackberry.ui.menu.addMenuItem(mi_bottom);
		
		
		//Optionally define the menu item that will receive default 
		//	focus when the menu is opened:
		//
		blackberry.ui.menu.setDefaultMenuItem(mi_about);
		
		debug.log("doPageLoad", "Menu Items Added", debug.info);

	} 
	catch (e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);