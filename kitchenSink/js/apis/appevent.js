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

function handleBackground() {
	try {
		debug.log("handleBackground", "in handleBackground", debug.info);
		document.body.className = "blackBG";
		appendContent("details", "Moved to background<br/>");				
	} 
	catch(e) {
		debug.log("handleBackground", e, debug.exception);
	}
}
function handleForeground() {
	try {
		debug.log("handleForeground", "in handleForeground", debug.info);
		document.body.className = "whiteBG";
		appendContent("details", "Moved to foreground<br/>");
	} 
	catch(e) {
		debug.log("handleForeground", e, debug.exception);
	}
}

function showToolbar() {
	setClassName("toolBar", "showToolBar");
}
function hideToolBar() {
	setClassName("toolBar", "hideToolBar");
}
function closeToolbar() {
	hideToolBar();
}

function handleSwipeDown() {
	try {
		debug.log("handleSwipeDown", "in handleSwipeDown", debug.info);
		showToolbar();
		appendContent("details", "Swipe down detected - showing toolBar<br/>");
	} 
	catch(e) {
		debug.log("handleSwipeDown", e, debug.exception);
	}
}


function doPageLoad() {
	try {
		if ((window.blackberry === undefined) || (blackberry.app === undefined) || (blackberry.app.event === undefined)) {
			debug.log("playAudio", "blackberry.app.event object is undefined.", debug.error);
			prependContent("details", "<p><i><b>blackberry.app.event</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}
		
		blackberry.app.event.onBackground(handleBackground);
		blackberry.app.event.onForeground(handleForeground);
		
		if (blackberry.app.event.onSwipeDown !== undefined) {
			blackberry.app.event.onSwipeDown(handleSwipeDown);
		}
		else {
			document.getElementById("btnSwipe").disabled = "disabled";
			hide("toolBar");
		}
		
	} 
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);