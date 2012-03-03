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

function exitApp() {
	try {
		debug.log("exitApp", "in exitApp", debug.info);

		if ((window.blackberry === undefined) || (blackberry.app === undefined)) {
			debug.log("exitApp", "blackberry.app object is undefined.", debug.error);
			return false;
		}

		if (confirm("Would you like to exit?")) {
			debug.log("exitApp", "exiting application", debug.info);
			blackberry.app.exit();
		}
		
	} 
	catch(e) {
		debug.log("exitApp", e, debug.exception);
	}
}

//Note: Currently the setHomeScreenName method is only supported on BlackBerry Smartphone device software:
function setName() {
	try {
		debug.log("setName", "in setName", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.app === undefined)) {
			debug.log("setName", "blackberry.app object is undefined.", debug.error);
			return false;
		}

		var ele = document.getElementById("txtSetName");
		if (ele) {
			debug.log("setName", "setting home screen name to '" + ele.value + "'", debug.info);
			blackberry.app.setHomeScreenName(ele.value);
		}
	}
	catch(e) {
		debug.log("setName", e, debug.exception);
	}
}

//Note: Currently the setHomeScreenIcon method is only supported on BlackBerry Smartphone device software:
function setIcon() {
	try {
		debug.log("setIcon", "in setIcon", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.app === undefined)) {
			debug.log("setIcon", "blackberry.app object is undefined.", debug.error);
			return false;
		}

		var ele = document.getElementById("txtSetIcon");
		if (ele) {
			debug.log("setIcon", "setting home screen icon to '" + ele.value + "'", debug.info);
			var result = blackberry.app.setHomeScreenIcon(ele.value);
			debug.log("setIcon", "Home screen icon " + (result === true ? "" : "NOT") + " set to '" + ele.value + "'", debug.info);
		}
		
	}
	catch(e) {
		debug.log("setIcon", e, debug.exception);
	}
}

function requestForeground() {
	debug.log("requestForeground", "moving application to foreground", debug.info);
	var result = blackberry.app.requestForeground();
}

//Note: Currently the requestBackground and requestForeground methods are only supported on BlackBerry Smartphone device software:
function requestBackground() {
	try {
		debug.log("requestBackground", "in setIcon", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.app === undefined)) {
			debug.log("requestBackground", "blackberry.app object is undefined.", debug.error);
			return false;
		}

		debug.log("requestBackground", "moving application to background", debug.info);
		setTimeout(requestForeground, 5000);
		var result = blackberry.app.requestBackground();
	
	}
	catch(e) {
		debug.log("requestBackground", e, debug.exception);
	}
}

function doPageLoad() {
	try {
		debug.log("doPageLoad", "in displayDetails", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.app === undefined)) {
			debug.log("doPageLoad", "blackberry.app object is undefined.", debug.error);
			prependContent("actions", "<p><i><b>blackberry.app</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			appendContent("details", "<p><i><b>blackberry.app</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		} 
		
		var sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>Name</th><td>" + blackberry.app.name + "</td></tr>");
		sb.append("<tr><th>ID</th><td>" + blackberry.app.id + "</td></tr>");
		sb.append("<tr><th>Version</th><td>" + blackberry.app.version + "</td></tr>");
		sb.append("<tr><th>Copyright</th><td>" + blackberry.app.copyright + "</td></tr>");
		sb.append("<tr><th>Description</th><td>" + blackberry.app.description + "</td></tr>");
		sb.append("<tr><th>Author</th><td>" + blackberry.app.author + "</td></tr>");
		sb.append("<tr><th>Author Email</th><td>" + blackberry.app.authorEmail + "</td></tr>");
		sb.append("<tr><th>Author URL</th><td>" + blackberry.app.authorURL + "</td></tr>");
		sb.append("<tr><th>License</th><td>" + blackberry.app.license + "</td></tr>");
		sb.append("<tr><th>License URL</th><td>" + blackberry.app.licenseURL + "</td></tr>");
		sb.append("</table>");
		
		appendContent("details", sb.toString());
		debug.log("doPageLoad", "Complete", debug.info);

	} 
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);