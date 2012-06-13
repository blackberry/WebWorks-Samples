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


//Global var for audio player object
var playerInstance = null;

var t = null;


function translateStateId(id) {
	switch(id) {
		case blackberry.audio.Player.TIME_UNKNOWN:
			//The requested time is unknonw
			return "TIME_UNKNOWN";
		case blackberry.audio.Player.CLOSED:
			//Player is closed
			return "CLOSED";
		case blackberry.audio.Player.UNREALIZED:
			//Player does not have the info or resources to function.
			return "UNREALIZED";
		case blackberry.audio.Player.REALIZED:
			//Player has info but not have the resources to function.
			return "REALIZED";
		case blackberry.audio.Player.PREFETCHED:
			//Player has acquired all resources needed to begin playing
			return "PREFETCHED";
		default:
			return "UNKNOWN";
	}
}
			
function translateEventId(id) {
	switch(id) {
		case blackberry.audio.Player.EVENT_BUFFERING_STARTED:
			return "EVENT_BUFFERING_STARTED";
		case blackberry.audio.Player.EVENT_BUFFERING_STOPPED:
			return "EVENT_BUFFERING_STOPPED";
		case blackberry.audio.Player.EVENT_CLOSED:
			return "EVENT_CLOSED";
		case blackberry.audio.Player.EVENT_DEVICE_AVAILABLE:
			return "EVENT_DEVICE_AVAILABLE";
		case blackberry.audio.Player.EVENT_DEVICE_UNAVAILABLE:
			return "EVENT_DEVICE_UNAVAILABLE";
		case blackberry.audio.Player.EVENT_DURATION_UPDATED:
			return "EVENT_DURATION_UPDATED";
		case blackberry.audio.Player.EVENT_END_OF_MEDIA:
			return "EVENT_END_OF_MEDIA";
		case blackberry.audio.Player.EVENT_ERROR:
			return "EVENT_ERROR";
		case blackberry.audio.Player.EVENT_RECORD_ERROR:
			return "EVENT_RECORD_ERROR";
		case blackberry.audio.Player.EVENT_RECORD_STARTED:
			return "EVENT_RECORD_STARTED";
		case blackberry.audio.Player.EVENT_RECORD_STOPPED:
			return "EVENT_RECORD_STOPPED";
		case blackberry.audio.Player.EVENT_SIZE_CHANGED:
			return "EVENT_SIZE_CHANGED";
		case blackberry.audio.Player.EVENT_STARTED:
			return "EVENT_STARTED";
		case blackberry.audio.Player.EVENT_STOPPED:
			return "EVENT_STOPPED";
		case blackberry.audio.Player.EVENT_STOPPED_AT_TIME:
			return "EVENT_STOPPED_AT_TIME";
		case blackberry.audio.Player.EVENT_VOLUME_CHANGED:
			return "EVENT_VOLUME_CHANGED";
		default:
			return "UNKNOWN";
	}
}



function showPlayerStatus(player, event, eventData) {
	try {
		var state = -1;
		var duration = -1;
		var mediaTime = -1;
		var evt = "";
		var evtData = "";
		var sb;
		
		if (player) {
			state = player.state;
			duration = player.duration;
			if (state !== blackberry.audio.Player.EVENT_CLOSED) {
				mediaTime = player.mediaTime;
			}
		} 
		else {
			state = playerInstance.state;
			duration = playerInstance.duration;
			if (state !== blackberry.audio.Player.EVENT_CLOSED)
			{
				mediaTime = playerInstance.mediaTime;
			}
		}
		
		state = translateStateId(state) + "(" + state + ")";
		
		/*
		if ((state === blackberry.audio.Player.EVENT_CLOSED) || (state === blackberry.audio.Player.EVENT_STOPPED))
		{
			clearInterval(t);
		}
		*/
		
		
		if (event) {
			evt = translateEventId(event);
		}
		
		if (eventData) {
			evtData = eventData;
		}
	
		sb = new StringBuilder();
		sb.append("<table>");
		sb.append("<tr><th>State</th><td>" + state + "</td></tr>");
		sb.append("<tr><th>Duration</th><td>" + duration + "</td></tr>");
		sb.append("<tr><th>Media Time</th><td>" + mediaTime + "</td></tr>");
		sb.append("<tr><th>Event</th><td>" + evt + "</td></tr>");
		sb.append("<tr><th>Event Data</th><td>" + evtData + "</td></tr>");
		sb.append("</table>");
		setContent("playerUpdates", sb.toString());

		if (state === blackberry.audio.Player.EVENT_STARTED) {
			debug.log("blackberry.audio.Player.EVENT_STARTED", e, debug.info);
		}
		setTimeout(showPlayerStatus, 1000);

	}
	catch (ex) {
		debug.log("showPlayerStatus", ex, debug.exception);
	}
}

