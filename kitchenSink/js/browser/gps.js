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

var LOCATION_CELLSITE = 0;
var LOCATION_ASSISTED = 1;
var LOCATION_AUTONOMOUS = 2;
var curLocation = "";

function updateLocation(loc) {
	var ele = document.getElementById("currentLocation");
	ele.innerHTML = loc;
	if (ele.innerHTML !== loc) {
		//pre 4.6 browser - no support for DOM L2
		alert(loc);
	}
}
function getCoords() {
	try {
		var lat = blackberry.location.latitude;			//Latitude: Positive values indicate northern latitude; negative values indicate southern latitude
		var lon = blackberry.location.longitude;		//Longitude: Positive values indicate eastern longitude; negative values indicate western longitude.
		updateLocation('Current ' + curLocation + ' location: ' + lat + ", " + lon);
	} 
	catch(e) {
		debug.log("getCoords", e, debug.exception);
	}
}
function getLocation(aidmode) {
	try {
		if ((window.blackberry === undefined) || (blackberry.location === undefined)) {
			updateLocation('<i>The <b>blackberry.location</b> object is not supported.</i>');
			return false;
		}
	
	
		if (blackberry.location.GPSSupported) {
			updateLocation('Retrieving ' + curLocation + ' GPS Coordinates ...');
			blackberry.location.setAidMode(aidmode);		//Mechanism used to obtain the GPS location.
			blackberry.location.onLocationUpdate("getCoords()");
			blackberry.location.refreshLocation();			//Called to make ensure accurate co-ordinates are returned.
			getCoords();
		} 
		else {
			updateLocation('GPS is not supported on this device');
		}
	} 
	catch(e) {
		debug.log("getLocation", e, debug.exception);
	}
}
function getCellSite() {
	curLocation = "CellSite";
	getLocation(LOCATION_CELLSITE);
}
function getAssisted() {
	curLocation = "Assisted";
	getLocation(LOCATION_ASSISTED);
}
function getAutonomous() {
	curLocation = "Autonomous";
	getLocation(LOCATION_AUTONOMOUS);
}

//display the new location
function locationUpdated() {
	try {
		var latitude, longitude, pf, support;
		
		if ((window.blackberry === undefined) || (blackberry.location === undefined)) {
			updateLocation('<i>The <b>blackberry.location</b> object is not supported.</i>');
			return false;
		}
		
		latitude = "unknown";
		longitude = "unknown";
		curLocation = "Default";
		pf = navigator.platform;
		if (pf === "BlackBerry") {
			support = blackberry.location.GPSSupported;
			if (support) {
				//refresh the location
				blackberry.location.refreshLocation();
				latitude = blackberry.location.latitude;
				longitude = blackberry.location.longitude;
			}
		}
		updateLocation(curLocation + ' location: ' + latitude + ", " + longitude);
	} 
	catch(e) {
		debug.log("locationUpdated", e, debug.exception);
	}
}
