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

//http://dev.w3.org/geo/api/spec-source-orientation.html


function displayCurrentOrientation()
{
	if (window.orientation === undefined)
	{
		setContent("currentOrientation", "<i><b>window.orientation</b> object is undefined.  This feature is not supported by the current application.</i>");
		return false;
	}

	var msg = "";
	switch(window.orientation)
	{
		case 0:
			msg = "Top side up";
			break;
		case 90:
			msg = "Right side up";
			break;
		case -90:
			msg = "Left side up";
			break;
		case 180:
			msg = "Upside down";
			break;
	}
	msg = msg + " (" + window.orientation + "); " + ((screen.width >= screen.height) ? "Landscape" : "Portrait");
	setContent("currentOrientation", msg);	
}


function handleLoad(event)
{
	displayCurrentOrientation();
	window.addEventListener("orientationchange", displayCurrentOrientation, true);
}

window.addEventListener("load", handleLoad, true);

