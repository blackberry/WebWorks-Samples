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

var startTime;

/**
 * The following are helper methods used for displaying text on the screen:
 */
function clearOutput() {
	setContent("geolocationInfo", "");
}
function displayOutput(output) {
	setContent("geolocationInfo", "<div>" + output + "</div>");
}
function errorMessage(msg)
{
	displayOutput("<span class='color:red'><b>Error</b>:" + msg + "</span>");
}
 
/**
 * Calculates the difference in time (milliseconds) between Now and a previously saved (global) variable
 * 
 * @returns {Number}
 */
function getDuration(start) {
	var duration = -1, end;
	try {
		end = new Date();
		duration = (end - start);
	} 
	catch (e) {
		errorMessage("Exception (getDuration): " + e);
	}
	return duration;
}

/**
 * Calculates the  distance between two GPS coordinates.  There are various ways of implementing proximity detection.  This method uses 
 * trigonometry and the Haversine formula to calculate the distance between two points (current & target location) on a spehere (Earth).
 *
 * @param current_lat - horizontal position (negative = South) of current location
 * @param current_lon - vertical position (negative = West) of current location
 * @param target_lat  - horizontal position (negative = South) of destination location
 * @param target_lat  - vertical position (negative = West) of destination location
 */
function distanceBetweenPoints(current_lat, current_lon, target_lat, target_lon) {
	var distance = 0, earth_radius, distance_lat, distance_lon, a, b;
	try {
		//Radius of the earth in meters:
		earth_radius = 6378137;
		
		//Calculate the distance, in radians, between each of the points of latitude/longitude:
		distance_lat = (target_lat - current_lat) * Math.PI / 180;
		distance_lon = (target_lon - current_lon) * Math.PI / 180;

		//Using the haversine formula, calculate the distance between two points (current & target GPS coordinates) on a sphere (earth):
		//More info: http://www.movable-type.co.uk/scripts/latlong.html
		a = Math.pow(Math.sin(distance_lat / 2), 2) + (Math.cos(current_lat * Math.PI / 180) * Math.cos(target_lat * Math.PI / 180) * Math.pow(Math.sin(distance_lon / 2), 2));
		b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		distance = Math.floor(earth_radius * b);
	} 
	catch (e) {
		errorMessage("exception (distanceBetweenPoints): " + e);
	}
	return distance;
}

/**
 * Compares two points of latitude to determine their position relative to each other
 * 
 * @param latitudeOrigin -  starting point to compare the destination to
 * @param latitudeDestination - target destination
 */
function northOrSouth(latitudeOrigin, latitudeDestination) {
	return (latitudeOrigin < latitudeDestination) ? "N" : "S";
}

/**
 * Compares two points of longitude to determine their position relative to each other
 * 
 * @param longitudeOrigin - starting point to compare the destination to
 * @param longitudeDestination - target destination
 */
function eastOrWest(longitudeOrigin, longitudeDestination) {
	return (longitudeOrigin < longitudeDestination) ? "E" : "W";
}



