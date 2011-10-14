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
function updateContent(url) 
{
	try {
		req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.onreadystatechange = handleResponse;
		req.send(null);
	} 
	catch(e) {
		debug.log("updateContent", e, debug.exception);
	}
}
function updateContentPost(url) 
{
	try {
		var params = "parm1=123"
		req = new XMLHttpRequest();
		req.open('POST', url, false);
		
		//Send the proper header information along with the request
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.setRequestHeader("Content-length", params.length);
		req.setRequestHeader("Connection", "close");

		req.onreadystatechange = handleResponse;
		req.send(params);
	} 
	catch(e) {
		debug.log("updateContentPost", e, debug.exception);
	}
}
function handleResponse() 
{
	if (req.readyState == 4) 
	{
		//FOR PLAYBOOK, NEED TO CHECK FOR STATUS=0 WHEN XHR REQUESTS ARE MADE TO LOCAL RESOURCES
		//	(NOT NECESSARY FOR SMARTPHONE, WHERE STATUS=200 WILL SUFFICE.
		if (req.status == 200 || req.status == 0) 
		{
			displayOutput(req.responseText);
		}
		else {
			displayOutput("Error (" + req.status + "): " + req.statusText);
		}
	}
}
function displayOutput(val) 
{
	var sOut = val.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	sOut = '<b>HTTP Status: </b>' + req.status + 
			'<br/><br/><b>Response Text:</b><br/>' + sOut;
	var ele = document.getElementById('contentContainer');
	if (ele)
	{
		ele.innerHTML = sOut;
	}
}
