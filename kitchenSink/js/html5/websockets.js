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

var theSocket;

/**
 * Callback method invoked when the socket connection is opened.
 */
function onSocketOpen() {
	appendContent("theMessages", "Web socket opened<br/>");
	show("btnSend");
}
/**
 * Callback method invoked when an incoming message is received
 */
function onSocketMessage(event) {
	appendContent("theMessages", "Received: " + event.data + "<br/>");
}

/**
 * Callback method invoked when the socket connection is closed.
 */
function onSocketClose(event) {
	try {
		appendContent("theMessages", "Web socket closed<br/>");
		hide("btnSend");
		debug.log("onSocketClose", "Complete: " + event.target, debug.info);
	} 
	catch (e) {
		debug.log("onSocketClose", e, debug.exception);
	}
}


/**
 * Called when user clicks on the "Send Message" button.
 */
function sendMessage() {
	try {
		var message = document.getElementById("txtMessage").value;
		if (message === "") {
			alert("Enter a message");
		}
		else {
			if (theSocket.readyState === 1)  {
				theSocket.send(message);
				appendContent("theMessages", "Sent: " + message + "<br/>");
			}
		}
	} 
	catch (e) {
		debug.log("sendMessage", e, debug.exception);
	}
}



function openSocket() {
	try {
		if (window.WebSocket) {
			theSocket = new WebSocket("ws://node.remysharp.com:8001");
			theSocket.onopen    = onSocketOpen;
			theSocket.onmessage = onSocketMessage;
			theSocket.onclose   = onSocketClose;
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
function closeSocket() {
	try {
		if (theSocket) {
			if (theSocket.readyState !== WebSocket.CLOSED) {
				theSocket.close();
			}
			else {
				debug.log("closeSocket", "Socket is already closed", debug.info);
			}
		}
	} 
	catch (e) {
		debug.log("closeSocket", e, debug.exception);
	}
}


function doPageLoad() {
	try {
		hide("btnSend");
	} 
	catch (e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

function doPageUnload() {
	closeSocket();
}

window.addEventListener("load",   doPageLoad,   false);
window.addEventListener("unload", doPageUnload, false);