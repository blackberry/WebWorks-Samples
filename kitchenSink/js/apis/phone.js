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
function getCallLogType(logType) {
	
	switch(logType) {
		case blackberry.phone.PhoneLogs.CallLog.TYPE_RECEIVED_CALL :
			return "received";
		case blackberry.phone.PhoneLogs.CallLog.TYPE_PLACED_CALL :
			return "placed";
		case blackberry.phone.PhoneLogs.CallLog.TYPE_MISSED_CALL_UNOPENED :
			return "missed unopened";
		case blackberry.phone.PhoneLogs.CallLog.TYPE_MISSED_CALL_OPENED :
			return "missed opened";
		default:
			return "unknown type";
	}
}

 function getCallLogDetails(callLog) {

	var sb = new StringBuilder();
	sb.append(callLog.number);
	sb.append(" (");
	sb.append(getCallLogType(callLog.type));
	sb.append(")");
	sb.append(" duration = ");
	sb.append(callLog.duration);
	sb.append("(sec), date = ");
	sb.append(callLog.date);
	return sb.toString();
}
function getMissedCallLogDetails(callLog) {

	var sb = new StringBuilder();
	sb.append(callLog.number);
	sb.append(" (");
	sb.append(getCallLogType(callLog.type));
	sb.append(") ");
	sb.append(callLog.date);
	return sb.toString();
}

 function onCallLogAdded(addedCallLog) {
	var details = "<p><i>Call Log added</i>: " + getCallLogDetails(addedCallLog) + "</p>";
	appendContent("phoneLogDetails", details);
}
function onCallLogRemoved(removedCallLog) {
	var details = "<p><i>Call log removed</i>: " + getCallLogDetails(removedCallLog) + "</p>";
	appendContent("phoneLogDetails", details);
}
function onCallLogUpdated(newCallLog, oldCallLog) {
	var details = "<p><i>Call log updated</i>: " + getCallLogDetails(newCallLog) + "</p>";
	appendContent("phoneLogDetails", details);
}
function onCallLogReset() {
	var details = "<p><i>Call Log reset</i></p>";
	appendContent("phoneLogDetails", details);
}

