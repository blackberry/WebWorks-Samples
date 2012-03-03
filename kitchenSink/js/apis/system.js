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

function setSystemDetails() {
	try {
		debug.log("setSystemDetails", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.system === undefined)) {
			debug.log("setSystemDetails", "blackberry.system object is undefined.", debug.error);
			appendContent("systemDetails", "<p><i><b>blackberry.system</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}
		
		var sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>Model</th><td>" + blackberry.system.model + "</td></tr>");
		sb.append("<tr><th>Script API Version</th><td>" + blackberry.system.scriptApiVersion + "</td></tr>");
		sb.append("<tr><th>Software Version</th><td>" + blackberry.system.softwareVersion + "</td></tr>");
		sb.append("<tr><th>Mass Storage Active</th><td>" + blackberry.system.isMassStorageActive() + "</td></tr>");
		sb.append("<tr><th>Has Data Coverage</th><td>" + blackberry.system.hasDataCoverage() + "</td></tr>");
		sb.append("<tr><th>Data Coverage</th><td>" + blackberry.system.dataCoverage + "</td></tr>");
		sb.append("</table>");
		
		appendContent("systemDetails", sb.toString());
	} 
	catch(e) {
		debug.log("setSystemDetails", e, debug.exception);
	}
}

function setPermissionDetails() {
	try {
		debug.log("setPermissionDetails", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.system === undefined)) {
			debug.log("setPermissionDetails", "blackberry.system object is undefined.", debug.error);
			appendContent("permissionDetails", "<p><i><b>blackberry.system</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		var sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>blackberry.app</th><td>" + blackberry.system.hasPermission("blackberry.app") + "</td><tr>");
		sb.append("<tr><th>blackberry.app.event</th><td>" + blackberry.system.hasPermission("blackberry.app.event") + "</td><tr>");
		sb.append("<tr><th>blackberry.find</th><td>" + blackberry.system.hasPermission("blackberry.find") + "</td><tr>");
		sb.append("<tr><th>blackberry.identity</th><td>" + blackberry.system.hasPermission("blackberry.identity") + "</td><tr>");
		sb.append("<tr><th>blackberry.identity.phone</th><td>" + blackberry.system.hasPermission("blackberry.identity.phone") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke</th><td>" + blackberry.system.hasPermission("blackberry.invoke") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.AddressBookArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.AddressBookArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.BrowserArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.BrowserArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.CalendarArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.CalendarArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.CameraArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.CameraArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.JavaArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.JavaArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.MapsArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.MapsArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.MemoArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.MemoArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.MessageArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.MessageArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.PhoneArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.PhoneArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.SearchArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.SearchArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.invoke.TaskArguments</th><td>" + blackberry.system.hasPermission("blackberry.invoke.TaskArguments") + "</td><tr>");
		sb.append("<tr><th>blackberry.io.dir</th><td>" + blackberry.system.hasPermission("blackberry.io.dir") + "</td><tr>");
		sb.append("<tr><th>blackberry.io.file</th><td>" + blackberry.system.hasPermission("blackberry.io.file") + "</td><tr>");
		sb.append("<tr><th>blackberry.message</th><td>" + blackberry.system.hasPermission("blackberry.message") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Address</th><td>" + blackberry.system.hasPermission("blackberry.pim.Address") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Appointment</th><td>" + blackberry.system.hasPermission("blackberry.pim.Appointment") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Attendee</th><td>" + blackberry.system.hasPermission("blackberry.pim.Attendee") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.category</th><td>" + blackberry.system.hasPermission("blackberry.pim.category") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Contact</th><td>" + blackberry.system.hasPermission("blackberry.pim.Contact") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Memo</th><td>" + blackberry.system.hasPermission("blackberry.pim.Memo") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Recurrence</th><td>" + blackberry.system.hasPermission("blackberry.pim.Recurrence") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Reminder</th><td>" + blackberry.system.hasPermission("blackberry.pim.Reminder") + "</td><tr>");
		sb.append("<tr><th>blackberry.pim.Task</th><td>" + blackberry.system.hasPermission("blackberry.pim.Task") + "</td><tr>");
		sb.append("<tr><th>blackberry.push</th><td>" + blackberry.system.hasPermission("blackberry.push") + "</td><tr>");
		sb.append("<tr><th>blackberry.system</th><td>" + blackberry.system.hasPermission("blackberry.system") + "</td><tr>");
		sb.append("<tr><th>blackberry.system.event</th><td>" + blackberry.system.hasPermission("blackberry.system.event") + "</td><tr>");
		sb.append("<tr><th>blackberry.ui.dialog</th><td>" + blackberry.system.hasPermission("blackberry.ui.dialog") + "</td><tr>");
		sb.append("<tr><th>blackberry.ui.menu</th><td>" + blackberry.system.hasPermission("blackberry.ui.menu") + "</td><tr>");
		sb.append("<tr><th>blackberry.utils</th><td>" + blackberry.system.hasPermission("blackberry.utils") + "</td><tr>");
		sb.append("<tr><th>blackberry.widgetcache</th><td>" + blackberry.system.hasPermission("blackberry.widgetcache") + "</td><tr>");
		sb.append("<tr><th>blackberry.widgetcache.CacheInformation</th><td>" + blackberry.system.hasPermission("blackberry.widgetcache.CacheInformation") + "</td><tr>");
		sb.append("</table>");
		
		appendContent("permissionDetails", sb.toString());
		debug.log("setPermissionDetails", "Complete", debug.info);
	} 
	catch(e) {
		debug.log("setPermissionDetails", e, debug.exception);
	}
}

function setCapabilityDetails() {
	try {
		debug.log("setCapabilityDetails", "in capabilityDetails", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.system === undefined)) {
			debug.log("setCapabilityDetails", "blackberry.system object is undefined.", debug.error);
			appendContent("capabilityDetails", "<p><i><b>blackberry.system</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		var sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>input.keyboard.issuretype</th><td>" + blackberry.system.hasCapability("input.keyboard.issuretype") + "</td><tr>");
		sb.append("<tr><th>input.touch</th><td>" + blackberry.system.hasCapability("input.touch") + "</td><tr>");
		sb.append("<tr><th>media.audio.capture</th><td>" + blackberry.system.hasCapability("media.audio.capture") + "</td><tr>");
		sb.append("<tr><th>media.video.capture</th><td>" + blackberry.system.hasCapability("media.video.capture") + "</td><tr>");
		sb.append("<tr><th>media.recording</th><td>" + blackberry.system.hasCapability("media.recording") + "</td><tr>");
		sb.append("<tr><th>location.gps</th><td>" + blackberry.system.hasCapability("location.gps") + "</td><tr>");
		sb.append("<tr><th>location.maps</th><td>" + blackberry.system.hasCapability("location.maps") + "</td><tr>");
		sb.append("<tr><th>storage.memorycard</th><td>" + blackberry.system.hasCapability("storage.memorycard") + "</td><tr>");
		sb.append("<tr><th>network.bluetooth</th><td>" + blackberry.system.hasCapability("network.bluetooth") + "</td><tr>");
		sb.append("<tr><th>network.wlan</th><td>" + blackberry.system.hasCapability("network.wlan") + "</td><tr>");
		sb.append("<tr><th>network.3gpp</th><td>" + blackberry.system.hasCapability("network.3gpp") + "</td><tr>");
		sb.append("<tr><th>network.cdma</th><td>" + blackberry.system.hasCapability("network.cdma") + "</td><tr>");
		sb.append("<tr><th>network.iden</th><td>" + blackberry.system.hasCapability("network.iden") + "</td><tr>");
		sb.append("</table>");
		
		appendContent("capabilityDetails", sb.toString());		
		debug.log("setCapabilityDetails", "Complete", debug.info);
	}
	catch(e) {
		debug.log("setCapabilityDetails", e, debug.exception);
	}
}
function doPageLoad() {
	setSystemDetails();
	setPermissionDetails();
	setCapabilityDetails();
}

window.addEventListener("load", doPageLoad, false);