/*
 * Copyright 2012 Research In Motion Limited.
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

function sendMessage() {
	var imgPath, title, message;
	
	//local Image:
	imgPath = "../../img/wash.png";
	//Remote URL:
	imgPath = "http://icons.iconarchive.com/icons/martin-berube/animal/32/monkey-icon.png";
	title = "Web Notification";
	message = "Sent from the Kitchen Sink app.";
	
	//The following will add a notification to the desktop / homescreen:
	webkitNotifications.createNotification(imgPath, title, message).show();
}
function sendNotification(e) {

	if (window.webkitNotifications) {
		if (window.webkitNotifications.checkPermission() === 0) {
			sendMessage();
		} else {
			webkitNotifications.requestPermission(sendMessage);
		}
	} else {
		console.log("Error in sendNotification: webkitNotifications API is undefined");
	}
}

function doLoad(e) {
	var btn = document.getElementById("btnNotify");
	if (btn) {
		btn.addEventListener("click", sendNotification, false);
	}
}

window.addEventListener("load", doLoad, false);
