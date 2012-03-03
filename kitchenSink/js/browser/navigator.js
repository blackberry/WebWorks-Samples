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

function showMimeTypes() {
	var strReturn = "", myIndex;
	
	for (myIndex = 0; myIndex < window.navigator.mimeTypes.length; myIndex = myIndex + 1) {
		strReturn += window.navigator.mimeTypes[myIndex].type + "<br/>";
	}
	return strReturn;
}

function doPageLoad() {
	try {
		var sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>App Code Name</th><td>" + window.navigator.appCodeName + "</td></tr>");
		sb.append("<tr><th>App Minor Version</th><td>" + window.navigator.appMinorVersion + "</td></tr>");
		sb.append("<tr><th>App Name</th><td>" + window.navigator.appName + "</td></tr>");
		sb.append("<tr><th>App Version</th><td>" + window.navigator.appVersion + "</td></tr>");
		sb.append("<tr><th>Cookie Enabled</th><td>" + window.navigator.cookieEnabled + "</td></tr>");
		sb.append("<tr><th>CPU Class</th><td>" + window.navigator.cpuClass + "</td></tr>");
		sb.append("<tr><th>Mime Types</th><td>" + showMimeTypes() + "</td></tr>");
		sb.append("<tr><th>Online?</th><td>" + window.navigator.onLine + "</td></tr>");
		sb.append("<tr><th>Platform</th><td>" + window.navigator.platform + "</td></tr>");
		sb.append("<tr><th>System Language</th><td>" + window.navigator.systemLanguage + "</td></tr>");
		sb.append("<tr><th>User Language</th><td>" + window.navigator.userLanguage + "</td></tr>");
		sb.append("<tr><th>User Agent</th><td>" + window.navigator.userAgent + "</td></tr>");
		sb.append("<tr><th>User Profile</th><td>" + window.navigator.userProfile + "</td></tr>");
		sb.append("<tr><th>Java Enabled</th><td>" + window.navigator.javaEnabled() + "</td></tr>");
		
		appendContent("details", sb.toString());		
	} 
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}
		
window.addEventListener("load", doPageLoad, false);