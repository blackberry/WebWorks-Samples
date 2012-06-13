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

function parseURL() {
	try {
		debug.log("parseURL", "in parseURL");

		if ((window.blackberry === undefined) || (blackberry.utils === undefined)) {
			debug.log("parseURL", "blackberry.utils object is undefined", debug.error);
			return false;
		}

		var ele = document.getElementById("txtURL");
		if (ele) {
			var url = blackberry.utils.parseURL(ele.value);
			
			var sb = new StringBuilder();
			sb.append("<table>");
			sb.append("<tr><th>Host</th><td>" + url.host + "</td></tr>");
			sb.append("<tr><th>Port</th><td>" + url.port + "</td></tr>");
			sb.append("<tr><th>Parameter (index 0)</th><td>" + url.getURLParameterByIndex(0) + "</td></tr>");
			sb.append("<tr><th>Parameter (name 'FOO')</th><td>" + url.getURLParameter("FOO") + "</td></tr>");
			sb.append("</table>");
			appendContent("urlDetails", sb.toString());
		}
		
	} 
	catch(e) {
		debug.log("parseURL", e, debug.exception);
	}
}

function generateUID() {
	try {
		debug.log("generateUID", "in generateUID", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.utils === undefined)) {
			debug.log("generateUID", "blackberry.utils object is undefined", debug.error);
			return false;
		}
		
		var ele = document.getElementById("txtUID");
		if (ele) {
			var uniqueId = blackberry.utils.generateUniqueId();
			ele.value = uniqueId;
		}
		
	} 
	catch(e) {
		debug.log("generateUID", e, debug.exception);
	}
}

function doPageLoad()
{
	if ((window.blackberry === undefined) || (blackberry.utils === undefined)) {
		debug.log("doPageLoad", "blackberry.utils object is undefined", debug.error);
		prependContent("details", "<p><i><b>blackberry.utils</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
	}
}

window.addEventListener("load", doPageLoad, false);