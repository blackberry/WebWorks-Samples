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

function displayProtocols()
{
	try
	{
		debug.log("displayProtocols", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.audio === undefined))
		{
			debug.log("displayProtocols", "blackberry.audio object is undefined.", debug.error);
			prependContent("protocolDetails", "<p><i><b>blackberry.audio</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		} 

		debug.log("displayProtocols", "retrieving protocol details from blackberry.audio", debug.info);

		var protocols = blackberry.audio.supportedProtocols(null);
		
		var sb = new StringBuilder();
		sb.append("<table>");
		for (i = 0; i < protocols.length; i++)
		{
			sb.append("<tr><td>" + protocols[i] + "</td></tr>");
		}
		sb.append("</table>");

		appendContent("protocolDetails", sb.toString());

	} 
	catch(e) {
		debug.log("displayProtocols", e, debug.exception);
	}
}


function displayContentTypes()
{
	try
	{
		debug.log("displayContentTypes", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.audio === undefined))
		{
			debug.log("displayContentTypes", "blackberry.audio object is undefined.", debug.error);
			appendContent("contentTypeDetails", "<p><i><b>blackberry.audio</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		} 

		debug.log("displayContentTypes", "retrieving content type details from blackberry.audio", debug.info);

		var protocols = blackberry.audio.supportedProtocols(null);

		var sb = new StringBuilder();
		for (i = 0; i < protocols.length; i++)
		{
			sb.append("<h3>" + protocols[i] + "</h3>");
			var contentTypes = blackberry.audio.supportedContentTypes(protocols[i]);
			if (contentTypes) 
			{
				sb.append("<ul>");
				for (j = 0; j < contentTypes.length; j++) 
				{
					sb.append("<li>" + contentTypes[j] + "</li>");
				}
				sb.append("</ul>");
			}
			else {
				sb.append("<i>None</i>");
			}
		}

		appendContent("contentTypeDetails", sb.toString());

	} 
	catch(e) {
		debug.log("displayContentTypes", e, debug.exception);
	}
}

function doPageLoad()
{
	if ((window.blackberry === undefined) || (blackberry.audio === undefined))
	{
		debug.log("doPageLoad", "blackberry.audio object is undefined.", debug.error);
		prependContent("protocolDetails", "<p><i><b>blackberry.audio</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		prependContent("contentTypeDetails", "<p><i><b>blackberry.audio</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		return false;
	}

	displayProtocols();
	displayContentTypes();
}


window.addEventListener("load", doPageLoad, false);