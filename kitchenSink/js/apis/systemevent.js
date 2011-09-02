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

function handleBatteryLevel(level)
{
	try 
	{
		debug.log("handleBatteryLevel", "Start. level=" + level, debug.info);
		
		setContent("batteryLevel", "Battery Level: " + level);
		document.getElementById("level").style.width = level + "%";

	}
	catch(e) {
		debug.log("handleBatteryLevel", e, debug.exception);
	}
}

function handleBatteryState(state)
{
	try 
	{
		debug.log("handleBatteryState", "Start. state=" + state, debug.info);
		
		var stateTxt = "";
		switch(state)
		{
			case 0:
				stateTxt = "UNKNOWN";
				break;
			case 1:
				stateTxt = "FULL";
				break;
			case 2:
				stateTxt = "CHARGING";
				break;
			case 3:
				stateTxt = "UNPLUGGED";
				break;
			default:
				stateTxt = "INVALID STATE";
		}
		setContent("batteryState", "Battery State: " + stateTxt);
		
	} 
	catch(e) {
		debug.log("handleBatteryState", e, debug.exception);
	}
}


function handleOnCoverageChange()
{
	appendContent("coveragedetails", "<p>Coverage changed to </p>");			
}

function handleBackHardwareKey()
{
	appendContent("hardwaredetails", "<p><b>Back</b> key pressed.</p>");			
}
function handleMenuHardwareKey()
{
	appendContent("hardwaredetails", "<p><b>Menu</b> key pressed.</p>");			
}
function handleVolumeUpHardwareKey()
{
	appendContent("hardwaredetails", "<p><b>Volume Up</b> key pressed.</p>");			
}
function handleVolumeDownHardwareKey()
{
	appendContent("hardwaredetails", "<p><b>Volume Down</b> key pressed.</p>");			
}

function doPageLoad()
{
	try 
	{
		debug.log("doPageLoad", "in setHandlers", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.system === undefined) || (blackberry.system.event === undefined))
		{
			debug.log("doPageLoad", "blackberry.system.event object is undefined.", debug.error);
			appendContent("details", "<p><i><b>blackberry.system.event</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			appendContent("coveragedetails", "<p><i><b>blackberry.system.event</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			appendContent("hardwaredetails", "<p><i><b>blackberry.system.event</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			hide("batteryLevelBar");
			return false;
		}

		if (blackberry.system.event.deviceBatteryLevelChange === undefined)
		{
			prependContent("details", "<p><i><b>blackberry.system.event.deviceBatteryLevelChange</b> method is not supported by this application.</i></p>");			
			hide("batteryLevelBar");
		}
		else {
			blackberry.system.event.deviceBatteryLevelChange(handleBatteryLevel);
		}

		
		if (blackberry.system.event.deviceBatteryStateChange === undefined)
		{
			prependContent("details", "<p><i><b>blackberry.system.event.deviceBatteryStateChange</b> method is not supported by this application.</i></p>");			
			hide("batteryLevelBar");
		}
		else {
			blackberry.system.event.deviceBatteryStateChange(handleBatteryState);
		}

		
		if (blackberry.system.event.onCoverageChange === undefined)
		{
			appendContent("coveragedetails", "<p><i><b>blackberry.system.event.onCoverageChange</b> method is not supported by this application.</i></p>");			
		}
		else {
			blackberry.system.event.onCoverageChange(handleOnCoverageChange);
		}

		
		if (blackberry.system.event.onHardwareKey === undefined)
		{
			appedContent("hardwaredetails", "<p><i><b>blackberry.system.event.onHardwareKey</b> method is not supported by this application.</i></p>");			
		}
		else {
			blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, handleBackHardwareKey);
			blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_MENU, handleMenuHardwareKey);
			blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_VOLUMEUP, handleVolumeUpHardwareKey);
			blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_VOLUMEDOWN, handleVolumeDownHardwareKey);
		}

	} 
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);