// Invoked when there is an update event for the player.
function OnPlayerUpdate(player, event, eventData)  {
	try  {
		//TODO - check to see if audio finished.  Close resources.
	
		showPlayerStatus(player, event, eventData);
	}
	catch (e) {
		debug.log("onPlayerUpdate", e, debug.exception);
	}
}

function initPlayer() {
	document.getElementById("audiofile").innerHTML = "<b>../../resources/13_ThatsGood.mp3</b>";
	playerInstance = new blackberry.audio.Player("../../resources/13_ThatsGood.mp3");
	playerInstance.addPlayerListener(OnPlayerUpdate);		//Raises data about the current status of the player when events occur (duration is not an event)
}


function changeVolume(amt) {
	var maxVolume, currentVolume;
	
	if ((window.blackberry === undefined) || (blackberry.audio === undefined)) {
		debug.log("changeVolume", "blackberry.audio object is undefined.", debug.error);
		return false;
	}

	maxVolume = 100;
	if (playerInstance) {
		currentVolume = playerInstance.volumeLevel;
		if (amt < 0) { 
			if (currentVolume > 0) {
				currentVolume += amt;
			}
		}
		else {
			if (currentVolume < maxVolume) {
				currentVolume += amt;
			}
			currentVolume += amt;
		}
		playerInstance.volumeLevel = currentVolume;
		setContent("currentVolume", "Current Volume : " + currentVolume);
	}
}


function playAudio() {
	if ((window.blackberry === undefined) || (blackberry.audio === undefined)) {
		debug.log("playAudio", "blackberry.audio object is undefined.", debug.error);
		return false;
	}
	
	if (playerInstance) {
		playerInstance.play();
//				t = setInterval(showPlayerStatus, 1000);	//the player does not raise an event every N duration of time.  Use a timer interval to track the current duration of the player.
		setTimeout(showPlayerStatus, 1000);	//the player does not raise an event every N duration of time.  Use a timer interval to track the current duration of the player.
		changeVolume(0);
	} 
	else {
		initPlayer();
	}
}

function pauseAudio() {

	if ((window.blackberry === undefined) || (blackberry.audio === undefined)) {
		debug.log("pauseAudio", "blackberry.audio object is undefined.", debug.error);
		return false;
	}
	
	if (playerInstance) {
		playerInstance.pause();
	}
}

function stopAudio() {
	if ((window.blackberry === undefined) || (blackberry.audio === undefined)) {
		debug.log("stopAudio", "blackberry.audio object is undefined.", debug.error);
		return false;
	}

	if (playerInstance) {
		playerInstance.close();
		playerInstance = null;
	}
}



function doPageLoad() {
	if ((window.blackberry === undefined) || (blackberry.audio === undefined) || (blackberry.audio.Player === undefined)) {
		debug.log("doPageLoad", "blackberry.audio.Player object is undefined.", debug.error);
		prependContent("playerUpdates", "<p><i><b>blackberry.audio.Player</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");

		return false;
	}

	initPlayer();
}


window.addEventListener("load", doPageLoad, false);