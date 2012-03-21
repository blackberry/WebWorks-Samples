/*
 * Copyright 2012 Research In Motion Limited.
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

var swipemenu = (function() {
    "use strict";
	
	//private stuff
	var height = 70;
	var state = { activeClick : false, ignoreClick : false, menuOpen : false };

	function showMenuBar() {
		var menu;
		
		menu = document.getElementById("menuBar");
		//Show menu only if its already closed:
		if (menu && !state.menuOpen) {
			
			//Reassign onSwipeDown event - if menuBar is open, and swipe down occurs, close the menu.
			blackberry.app.event.onSwipeDown(hideMenuBar);
		
			//If you are already using jQuery in your project, use it to perform menu transition:
			if (typeof jQuery === "undefined") {
				menu.style['-webkit-transition'] = 'all 0.5s ease-in-out';
				menu.style['-webkit-transform'] = 'translate(0, ' + (height + 3) + 'px)';
				console.log("showMenuBar - using CSS3 to perform menu transition");
			} else {
				$('#menuBar').animate({top : 0}, {queue : false});
				console.log("showMenuBar - using jQuery to perform menu transition");
			}
			
			state.menuOpen = true; 
		}
		console.log("showMenuBar complete");
	}
	function hideMenuBar() { 
		var menu = document.getElementById("menuBar");
		//Hide menu only if its open:
		if (menu && state.menuOpen) {
			
			//Reassign onSwipeDown event - if menuBar is closed, and swipe down occurs, open the menu.
			blackberry.app.event.onSwipeDown(showMenuBar);

			//If you are already using jQuery in your project, use it to perform menu transition:
			if (typeof jQuery === "undefined") {
				menu.style['-webkit-transition'] = 'all 0.5s ease-in-out';
				menu.style['-webkit-transform'] = 'translate(0, -' + (height + 3) + 'px)';
				console.log("hideMenuBar - using CSS3 to perform menu transition");
			} else {
				$('#menuBar').animate({top : -100}, {queue : false});
				console.log("hideMenuBar - using jQuery to perform menu transition");
			}
		
			state.menuOpen = false; 
		}
		console.log("hideMenuBar complete");
	}

	function onMenuBarClicked() {
		state.activeClick = true;
		console.log("onMenuBarClicked complete");
	}
	function globalClickHandler(e) {
		//Close the menu if user touches anywhere on the page
		//	Requirement: menu must currently be open
		//	Exception: don't close menu if user has clicked on the menu itself.
		//	Exception: don't close menu if global ignore click state has been set.
		if (state.menuOpen && !state.activeClick && !state.ignoreClick) {
			hideMenuBar();
		}
		state.activeClick = false;
		state.ignoreClick = false;
		console.log("globalClickHandler complete");
	}
	
	function createSwipeMenu() {		
		var rightButtons, leftButtons, menuBar, existingMenu, top, style;

		top = parseInt(height / 9, 10);
		
		rightButtons = document.createElement("ul");
		rightButtons.id = "menuBarRightButtons";
		style = rightButtons.style;  //minimize page repaints
		style.cssFloat = "right";
		style.listStyle = "none";
		style.margin = "0";
		style.padding = "0 5px";
		style.border = "0";
		style.position = "relative";
		style.top = top + "px";
		rightButtons.style = style;
		
		leftButtons = document.createElement("ul");
		leftButtons.id = "menuBarLeftButtons";
		style = leftButtons.style;  //minimize page repaints
		style.cssFloat = "left";
		style.listStyle = "none";
		style.margin = "0";
		style.padding = "0 5px";
		style.border = "0";
		style.position = "relative";
		style.top = top + "px";
		leftButtons.style = style;

		menuBar = document.createElement("div");
		menuBar.addEventListener("click", onMenuBarClicked, false);
		menuBar.id = "menuBar";
		style = menuBar.style;  //minimize page repaints
		//menu structure/position - don't change this:
		style.position = "fixed";
		style.left = "0px";
		style.width = "100%";
		style.clear = "both";
		style.margin = "0";
		style.padding = "0";
		style.lineHeight = "1";
		style.border = "0";
		style.fontSize = "100%";

		//menu theme - customize this:
		style.background = "rgb(56,54,56)";
		style.borderBottom = "solid 1px #DDD";
		style.boxShadow = "0px 2px 2px #888";
		style.ontFamily = "Arial";
		style.color = "#CCCCCC";
		
		menuBar.style = style;

		//Renders off-screen content (so menu doesn't appear invisible):
		menuBar.style['-webkit-transform'] = 'translate(0, 0)';

		menuBar.appendChild(leftButtons);
		menuBar.appendChild(rightButtons);
		
		//Add swipemenu only if it isn't already on the page
		existingMenu = document.getElementById("menuBar");
		if (!existingMenu) {
			document.body.appendChild(menuBar);
		}
		
		console.log("createSwipeMenu complete");
	}

	//Called after a button is added to the menu
	function adjustMenuHeight() {
		var menu, style;

		menu = document.getElementById("menuBar");
		if (menu) {
			style = menu.style;	//minimize page repaints
			style.top = '-' + (height + 3) + 'px';
			style.height = height + 'px';
			menu.style = style;
		}
	}

	
	//public stuff
	return {
		simulateSwipeEvent : function() {
			state.ignoreClick = true;
			showMenuBar();
			console.log("simulateSwipeEvent complete");
		},
		close : function() {
			hideMenuBar();
			console.log("close complete");
		},
		addButton : function(title, onSelect, alignRight, iconPath, id) {
			var link, fontHeight, img, br, spn, style, i, buttonContainer, existingButtons;

			existingButtons = document.getElementById("menuBar").getElementsByTagName("li");
			for (i = 0; i < existingButtons.length; i= i + 1) {
				if (existingButtons[i].innerText === title) {
					//button already exists - don't add it
					return false;
				}
			}
			
			fontHeight = parseInt(height / 2.5, 10);

			link = document.createElement("li");
			
			//Set any ID property that may have been provided
			if (id) {
				link.setAttribute('id', id);
			}
			
			style = link.style;	//minimize page repaints.
			//button structure/position - don't change this:
			style.margin = "0 2px 0 2px";
			style.border = "0";
			style.padding = parseInt(fontHeight / 1.65, 10) + "px 12px";	//scale padding to best fit menu
			style.lineHeight = "inherit";
			style.fontSize = fontHeight + "px";
			style.borderRadius = "10px";
			style.cssFloat = "left";
			//button theme - customize this:
			style.background = "#222";
			style.color = "inherit";
			style.cursor = "pointer";
			style.fontWeight = "inherit";
			style.fontFamily = "inherit";
			style.textAlign = "center";
			link.style = style;

			//Can provide a path to an icon
			if (iconPath) {
				//reduce the padding around the image - fits into menu better:
				style = link.style;
				style.padding = parseInt(fontHeight / 4, 10) + "px 12px";
				link.style = style;
				
				img = new Image();
				img.src = iconPath;
				style = img.style;
				style.height = parseInt(height * 0.6, 10) + "px";		//scale the image to the current menubar height
				img.style = style;
				link.appendChild(img);

				if (title) {
					br = document.createElement("br");
					link.appendChild(br);
					//If title and image are used together, reduce image size to fit in menu
					style = img.style;
					style.height = parseInt(height * 0.45, 10) + "px";		//scale the image to the current menubar height
					img.style = style;
					
					//If title and image are used together, reduce font size to fit in menu
					style = link.style;
					style.fontSize = parseInt(fontHeight/2,10) + "px";
					link.style = style;
				}
			}
			spn = document.createElement("span");
			spn.innerText = title;
			link.appendChild(spn);
			
			
			//Add click handlers for menu button callbacks:
			if (onSelect) {
				link.addEventListener("click", onSelect, false);
				//close menu bar after user clicks the button
				link.addEventListener("click", hideMenuBar, false);
			}
			
			//Add button to right or left side of menu:
			if (alignRight) {
				buttonContainer = document.getElementById("menuBarRightButtons");
			} else {
				buttonContainer = document.getElementById("menuBarLeftButtons");
			}
			buttonContainer.appendChild(link);
			

			//Tell the menu to set its height (necessary after each button add):
			adjustMenuHeight();

			console.log("addButton '" + title + "' complete");
		},
		doPageLoad : function() {

		//TODO: Modify this so that the menu is only loaded if the onSwipeDown function exits
		//	prevents it from being added when used in Smartphone apps (where there is no
		//	swipe down event)
		
			createSwipeMenu();

			//closes the menu after user clicks anywhere on the page
			document.addEventListener("click", globalClickHandler, false);

			if ((typeof window.blackberry !== "undefined") && (typeof blackberry.app !== "undefined")) { 
				blackberry.app.event.onSwipeDown(showMenuBar); 
			}

			console.log("doPageLoad complete");
		},
		setMenuHeight : function(newHeight) {
			height = newHeight;
		}
	};

}());

window.addEventListener("load", swipemenu.doPageLoad, false);
