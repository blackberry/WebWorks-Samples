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

function standardDialogCallBack(index) {
	appendContent("standardDetails",   "<p>Button index selected: " + index + "</p>");
}
function customDialogCallBack(index) {
	appendContent("customDetails", "<p>Button index selected: " + index + "</p>");
}

function standardDialog()  {
	try  {
		debug.log("standardDialog", "in standardDialog", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.ui === undefined) || (blackberry.ui.dialog === undefined)) {
			alert("blackberry.ui.dialog object is undefined.  Unable to complete action.");
			debug.log("standardDialog", "blackberry.ui.dialog object is undefined.", debug.error);
			return false;
		}
			
		if (blackberry.ui.dialog.standardAskAsync !== undefined) {
			var ops = {title : "Save Dialog", size : blackberry.ui.dialog.SIZE_MEDIUM, position : blackberry.ui.dialog.LOC_BOTTOM};
			blackberry.ui.dialog.standardAskAsync("Save?", blackberry.ui.dialog.D_SAVE, standardDialogCallBack, ops);
		} 
		else {
			blackberry.ui.dialog.standardAsk(blackberry.ui.dialog.D_YES_NO, "Save?", 0, true);
		}
	} 
	catch (e) {
		debug.log("standardDialog", e, debug.exception);
	}
}

function customDialog() {
	try {
		debug.log("customDialog", "in customDialog", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.ui === undefined) || (blackberry.ui.dialog === undefined)) {
			alert("blackberry.ui.dialog object is undefined.  Unable to complete action.");
			debug.log("customDialog", "blackberry.ui.dialog object is undefined.", debug.error);
			return false;
		}
			
		var buttons = new Array("Yes", "No", "Soon");
		var question = "Have you created your own BlackBerry PlayBook application yet?";
		if (blackberry.ui.dialog.customAskAsync !== undefined) {
			var ops = { title : "Answer:",	size : blackberry.ui.dialog.SIZE_MEDIUM, position : blackberry.ui.dialog.LOC_CENTER };
			blackberry.ui.dialog.customAskAsync(question, buttons, customDialogCallBack, ops);
		} 
		else {
			blackberry.ui.dialog.customAsk(question, buttons, 0, true);
		}
	} 
	catch (e) {
		debug.log("customDialog", e, debug.exception);
	}
}

function doPageLoad() {
	if ((window.blackberry === undefined) || (blackberry.ui === undefined)) {
		debug.log("doPageLoad", "blackberry.ui.dialog object is undefined.", debug.error);
		prependContent("customDetails", "<p><i><b>blackberry.ui</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		prependContent("standardDetails", "<p><i><b>blackberry.ui</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
	}
}		

window.addEventListener("load", doPageLoad, false);