function displayCallDetail() {
	try {
		var calls, sb, i;
	
		if ((window.blackberry === undefined) || (blackberry.phone === undefined) || (blackberry.phone.Phone === undefined)) {
			debug.log("displayCallDetail", "blackberry.phone.Phone object is undefined.", debug.error);
			appendContent("phoneDetails", "<p><i><b>blackberry.phone.Phone</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}	
	
		// Check if active call at index specified is on hold
		calls = blackberry.phone.Phone.activeCalls();
		if (calls) {
			sb = new StringBuilder();
			sb.append("<h3>Active Calls</h3>");
			sb.append("<p>Currently in an active call? <b>" + (blackberry.phone.Phone.inActiveCall() ? "Yes" : "No") + "</b></p>");
			for (i = 0; i < calls.length; i = i + 1) {
				sb.append("<p> <b>" + calls[i].recipientName + "</b> (" + calls[i].recipientNumber + ") IsOnHold=" + calls[i].isOnHold() + ", isOutgoing=" + calls[i].outgoing + "</p>");
			}
			appendContent("phoneDetails", sb.toString());
		}
	}
	catch(e) {
		debug.log("displayCallDetail", e, debug.exception);
	}

}

function displayPhoneIdentityDetails() {
	try {
		var lineIds, sb, i;
		
		debug.log("displayPhoneIdentityDetails", "in displayPhoneIdentityDetails", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.phone === undefined) || (blackberry.phone.Phone === undefined)) {
			debug.log("displayPhoneIdentityDetails", "blackberry.phone.Phone object is undefined.", debug.error);
			appendContent("phoneDetails", "<p><i><b>blackberry.phone.Phone</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		//Returns the id of all the lines registered with the device. 
		lineIds = blackberry.phone.Phone.getLineIds();
		if ((lineIds === null) || (lineIds.length === 0)) {
			debug.log("displayPhoneIdentityDetails", "No results from getLineIds().", debug.error);
			appendContent("phoneDetails", "<p>No phone lines registered with the current device.</p>");
			return false;
		}
		
		sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>Line Id</th><th>Label</th><th>Number</th><th>Type</th></tr>");
		
		for (i = 0; i < lineIds.length; i = i + 1) {
			sb.append("<tr>");
			sb.append("<td>" + lineIds[i] + "</td>");
			sb.append("<td>" + blackberry.phone.Phone.getLineLabel(lineIds[i]) + "</td>");
			sb.append("<td>" + blackberry.phone.Phone.getLineNumber(lineIds[i]) + "</td>");
			sb.append("<td>" + blackberry.phone.Phone.getLineType(lineIds[i]) + "</td>");
			sb.append("</tr>");
		}
		
		sb.append("</table>");
		appendContent("phoneDetails", sb.toString());
	} 
	catch(e) {
		debug.log("displayPhoneIdentityDetails", e, debug.exception);
	}
}

function displayPhoneLogDetails() {
	try {
		var sb, numCalls, numMissedCalls, callLog, i;
		
		if ((window.blackberry === undefined) || (blackberry.phone === undefined) || (blackberry.phone.PhoneLogs === undefined)) {
			debug.log("displayPhoneIdentityDetails", "blackberry.phone.PhoneLogs object is undefined.", debug.error);
			appendContent("phoneLogDetails", "<p><i><b>blackberry.phone.PhoneLogs</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}
		
		sb = new StringBuilder();
		
		numCalls = blackberry.phone.PhoneLogs.numberOfCalls(blackberry.phone.PhoneLogs.FOLDER_NORMAL_CALLS);
		numMissedCalls = blackberry.phone.PhoneLogs.numberOfCalls(blackberry.phone.PhoneLogs.FOLDER_MISSED_CALLS);
		
		sb.append("<p> Calls : " + numCalls + "</p>");
		if (numCalls > 0) {
			sb.append("<ul>");
			callLog = null;
			for (i = 0; i < numCalls; i = i + 1) {
				callLog = blackberry.phone.PhoneLogs.callAt(i, blackberry.phone.PhoneLogs.FOLDER_NORMAL_CALLS);
				sb.append("<li>" + getCallLogDetails(callLog) + "</li>");
			}
			sb.append("</ul>");
		}
		
		sb.append("<p> Missed calls : " + numMissedCalls + "</p>");
		if (numMissedCalls > 0) {
			sb.append("<ul>");
			callLog = null;
			for (i = 0; i < numMissedCalls; i = i + 1) {
				callLog = blackberry.phone.PhoneLogs.callAt(i, blackberry.phone.PhoneLogs.FOLDER_MISSED_CALLS);
				sb.append("<li>" + getMissedCallLogDetails(callLog) + "</li>");
			}
			sb.append("</ul>");
		}

		
		appendContent("phoneLogDetails", sb.toString());
	} 
	catch(e) {
		debug.log("displayPhoneLogDetails", e, debug.exception);
	}
}

function setListeners() {
	try {
	
		if ((window.blackberry === undefined) || (blackberry.phone === undefined) || (blackberry.phone.PhoneLogs === undefined)) {
			debug.log("setListeners", "blackberry.phone.PhoneLogs object is undefined.", debug.error);
			appendContent("phoneLogDetails", "<p><i><b>blackberry.phone.PhoneLogs</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}
		
		var logListener = blackberry.phone.PhoneLogs.addPhoneLogListener(onCallLogAdded,  onCallLogRemoved, onCallLogUpdated, onCallLogReset);
		
	} 
	catch(e) {
		debug.log("setListeners", e, debug.exception);
	}
}


function doPageLoad() {

	setListeners();

	displayPhoneIdentityDetails();

	displayPhoneLogDetails();
}


window.addEventListener("load", doPageLoad, false);

