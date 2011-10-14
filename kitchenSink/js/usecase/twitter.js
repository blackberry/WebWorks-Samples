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

var req;

function handleResponse() 
{
	try
	{
		if (req.readyState == 4) 
		{
			if (req.status == 200 || req.status == 0) 
			{
				//Parse JSON text into a JavaScript object
				var data = JSON.parse(req.responseText);
				var num = data.length;

				var sb = new StringBuilder();
				
				if (data.length > 0)
				{
					sb.append("<ul>");
					for (i = 0; i < num; i++) 
					{
						sb.append("<li><b>" + data[i].user.screen_name + "</b>: " + data[i].text + "</li>");
					}
					sb.append("</ul>");
					setContent("twitterFeed", sb.toString());
				}
			}
			else {
				var errMsg = "Error (" + req.status + "): " + req.statusText;
				setContent("twitterFeed", errMsg);
				debug.log("handleResponse", errMsg, debug.error);
			}
		}
	}
	catch(e) {
		debug.log("handleResponse", e, debug.exception);
	}
}

function displayFeed() 
{
	try 
	{
		/*
			Returns the 20 most recent statuses posted by the authenticating user (@BlackBerryDev)
			http://dev.twitter.com/doc/get/statuses/user_timeline
			
			Helpful online JSON parsing tool: http://json.parser.online.fr/
			
			Full Twitter API documentation page:
			http://apiwiki.twitter.com/w/page/22554679/Twitter-API-Documentation
		*/
		
		var txtScreenName = "BlackBerryDev";					//use as a default
		var ele = document.getElementById("txtScreenName");
		if (ele)
		{
			txtScreenName = (ele.value !== "") ? ele.value : "BlackBerryDev";
		}
		
		setContent("twitterFeed", "Loading Twitter feed for @" + txtScreenName + " ...");
		req = new XMLHttpRequest();
		req.open("GET", "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + txtScreenName, false);
		req.onreadystatechange = handleResponse;
		req.send(null);
	} 
	catch(e) {
		setContent("twitterFeed", e);
		debug.log("handleResponse", e, debug.error);
	}
}