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


function doPageLoad()
{
	try
	{
		appendContent("userAgent", "<code><i>" + navigator.userAgent + "</i></code>")
		var ua = navigator.userAgent.toLowerCase();
		
		var isBlackBerry = (ua.indexOf("blackberry") >= 0);
		var isWebKit     = (ua.indexOf("webkit") >= 0);
		var isMIDP       = (ua.indexOf("midp") >= 0);
		var isTablet     = (ua.indexOf("tablet") >= 0);
		
		var msg = "";
		if (isBlackBerry)
		{
			if (isWebKit) {
				msg = "<b>BlackBerry (WebKit) detected</b> - display HTML5 content such as audio, GPS and storage.";
			} 
			else if (isMIDP) {
				msg = "<b>BlackBerry (Standard) detected</b>";
			} 
			else {
				msg = "<b>BlackBerry (Unrecognized) detected</b>";
			}
		}
		else if (isTablet) {
			msg = "<b>BlackBerry PlayBook detected</b> - display content known to be supported by the Tablet OS (e.g. Flash)";
		}
		else {
			msg = "<b>Non-BlackBerry browser detected</b>";
		}
		
		appendContent("userAgent", "<p>" + msg + "</p>");
	}
	catch (e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}


window.addEventListener("load", doPageLoad, false);