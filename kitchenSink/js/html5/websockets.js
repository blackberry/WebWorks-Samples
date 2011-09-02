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

var socket;

/**
 * Callback method invoked when the socket connection is opened.
 */
function onSocketOpen()
{
	appendContent("messages", "Web socket opened<br/>");
	show("btnSend");
}
/**
 * Callback method invoked when an incoming message is received
 */
function onSocketMessage(event)
{
	appendContent("messages", "Received: " + event.data + "<br/>");
}

/**
 * Callback method invoked when the socket connection is closed.
 */
function onSocketClose(event)
{
	try
	{
		appendContent("messages", "Web socket closed<br/>");
		hide("btnSend");
	} 
	catch (e) {
		debug.log("onSocketClose", e, debug.exception);
	}
}


/**
 * Called when user clicks on the "Send Message" button.
 */
function sendMessage()
{
	try
	{
		var message = document.getElementById("txtMessage").value;
		if (message === "")
		{
			alert("Enter a message");
		}
		else {
			if (socket.readyState === 1) 
			{
				socket.send(message);
				appendContent("messages", "Sent: " + message + "<br/>");
			}
		}
	} 
	catch (e) {
		debug.log("sendMessage", e, debug.exception);
	}
}


function doPageLoad()
{
	try
	{
		hide("btnSend");
		
//		openSocket();
	} 
	catch (e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

function doPageUnload()
{
	closeSocket();
}


function openSocket()
{
	try
	{
		if (window.WebSocket)
		{
			socket = new WebSocket("ws://node.remysharp.com:8001");
			socket.onopen    = onSocketOpen;
			socket.onmessage = onSocketMessage;
			socket.onclose   = onSocketClose;
		}
		else {
			appendContent("messages", "HTML5 Web Sockets are not supported by this application.");
			debug.log("openSocket", "HTML5 Web Sockets are not supported by this application.", debug.error);
		}
	} 
	catch (e) {
		debug.log("openSocket", e, debug.exception);
	}
}
function closeSocket()
{
	try
	{
		if (socket)
		{
			if (socket.readyState !== WebSocket.CLOSED)
			{
				socket.close();
			}
		}
	} 
	catch (e) {
		debug.log("closeSocket", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);
window.addEventListener("unload", doPageUnload, false);