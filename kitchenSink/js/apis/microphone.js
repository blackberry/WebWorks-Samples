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

function onAudioCaptured(filePath) {
	try {
		debug.log("onAudioCaptured", filePath, debug.info);
		
		var audio = document.createElement('audio');
		audio.src = filePath;
		audio.controls = "controls";
		
		document.getElementById("recordedAudio").appendChild(audio);
	} 
	catch(e) {
		debug.log("onAudioCaptured", e, debug.exception);
	}
}


function onError(errorEvent) {
	debug.log("onError", "onError: " + errorEvent, debug.info);
}


function record() {
	try {
		debug.log("record", "Start", debug.info);		
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined)) {
			debug.log("record", "blackberry.media.microphone object is undefined.", debug.error);
			return false;
		}

		show("recordingProgress");
		var ele = document.getElementById("btnPause");
		if (ele) {
			show("recordingProgress");
			hide("recordingPaused");
			ele.innerText = "Pause";
		}
		document.getElementById("btnStart").disabled = "disabled";
		document.getElementById("btnPause").disabled = "";
		document.getElementById("btnStop").disabled = "";

		var filePath = "";
		
		if (isBlackBerryPlayBook()) {
			filePath = blackberry.io.dir.appDirs.shared.music.path;
		}
		else if (isBlackBerrySmartphone()) {
			filePath = "file:///store/home/user";
		}
		
		var result = blackberry.media.microphone.record(filePath + "/test.wav", onAudioCaptured, onError);
	} 
	catch(e) {
		debug.log("record", e, debug.exception);
	}
}

function pause() {
	try {
		debug.log("pause", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined)) {
			debug.log("pause", "blackberry.media.microphone object is undefined.", debug.error);
			return false;
		}
		
		var ele = document.getElementById("btnPause");
		if (ele) {
			if (ele.innerText === "Pause") {
				hide("recordingProgress");
				show("recordingPaused");
				ele.innerText = "Resume";
			} else {
				show("recordingProgress");
				hide("recordingPaused");
				ele.innerText = "Pause";
			}
		}
		
		var result = blackberry.media.microphone.pause();
	} 
	catch(e) {
		debug.log("pause", e, debug.exception);
	}
}
		
function stop() {
	try {
		debug.log("stop", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined)) {
			debug.log("stop", "blackberry.media.microphone object is undefined.", debug.error);
			return false;
		}
		
		hide("recordingProgress");
		hide("recordingPaused");
		document.getElementById("btnStart").disabled = "";
		document.getElementById("btnPause").disabled = "disabled";
		document.getElementById("btnStop").disabled = "disabled";

		var result = blackberry.media.microphone.stop();
	} 
	catch(e) {
		debug.log("stop", e, debug.exception);
	}
}

function displaySupportedMediaTypes() {

	try {
		var sb, i;
	
		if ((window.blackberry === undefined) || (blackberry.media === undefined) || (blackberry.media.microphone === undefined) || (blackberry.media.microphone.getSupportedMediaTypes === undefined)) {
			debug.log("displaySupportedMediaTypes", "blackberry.media.microphone.getSupportedMediaTypes() method is undefined.", debug.error);
			prependContent("mediaTypes", "<p><i><b>blackberry.media.microphone.getSupportedMediaTypes()</b> method is not supported by this application.</i></p>");
			return false;
		}
	
		var mediaTypes = blackberry.media.microphone.getSupportedMediaTypes();
		if (mediaTypes) {
			sb = new StringBuilder();
			
			sb.append("<ul>");
			for (i = 0; i < mediaTypes.length; i = i + 1) {
				sb.append("<li>" + mediaTypes[i] + "</li>");
			}
			sb.append("</ul>");

			setContent("mediaTypes", sb.toString());
		}
	}
	catch(e) {
		debug.log("displaySupportedMediaTypes", e, debug.exception);
	}
}

function doPageLoad() {
	try {
		debug.log("doPageLoad", "Start", debug.info);
		hide("recordingProgress");
		hide("recordingPaused");
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined) || (blackberry.media.microphone === undefined)) {
			debug.log("doPageLoad", "blackberry.media.microphone object is undefined.", debug.error);
			prependContent("micDetails", "<p><i><b>blackberry.media.microphone</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		}
		
		displaySupportedMediaTypes();
	}
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);