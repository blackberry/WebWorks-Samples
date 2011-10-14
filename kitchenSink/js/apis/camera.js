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

function onPhotoCaptured(filePath)
{
	try
	{
		debug.log("onPhotoCaptured", "Start: " + filePath, debug.info);

		//For Smartphone, add "file://" prefix before path
		if (isBlackBerrySmartphone())
		{
			filePath = "file://" + filePath;
		}
		
		var img = new Image();
		img.src = filePath
		img.width = Math.round(screen.width / 2);
		
		var div = document.createElement("div");
		div.innerHTML = filePath;

		document.getElementById("photoDetails").appendChild(div);
		document.getElementById("photoDetails").appendChild(img);
	} 
	catch(e) {
		debug.log("onPhotoCaptured", e, debug.exception);
	}
}

function onVideoCaptured(filePath)
{
	try
	{
		debug.log("onVideoCaptured", "Start: " + filePath, debug.info);
		
		//Close the camera control?
		//	blackberry.media.camera.close();
		
		var video = document.createElement('video');
		video.src = filePath
		video.controls = "controls";
		video.width = Math.round(screen.width / 2);
		
		var div = document.createElement("div");
		div.innerHTML = filePath;

		document.getElementById("videoDetails").appendChild(div);
		document.getElementById("videoDetails").appendChild(video);
	} 
	catch(e) {
		debug.log("onVideoCaptured", e, debug.exception);
	}
}

function onVideoClosed(closedEvent)
{
	debug.log("onVideoClosed", "Start: " + closedEvent, debug.info);
}
function onCameraClosed(closedEvent)
{
	debug.log("onCameraClosed", "Start: " + closedEvent, debug.info);
}

function onError(errorEvent)
{
	debug.log("onError", "onError: " + errorEvent, debug.info);
}


function takeVideo()
{
	try
	{
		debug.log("takeVideo", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined))
		{
			debug.log("takeVideo", "blackberry.media.camera object is undefined.", debug.error);
			return false;
		}
		
		debug.log("takeVideo", "calling blackberry.media.camera.takeVideo.", debug.info);
		var result = blackberry.media.camera.takeVideo(onVideoCaptured, onVideoClosed, onError);
	} 
	catch(e) {
		debug.log("takeVideo", e, debug.exception);
	}
}


function takePicture()
{
	try
	{
		debug.log("takePicture", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined))
		{
			debug.log("takePicture", "blackberry.media.camera object is undefined.", debug.error);
			return false;
		}
	
		debug.log("takePicture", "calling blackberry.media.camera.takePicture.", debug.info);
		var result = blackberry.media.camera.takePicture(onPhotoCaptured, onCameraClosed, onError);
	} 
	catch(e) {
		debug.log("takePicture", e, debug.exception);
	}
}

function doPageLoad()
{
	try 
	{
		debug.log("doPageLoad", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.media === undefined))
		{
			debug.log("doPageLoad", "blackberry.media.camera object is undefined.", debug.error);
			prependContent("photoDetails", "<p><i><b>blackberry.media.camera</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			prependContent("videoDetails", "<p><i><b>blackberry.media.camera</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		}
	}
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}


window.addEventListener("load", doPageLoad, false);