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

function displayScreenDimensions()
{
	try
	{
		var sb = new StringBuilder();
		sb.append("<table cellspacing='5' width='20%'>");
		sb.append("<tr><th>screen.availHeight</th><td>" + screen.availHeight  + "</td></tr>");
		sb.append("<tr><th>screen.availWidth</th><td>" + screen.availWidth + "</td></tr>");
		sb.append("<tr><th>screen.colorDepth</th><td>" + screen.colorDepth + "</td></tr>");
		sb.append("<tr><th>screen.height</th><td>" + screen.height + "</td></tr>");
		sb.append("<tr><th>screen.width</th><td>" + screen.width + "</td></tr>");
		sb.append("<tr><th>screen.pixelDepth</th><td>" + screen.pixelDepth + "</td></tr>");
		appendContent("screendetails", sb.toString());
	}
	catch(e) {
		debug.log("displayScreenDimensions", e, debug.exception);
	}
}
function displayWindowDimensions()
{
	try
	{
		var sb = new StringBuilder();
		sb.append("<table cellspacing='5' width='20%'>");
		sb.append("<tr><th>window.innerWidth</th><td>" + window.innerWidth  + "</td></tr>");
		sb.append("<tr><th>window.innerHeight</th><td>" + window.innerHeight + "</td></tr>");
		sb.append("<tr><th>window.outerHeight</th><td>" + window.outerHeight  + "</td></tr>");
		sb.append("<tr><th>window.outerWidth</th><td>" + window.outerWidth + "</td></tr>");
		appendContent("windowdetails", sb.toString());
	}
	catch(e) {
		debug.log("displayWindowDimensions", e, debug.exception);
	}
}

function doPageLoad()
{
	displayScreenDimensions();
	displayWindowDimensions();
}

window.addEventListener("load", doPageLoad, false);