/**
 * Displays the information about the geographic location retrieved from the geolocation service.
 *
 * @param time - time when the Coordinates object was acquired
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayLocationInfo(time, coordinates) {
	try {
		var lat, lon, alt, acc, altAcc, head, speed, sb;
		
		lat = coordinates.latitude;
		lon = coordinates.longitude;
		alt = coordinates.altitude;
		acc = coordinates.accuracy;
		altAcc = coordinates.altitudeAccuracy;
		head = coordinates.heading;
		speed = coordinates.speed;

		sb = new StringBuilder();
		sb.append("<h3>Current Location:</h3>");
		sb.append("<b>Time:</b> " + new Date(time) + "<br/>");
		sb.append("<b>Latitude:</b> " + coordinates.latitude + "<br/>");
		sb.append("<b>Longitude:</b> " + coordinates.longitude + "<br/>");
		sb.append("<b>Altitude:</b> " + coordinates.altitude + "<br/>");
		sb.append("<b>Accuracy:</b> " + coordinates.accuracy + "<br/>");
		sb.append("<b>Altitude Accuracy:</b> " + coordinates.altitudeAccuracy + "<br/>");
		sb.append("<b>Heading:</b> " + coordinates.heading + "<br/>");
		sb.append("<b>Speed:</b> " + coordinates.speed + "<br/>");
		displayOutput("<p>" + sb.toString() + "</p>");
	} 
	catch (e) {
		errorMessage("exception (displayLocationInfo): " + e);
	}
}

/**
 * Display info about the give users proximity to three cities: Toronto, London and Hong Kong
 *
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayContentForLocation(coordinates) {
	try {
		var latitude, longitude, accuracy, sb, trafalgar, hongKong, toronto;
		
		sb = new StringBuilder();
		
		latitude = coordinates.latitude;
		longitude = coordinates.longitude;
		accuracy = coordinates.accuracy;

		sb.append("<h3>Location Specific Content:</h3>");

		//If a user is within 25km of Trafalgar Square, they are assumed to be in London, England:
		//Trafalgar Square is located at (51.508315, -0.127974)
		trafalgar = distanceBetweenPoints(latitude, longitude, 51.508315, -0.127974);
		if (trafalgar <= (accuracy + 25000)) {
			sb.append("<div>You are in London, England.  Be sure to visit Trafalgar Square!</div>");
		} 
		else {
			sb.append("<div>You are " + trafalgar + " m from London, England</div>");
		}
		
		//If a user is within 4km of Deep Water Bay, they are assumed to be in Hong Kong:
		//Hong Kong is located at (22.240643, 114.184341)
		hongKong = distanceBetweenPoints(latitude, longitude, 22.240643,114.184341);
		if (hongKong <= (accuracy + 4000)) {
			sb.append("<div>You are in Hong Kong.  Be sure to visit Deep Water Bay!</div>");
		}
		else {
			sb.append("<div>You are " + hongKong + " m from Hong Kong</div>");
		}

		//If a user is within 10km of the CN Tower, they are assumed to be in Toronto:
		//CN Tower is located at (43.642722, -79.387207)
		toronto = distanceBetweenPoints(latitude, longitude, 43.642722, -79.387207);
		if (toronto <= (accuracy + 10000)) {
			sb.append("<div>You are in Toronto, Canada.  Be sure to visit the CN Tower!</div>");
		}
		else {
			sb.append("<div>You are " + toronto + " m from Toronto, Canada</div>");
		}
		
		displayOutput("<p>" + sb.toString() + "</p>");
	} 
	catch (e) {
		errorMessage("exception (displayContentForLocation): " + e);
	}
}


/**
 * Display relative directions to five known points of interest: Great Pyramid, Taj Mahal, Niagara Falls, Golden Gate Bridge and Stonehenge
 *
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayDirections(coordinates) {
	try {
		var user_lat, user_lon, sb;
		
		sb = new StringBuilder();
		
		user_lat = coordinates.latitude;
		user_lon = coordinates.longitude;
		
		sb.append("<h3>Directions:</h3>");
		
		//Niagara Falls is located at (43.08337, -79.073925)
		sb.append("<div>Niagara Falls is " + northOrSouth(user_lat, 43.08337) + eastOrWest(user_lon, -79.073925) + " of your location.</div>");
		
		//The Great Pyramid is located at (29.979212, 31.134224)
		sb.append("<div>The Great Pyramid is " + northOrSouth(user_lat, 29.979212) + eastOrWest(user_lon, 31.134224) + " of your location</div>");

		//The Taj Majal is located at (27.175057, 78.042068) 
		sb.append("<div>The Taj Mahal is " + northOrSouth(user_lat, 27.175057) + eastOrWest(user_lon, 78.042068) + " of your location</div>");
		
		//The Golden Gate Bridge is located at (37.818463, -122.477989) 
		sb.append("<div>The Golden Gate Bridge is " + northOrSouth(user_lat, 37.818463) + eastOrWest(user_lon, -122.477989) + " of your location</div>");

		//Stonehenge is located at (51.17859, -1.826134) 
		sb.append("<div>Stonehenge is " + northOrSouth(user_lat, 51.17859) + eastOrWest(user_lon, -1.826134) + " of your location</div>");
		
		displayOutput("<p>" + sb.toString() + "</p>");
	} 
	catch (e) {
		errorMessage("exception (displayDirections): " + e);
	}
}



/**
 * Call back function used to process the Position object returned by the Geolocation service
 *
 * @params position (Position) - contains geographic information acquired by the geolocation service.
 *     http://dev.w3.org/geo/api/spec-source.html#position_interface
 */
