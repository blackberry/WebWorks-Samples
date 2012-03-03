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
		var size = 0, num, out, i, key, value;
		
		if (window.localStorage) {
			num = window.localStorage.length;
			if (num > 0)
			{
				out = "<table width='50%' cellspacing='0' cellpadding='0' border='0'>";
				out += "<tr><th>Key</th><th>Chars </th></tr>";
				for (i = 0; i < num; i = i + 1) {
					key = window.localStorage.key(i);
					value = window.localStorage.getItem(key);
					out += "<tr><td>" + key + "</td><td>" + value.length + "</td></tr>";
					size += value.length;
				}
				out += "</table>";
				setContent("localStorage", out);
				show("btnClearLocal");
				appendContent("localStorage", size + " characters<br/>" + (Math.round((size * 2 / 1024 /1024 * 10000)) / 10000) + " Mb");
			}
			else {
				setContent("localStorage", "<i>Empty</i>");
				hide("btnClearLocal");
			}
		}
		else {
			//Local storage is not supported - read the values from cookies instead?
			console.log("Local storage is not supported");
		}
		
		if (window.sessionStorage) {
			num = window.sessionStorage.length;
			if (num > 0) {
				out = "<table width='50%' cellspacing='0' cellpadding='0' border='0'>";
				out += "<tr><th>Key</th><th>Value</th></tr>";
				out += "<tr><th>Key</th><th>Chars </th></tr>";
				for (i = 0; i < num; i = i + 1) {
					key = window.sessionStorage.key(i);
					value = window.sessionStorage.getItem(key);
					out += "<tr><td>" + key + "</td><td>" + value.length + "</td></tr>";
					size += value.length;
				}
				out += "</table>";
				setContent("sessionStorage", out);
				show("btnClearSession");
				appendContent("localStorage", size + " characters<br/>" + (Math.round((size * 2 / 1024 /1024 * 10000)) / 10000) + " Mb");
			} 
			else {
				setContent("sessionStorage", "<i>Empty</i>");
				hide("btnClearSession");
			}
		}
	} 
	catch (e) {
		debug.log("displayStorage", e.message, debug.exception);
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
		debug.log("removeAllLocal", e.message, debug.exception);
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
		debug.log("removeAllSession", e.message, debug.exception);
	}
}

function addItem(key, value, isLocal) {
	
	if ((key !== "") && (value !== "")) {
		if (isLocal) {
			if (window.localStorage) {
				window.localStorage.setItem(key, value);
				prependContent("output", "adding [" + key + "] to local storage.<br/>");
			} else {
				//Local storage is not supported - save the key/value in a cookie instead?
				console.log("Local storage is not supported");
			}
		} 
		else {
			if (window.sessionStorage) {
				window.sessionStorage.setItem(key, value);
				prependContent("output", "adding [" + key + "] to session storage.<br/>");
			}
		}
		displayStorage();
	} 
	else {
		prependContent("output", "Blank key or value entered<br/>");
	}
}

function getUniqueKey() {
	var dt = new Date();
	var key = dt.toDateString().replace(/ /g, "") + dt.getFullYear() + dt.getMonth() + dt.getDate() + dt.getHours() + dt.getMinutes() + dt.getSeconds();
	return key;
}
function runLocalLoadTest() {
	var len, sb, i, value;

	key = getUniqueKey();
	len = document.getElementById("txtNumBytesLocal").value;
	
	sb = new StringBuilder();
	
	for (i = 0; i < len; i = i + 1) {
		sb.append("a");
	}
	
	value = sb.toString();
	addItem(key, value, true);
}
function runSessionLoadTest() {
	var dt, key, value;
	
	dt = new Date();
	key = dt.toString.replace(" ", "");
	key = key.replace(":","");
	key = key.replace("-","");
	value = document.getElementById("txtNumBytesSession").value;
	addItem(key, value, false);
}

function doPageLoad() {
	try {
		if (!window.localStorage) {
			prependContent("output", "localStorage API not supported<br/>");
			document.getElementById("btnClearLocal").setAttribute("disabled", "true");
		}
		hide("btnClearLocal");

		if (!window.sessionStorage) {
			prependContent("output", "sessionStorage API not supported<br/>");
			document.getElementById("btnClearSession").setAttribute("disabled", "true");
		}
		hide("btnClearSession");
		
		displayStorage();
	}
	catch (e) {
		debug.log("doPageLoad", e.message, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);