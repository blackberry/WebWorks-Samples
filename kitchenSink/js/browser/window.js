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

var i = null;

/* Page navigation*/
function goToLocation()
{
	try
	{
		var ele = document.getElementById("txtLocation");
		if (ele)
		{
			window.location = ele.value;
		}
	} 
	catch(e) {
		debug.log("goToLocation", e, debug.exception);
	}
}

/* Timer events */
function setTime()
{
	var ele = document.getElementById("txtIntervalDemo");
	if (ele)
	{
		var dt = new Date();
		ele.innerHTML = dt.toString();
	}
}

function startInterval()
{
	try
	{
		var ele = document.getElementById("txtInterval");
		var intVal = 1000;
		if (ele)
		{
			intVal = ele.value;
		}
		i = window.setInterval(setTime, intVal);
	} 
	catch(e) {
		debug.log("startInterval", e, debug.exception);
	}
}
function stopInterval()
{
	try
	{
		window.clearInterval(i);
	} 
	catch(e) {
		debug.log("stopInterval", e, debug.exception);
	}
}

/* Page scrolling */
function scrollToTop()
{
	window.scroll(0, 0);		// parameters are (x, y) screen coordinates.
}
function scrollToBottom()
{
	window.scroll(0, screen.height);
}
function scrollUpBy(amt)
{
	window.scroll(0, window.pageYOffset - amt);
}
function scrollDownBy(amt)
{
	window.scroll(0, window.pageYOffset + amt);
}


/* Dialogs and prompts */
function postTimeoutMessage()
{
	var message = document.getElementById("txtMessage").value;
	alert(message);
}
function showMessageAfterDelay()
{
	var message = document.getElementById("txtMessage");
	var messageTimeout = document.getElementById("txtMessageTimeout");
	
	if (message)
	{
		var timeout = 2000;
		if (messageTimeout)
		{
			timeout = messageTimeout.value;
		}
		setTimeout(postTimeoutMessage, timeout);
	}	
}
function alertMessage()
{
	var message = document.getElementById("txtMessage");
	if (message)
	{
		alert("You wrote: " + message.value);
	}
}
function promptMessage()
{
	var message = document.getElementById("txtMessage");
	if (message)
	{
		var result = prompt("Modify this text:", message.value);
		alert("Modified value: " + result);
	}
}
function postTimeoutFocus()
{
	window.focus();
}
function delayFocus()
{
	alert("Focus should automatically be restored after 5 seconds");
	setTimeout(postTimeoutFocus, 5000);		//Return focus to the window after 5 seconds.
	window.blur();							//Take the focus immediately away from the window.
}
