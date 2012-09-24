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

 function displayStorage() {
	try {
		var num, out, i, key, value;
		
		if (window.localStorage) {
			num = window.localStorage.length;
			if (num > 0) {
				out = "<table width='50%' cellspacing='0' cellpadding='0' border='0'>";
				out += "<tr><th>Key</th><th>Value</th><th></th></tr>";
				for (i = 0; i < num; i = i + 1) {
					key = window.localStorage.key(i);
					value = window.localStorage.getItem(key);
					out += "<tr><td>" + key + "</td><td>" + value + "</td><td><button onclick=\"removeLocalItem('" + key + "')\">Delete</button></td></tr>";
				}
				out += "</table>";
				setContent("localStorage", out);
				show("btnClearLocal");
				appendContent("localStorage", "<p>" + num + " item(s) in local storage</p>");
			}
			else {
				setContent("localStorage", "<i>Empty</i>");
				hide("btnClearLocal");
			}
		} 
		else {
			//Local storage is not supported - read the values from cookies instead?
			setContent("localStorage", "<i><b>window.localStorage</b> API is not supported.</i>");
			return false;
		}
		
		
		if (window.sessionStorage) {
			num = window.sessionStorage.length;
			if (num > 0) {
				out = "<table width='50%' cellspacing='0' cellpadding='0' border='0'>";
				out += "<tr><th>Key</th><th>Value</th><th></th></tr>";
				for (i = 0; i < num; i = i + 1) {
					key = window.sessionStorage.key(i);
					value = window.sessionStorage.getItem(key);
					out += "<tr><td>" + key + "</td><td>" + value + "</td><td><button onclick=\"removeSessionItem('" + key + "')\">Delete</button></td></tr>";
				}
				out += "</table>";
				setContent("sessionStorage", out);
				show("btnClearSession");
				appendContent("sessionStorage", "<p>" + num + " item(s) in session storage</p>");
			} 
			else {
				setContent("sessionStorage", "<i>Empty</i>");
				hide("btnClearSession");
			}
		}
		else {
				setContent("localStorage", "<i><b>window.sessionStorage</b> API is not supported.</i>");
				return false;
		}
	} 
	catch (e) {
		debug.log("displayStorage", e, debug.exception);
	}
}

function removeLocalItem(key) {
	try {
		localStorage.removeItem(key);
		displayStorage();
	} 
	catch (e) {
		debug.log("removeLocalItem", e, debug.exception);
	}
}
function removeSessionItem(key) {
	try {
		sessionStorage.removeItem(key);
		displayStorage();
	} 
	catch (e) {
		debug.log("removeSessionItem", e, debug.exception);
	}
}

function removeAllLocal() {
	try {
		prependContent("output", "Clearing local storage<br/>");
		if (window.localStorage) {
			localStorage.clear();
		}
		displayStorage();
	}
	catch (e) {
		debug.log("removeAllLocal", e, debug.exception);
	}
}
function removeAllSession() {
	try {
		prependContent("output", "Clearing session storage<br/>");
		if (window.sessionStorage) {
			sessionStorage.clear();
		}
		displayStorage();				
	} 
	catch (e) {
		debug.log("removeAllSession", e, debug.exception);
	}
}



function addItem() {
	var key = document.getElementById("txtKey").value;
	var value = document.getElementById("txtValue").value;
	var localRadio = document.getElementById("localRadio").checked;
	
	if ((key !== "") && (value !== "")) {
		if (localRadio) {
			if (window.localStorage) {
				window.localStorage.setItem(key, value);
				prependContent("output", "adding [" + key + "] to local storage.<br/>");
			} else {
				//Local storage is not supported - save the key/value in a cookie instead?
				alert("window.localStorage API is not supported.");
				return false;
			}
		} 
		else {
			if (window.sessionStorage) {
				window.sessionStorage.setItem(key, value);
				prependContent("output", "adding [" + key + "] to session storage.<br/>");
			}
			else {
				alert("window.sessionStorage API is not supported.");
			}
		}
		displayStorage();
	} 
	else {
		prependContent("output", "Blank key or value entered<br/>");
	}
}

/**
 * The storage event is fired on the same window object whenever stored data changes as a result of calling setItem(), removeItem() or clear().
 */
function handleStorageEvent(storage) {
	try {
		var key = storage.key;
		var oldValue = storage.oldValue;
		var newValue = storage.newValue;
		var url = storage.url;
		prependContent("output", "handleStorageEvent: changing '" + oldValue + "' to '" + newValue + "' for key '" + key + "' (" + url + ")<br/>");
		
		debug.log("handleStorageEvent", "Complete", debug.info);
	}
	catch (e) {
		debug.log("handleStorageEvent", e, debug.exception);
	}
}

function doPageLoad() {
	try  {
		if (!window.localStorage) {
			prependContent("output", "window.localStorage API not supported<br/>");
			document.getElementById("localRadio").setAttribute("disabled", "true");
			document.getElementById("btnClearLocal").setAttribute("disabled", "true");
		}
		hide("btnClearLocal");

		if (!window.sessionStorage) {
			prependContent("output", "window.sessionStorage API not supported<br/>");
			document.getElementById("sessionRadio").setAttribute("disabled", "true");
			document.getElementById("btnClearSession").setAttribute("disabled", "true");
		}
		hide("btnClearSession");
		
		displayStorage();

		//don't think this is doing anything
		if (window.addEventListener) { 
			window.addEventListener("storage", handleStorageEvent, false); 
		} 
		else { 
			window.attachEvent("onstorage", handleStorageEvent); 
		}

	}
	catch (e) {
		debug.log("initPage", e.message, debug.exception);
	}
}


window.addEventListener("load", doPageLoad, false);
