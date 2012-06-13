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

function playVideo() {
	try {
		var video = document.getElementById("newVidM4V");
		if (video) {
			video.play();
			console.log("Playing video " + video.src);
		}
		else {
			console.log("Unable to play video. 'myVid' element not found");
		}
	} 
	catch(e) {
		debug.log("playVideo", e, debug.exception);
	}
}
			
function onPlaying() {
	console.log("Video playing");
}
function onEnded() {
	console.log("Video ended");
}
function onError() {
	console.log("Video error");
}
function onWaiting() {
	console.log("Video waiting");
}
function onStalled() {
	console.log("Video stalled");
}

function doOnload() {
	try {
		var video = document.createElement('video');
		video.src = 'http://cdn.kaltura.org/apis/html5lib/kplayer-examples/media/bbb_trailer_iphone.m4v';
		video.controls = "controls";
		video.id = "newVidM4V";

		video.addEventListener("playing", onPlaying, false);
		video.addEventListener("ended",   onEnded,   false);
		video.addEventListener("error",   onError,   false);
		video.addEventListener("waiting", onWaiting, false);
		video.addEventListener("stalled", onStalled, false);

		document.getElementById("newVid").appendChild(video);

		//need to set any brief delay in order for the proper video events to occur.
		//event shoud be: waiting --> playing --> ended
		setTimeout(playVideo, 10);
		//If you immediately call playVideo with no delay, 
		//the events are: waiting --> playing --> stalled
		//	playVideo();

		//I suspect the reason for this behavior is a timing issue.  The DOM has not fully loaded
		//	the video element.
	} 
	catch(e) {
		debug.log("doOnload", e, debug.exception);
	}
}

window.addEventListener("load", doOnload, false);