function geolocationSuccess(position) {
	try {
		var coordinates, gpsTime;
		
		displayOutput("Geolocation request took " + (getDuration(startTime) / 1000) + " seconds to respond.");
		
		// The Position object contains the following parameters:
		//	coords - geographic information such as GPS coordinates, accuracy, and optional attributes (altitude and speed).
		//  timestamp - 
		coordinates = position.coords;
		gpsTime = position.timestamp;
		
		//Now that we have the geographic information, what are some useful things that can be done with this info?
		
		//1) Display current GPS information:
		displayLocationInfo(gpsTime, coordinates);
		
		//2) Display content relevant to the users current location:
		//   Identify whether a user is within range of a given location. This can be done by calculating their 
		//   distance from a known location (within an allowable threshold of accuracy).
		displayContentForLocation(coordinates);
		
		//3) Calculate relative direction to a point of interest
		displayDirections(coordinates);
		
	} 
	catch (e) {
		errorMessage("exception (geolocationSuccess): " + e);
	}
}

/**
 * Call back function raised by the Geolocation service when an error occurs
 *
 * @param posError (PositionError) - contains the code and message of the error that occurred while retrieving geolocation info.
 *     http://dev.w3.org/geo/api/spec-source.html#position-error
 */
function geolocationError(posError) {
	try {
		displayOutput("Geolocation request took " + (getDuration(startTime) / 1000) + " seconds to respond.");
		
		if (posError) {
			switch(posError.code) {
				case posError.TIMEOUT:
					errorMessage("TIMEOUT: " + posError.message);
					break;
				case posError.PERMISSION_DENIED:
					errorMessage("PERMISSION DENIED: " + posError.message);
					break;
				case posError.POSITION_UNAVAILABLE:
					errorMessage("POSITION UNAVAILABLE: " + posError.message);
					break;
				default:
					errorMessage("UNHANDLED MESSAGE CODE (" + posError.code + "): " + posError.message);
					break;
			}
		}
	} 
	catch (e) {
		errorMessage("Exception (geolocationError): " + e);
	}
}



/**
 * Use the geolocation service to retrieve geographic information about the user's current location.
 *
 * @param params (PositionOptions) -  http://dev.w3.org/geo/api/spec-source.html#position-options
 *      optional parameter that contains three attributes: enableHighAccuracy (boolean), timeout (long), maximumAge (long)
 *      - enableHighAccuracy (default = false) Low accuracy = cell-site (faster); High accuracy = assisted or autonomous (slower)
 *      - timeout ( default = Infinity) - the maximum length of time (in milliseconds) from the call to
 *           getCurrentPosition() or watchPosition() until the corresponding geolocationSuccess is invoked
 *      - maximumAge (default = 0) - indicates that the application is willing to accept a cached position 
 *           whose age is no greater than the specified time in milliseconds.
 */
function getPosition(fixType) {
	try {
		var options;
		
		clearOutput();
		
		//Save timestamp to measure how long it takes to get geolocation info
		startTime = new Date();		

		//First test to see that the browser supports the Geolocation API
		if (navigator.geolocation !== null) {
			//Configure optional parameters:
			if (fixType === "highAccuracy") {
				displayOutput("Retrieving Geographic information using high accuracy ..." );
				// the following line retrieves the most accurate coordinates available
				options = { enableHighAccuracy : true, timeout : 60000, maximumAge : 0 };
			} 
			else {
				displayOutput("Retrieving Geographic information using default parameters");
			}
			navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, options);
		} 
		else {
			errorMessage("HTML5 geolocation is not supported.");
		}
	} 
	catch (e) {
		errorMessage("exception (getPosition): " + e);
	}
}
