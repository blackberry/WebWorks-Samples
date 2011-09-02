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

function setDetails()
{
	try
	{
		debug.log("setDetails", "in setDetails", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.identity === undefined))
		{
			debug.log("setDetails", "blackberry.identity object is undefined.", debug.error);
			appendContent("details", "<p><i><b>blackberry.identity</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		}
		else {
			var sb = new StringBuilder();
			sb.append("<table>");
			sb.append("<tr><th>IMEI</th><td>" + blackberry.identity.IMEI + "</td></tr>");
			sb.append("<tr><th>IMSI</th><td>" + blackberry.identity.IMSI + "</td></tr>");
			sb.append("<tr><th>PIN</th><td>"  + blackberry.identity.PIN  + "</td></tr>");
			sb.append("</table>");
			prependContent("details", sb.toString());
		}
		
	} 
	catch(e) {
		debug.log("setDetails", e, debug.exception);
	}
}

function setServiceList()
{
	try
	{
		debug.log("setServiceList", "in setServiceList", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.identity === undefined))
		{
			debug.log("setServiceList", "blackberry.identity object is undefined.", debug.error);
			appendContent("serviceList", "<p><i><b>blackberry.identity</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		if (typeof blackberry.identity.getServiceList !== "function")
		{
			debug.log("setServiceList", "blackberry.identity.getServiceList() method is not supported.", debug.error);
			appendContent("serviceList", "<p><i><b>blackberry.identity.getServiceList()</b> method not supported by this application.</i></p>");
			return false;
		} 
		else {
			var list = blackberry.identity.getServiceList();
			if (list)
			{
				var sb = new StringBuilder();
				sb.append("<table>");
				for (var i = 0; i < list.length; i++) {
					sb.append("<tr><th>Name</th><td>" + list[i].name + "</td><th>Type</th><td>" + list[i].type + "</td><tr>");
				}
				sb.append("</table>");
				appendContent("serviceList", sb.toString());
			}
		}
		
		
	} 
	catch(e) {
		debug.log("setServiceList", e, debug.exception);
	}
}

function setTransportList()
{
	try
	{
		debug.log("setTransportList", "in setTransportList", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.identity === undefined))
		{
			debug.log("setTransportList", "blackberry.identity object is undefined.", debug.error);
			appendContent("transportList", "<p><i><b>blackberry.identity</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		if (typeof blackberry.identity.getTransportList !== "function")
		{
			debug.log("setServiceList", "blackberry.identity.getTransportList() method is not supported.", debug.error);
			appendContent("transportList", "<p><i><b>blackberry.identity.getTransportList()</b> method not supported by this application.</i></p>");
			return false;
		} 
		else {
			var list = blackberry.identity.getTransportList();
			if (list)
			{
				var sb = new StringBuilder();
				sb.append("<table>");
				for (var i = 0; i < list.length; i++) {
					sb.append("<tr><th>Name</th><td>" + list[i].name + "</td><th>Type</th><td>" + list[i].type + "</td><tr>");
				}
				sb.append("</table>");
				appendContent("transportList", sb.toString())
			}
		}
		
	} 
	catch(e) {
		debug.log("setTransportList", e, debug.exception);
	}
}

function doPageLoad()
{
	setDetails();
	setServiceList();
	setTransportList();
}

window.addEventListener("load", doPageLoad, false);