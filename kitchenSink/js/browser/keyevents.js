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

var isGlobalState = true;
function handleKeypress(e) { 
	try {
		var t, id, val;
		
		t = e.currentTarget.tagName;
		id = e.currentTarget.id !== "" ? "id='" + e.currentTarget.id + "'" : "";
		val = "handleKeypress called from " + t + " " + id + " : '" + String.fromCharCode(e.keyCode) + "'<br/>";
		appendContent("logger", val);
	} 
	catch (er) {
		debug.log("handleKeypress", e, debug.exception);
	}
} 

function handleKeyup(e) {
	try {
		var t, id, val;
		
		t = e.currentTarget.tagName;
		id = e.currentTarget.id !== "" ? "id='" + e.currentTarget.id + "'" : "";
		val = "handleKeyup called from " + t + " " + id + " : '" + String.fromCharCode(e.keyCode) + "'<br/>";
		appendContent("logger", val);
		isGlobalState = true;	//key press event has finished on a specific element
	} 
	catch (er) {
		debug.log("handleKeyup", e, debug.exception);
	}
} 

function handleKeydown(e) { 
	try {
		var t, id, val;
		
		isGlobalState = false;	//key press event has began on a specific element
		t = e.currentTarget.tagName;
		id = e.currentTarget.id !== "" ? "id='" + e.currentTarget.id + "'" : "";
		val = "handleKeydown called from " + t + " " + id + " : '" + String.fromCharCode(e.keyCode) + "'<br/>";
		appendContent("logger", val);
	} 
	catch (er) {
		debug.log("handleKeydown", e, debug.exception);
	}
} 

//Global keypress event handler
function keyEventHandler(e) {
	try {
		var t, id, val, usingCtrlKey, usingAltKey, usingShiftKey;
		
		t = e.currentTarget.activeElement.tagName;
		id = e.currentTarget.activeElement.id !== "" ? "id='" + e.currentTarget.activeElement.id + "'" : "";				
		val = "handleKeydown called from " + t + " " + id + " : '" + String.fromCharCode(e.keyCode) + "'<br/>";

		//Can also create actions to invoke when users press a specific key combination (e.g. scrolling page up/down when space bar is pressed)
		usingCtrlKey = e.ctrlKey;
		usingAltKey = e.altKey;
		usingShiftKey = e.shiftKey;
		if (isGlobalState) {
			if (String.fromCharCode(e.keyCode) === " ") {
				val += " &nbsp; &nbsp; &nbsp; " + (usingShiftKey ? "SHIFT + " : "") + " Space bar pressed --&gt; possible action = scroll page " + (usingShiftKey ? "UP" : "DOWN") + "?<br/>";
			}
		}
		
		appendContent("logger", val);
	} 
	catch (er) {
		debug.log("keyEventHandler", e, debug.exception);
	}
}

function doPageLoad() {
	var txtTextBox, txtTextArea;
	
	txtTextBox = document.getElementById("txtTextBox"); 
	if (txtTextBox) {
		txtTextBox.addEventListener("keypress", handleKeypress, false); 
		txtTextBox.addEventListener("keyup",    handleKeyup,    false); 
		txtTextBox.addEventListener("keydown",  handleKeydown,  false); 
	}
	
	txtTextArea = document.getElementById("txtTextArea"); 
	if (txtTextArea) {
		txtTextArea.addEventListener("keypress", handleKeypress, true); 
		txtTextArea.addEventListener("keyup",    handleKeyup,    true); 
		txtTextArea.addEventListener("keydown",  handleKeydown,  true); 
	}
}
function clearLogInfo() {
	setContent("logger", "");
}


window.addEventListener("load", doPageLoad, false);
document.addEventListener("keypress", keyEventHandler, false);
