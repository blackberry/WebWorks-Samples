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

/**
 * Calculates the difference in time (milliseconds) between Now and a previously saved (global) variable
 * 
 * @returns {Number}
 */
function getDuration(start)
{
	var duration = -1;
	try 
	{
		var end = new Date();
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
function distanceBetweenPoints(current_lat, current_lon, target_lat, target_lon)
{
	var distance = 0;
	try
	{
		//Radius of the earth in meters:
		var earth_radius = 6378137;
		
		//Calculate the distance, in radians, between each of the points of latitude/longitude:
		var distance_lat = (target_lat - current_lat) * Math.PI / 180;
		var distance_lon = (target_lon - current_lon) * Math.PI / 180;

		//Using the haversine formula, calculate the distance between two points (current & target GPS coordinates) on a sphere (earth):
		//More info: http://www.movable-type.co.uk/scripts/latlong.html
		var a = Math.pow(Math.sin(distance_lat / 2), 2) + (Math.cos(current_lat * Math.PI / 180) * Math.cos(target_lat * Math.PI / 180) * Math.pow(Math.sin(distance_lon / 2), 2));
		var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
function northOrSouth(latitudeOrigin, latitudeDestination)
{
	if (latitudeOrigin < latitudeDestination)
	{
		return "N";
	} else {
		return "S";
	}
}

/**
 * Compares two points of longitude to determine their position relative to each other
 * 
 * @param longitudeOrigin - starting point to compare the destination to
 * @param longitudeDestination - target destination
 */
function eastOrWest(longitudeOrigin, longitudeDestination)
{
	if (longitudeOrigin < longitudeDestination)
	{
		return "E";
	} else {
		return "W";
	}
}



/**
 * Displays the information about the geographic location retrieved from the geolocation service.
 *
 * @param time - time when the Coordinates object was acquired
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayLocationInfo(time, coordinates)
{
	try
	{
		var lat = coordinates.latitude;
		var lon = coordinates.longitude;
		var alt = coordinates.altitude;
		var acc = coordinates.accuracy;
		var altAcc = coordinates.altitudeAccuracy;
		var head = coordinates.heading;
		var speed = coordinates.speed;

		var locationInfo = "<h3>Current Location:</h3>";
		locationInfo += "<b>Time:</b> " + new Date(time) + "<br/>";
		locationInfo += "<b>Latitude:</b> " + coordinates.latitude + "<br/>";
		locationInfo += "<b>Longitude:</b> " + coordinates.longitude + "<br/>";
		locationInfo += "<b>Altitude:</b> " + coordinates.altitude + "<br/>";
		locationInfo += "<b>Accuracy:</b> " + coordinates.accuracy + "<br/>";
		locationInfo += "<b>Altitude Accuracy:</b> " + coordinates.altitudeAccuracy + "<br/>";
		locationInfo += "<b>Heading:</b> " + coordinates.heading + "<br/>";
		locationInfo += "<b>Speed:</b> " + coordinates.speed + "<br/>";
		displayOutput("<p>" + locationInfo + "</p>");
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
function displayContentForLocation(coordinates)
{
	try
	{
		var locationSpecificContent = "<h3>Location Specific Content:</h3>";
		
		var latitude = coordinates.latitude;
		var longitude = coordinates.longitude;
		var accuracy = coordinates.accuracy;

		//If a user is within 25km of Trafalgar Square, they are assumed to be in London, England:
		//Trafalgar Square is located at (51.508315, -0.127974)
		var trafalgar = distanceBetweenPoints(latitude, longitude, 51.508315, -0.127974);
		if (trafalgar <= (accuracy + 25000))
		{
			locationSpecificContent += "<div>You are in London, England.  Be sure to visit Trafalgar Square!</div>";
		} 
		else {
			locationSpecificContent += "<div>You are " + trafalgar + " m from London, England</div>";
		}
		
		//If a user is within 4km of Deep Water Bay, they are assumed to be in Hong Kong:
		//Hong Kong is located at (22.240643, 114.184341)
		var hongKong = distanceBetweenPoints(latitude, longitude, 22.240643,114.184341);
		if (hongKong <= (accuracy + 4000))
		{
			locationSpecificContent += "<div>You are in Hong Kong.  Be sure to visit Deep Water Bay!</div>";
		}
		else {
			locationSpecificContent += "<div>You are " + hongKong + " m from Hong Kong</div>";
		}

		//If a user is within 10km of the CN Tower, they are assumed to be in Toronto:
		//CN Tower is located at (43.642722, -79.387207)
		var toronto = distanceBetweenPoints(latitude, longitude, 43.642722, -79.387207);
		if (toronto <= (accuracy + 10000))
		{
			locationSpecificContent += "<div>You are in Toronto, Canada.  Be sure to visit the CN Tower!</div>";
		}
		else {
			locationSpecificContent += "<div>You are " + toronto + " m from Toronto, Canada</div>";
		}
		
		displayOutput("<p>" + locationSpecificContent + "</p>");
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
function displayDirections(coordinates)
{
	try
	{
		var directions = "<h3>Directions:</h3>";
		
		var user_lat = coordinates.latitude;
		var user_lon = coordinates.longitude;
		
		//Niagara Falls is located at (43.08337, -79.073925)
		directions += "<div>Niagara Falls is " + northOrSouth(user_lat, 43.08337) + eastOrWest(user_lon, -79.073925) + " of your location.</div>";
		
		//The Great Pyramid is located at (29.979212, 31.134224)
		directions += "<div>The Great Pyramid is " + northOrSouth(user_lat, 29.979212) + eastOrWest(user_lon, 31.134224) + " of your location</div>";

		//The Taj Majal is located at (27.175057, 78.042068) 
		directions += "<div>The Taj Mahal is " + northOrSouth(user_lat, 27.175057) + eastOrWest(user_lon, 78.042068) + " of your location</div>";
		
		//The Golden Gate Bridge is located at (37.818463, -122.477989) 
		directions += "<div>The Golden Gate Bridge is " + northOrSouth(user_lat, 37.818463) + eastOrWest(user_lon, -122.477989) + " of your location</div>";

		//Stonehenge is located at (51.17859, -1.826134) 
		directions += "<div>Stonehenge is " + northOrSouth(user_lat, 51.17859) + eastOrWest(user_lon, -1.826134) + " of your location</div>";
		
		displayOutput("<p>" + directions + "</p>");
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
function geolocationSuccess(position) 
{
	try
	{
		displayOutput("Geolocation request took " + (getDuration(startTime) / 1000) + " seconds to respond.");
		
		// The Position object contains the following parameters:
		//	coords - geographic information such as GPS coordinates, accuracy, and optional attributes (altitude and speed).
		//  timestamp - 
		var coordinates = position.coords;
		var gpsTime = position.timestamp;
		
		//Now that we have the geographic information, what are some useful things that can be done with this info?
		
		//1) Display current GPS information:
		displayLocationInfo(gpsTime, coordinates);
		
		//2) Display content relevant to the users current location:
		//	 Identify whether a user is within range of a given location. This can be done by calculating their 
		//      distance from a known location (within an allowable threshold of accuracy).
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
function geolocationError(posError)
{
	try
	{
		displayOutput("Geolocation request took " + (getDuration(startTime) / 1000) + " seconds to respond.");
		
		if (posError)
		{
			switch(posError.code)
			{
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
function getPosition(params)
{
	try
	{
		clearOutput();
		
		//Save timestamp to measure how long it takes to get geolocation info
		startTime = new Date();		

		//First test to see that the browser supports the Geolocation API
		if (navigator.geolocation !== null)
		{
			//Configure optional parameters:
			var options;
			if (params)
			{
				displayOutput("Retrieving Geographic information using parameters: " + params + " ..." );
				options = eval("options = " + params + ";");
			} 
			else {
				// Uncomment the following line to retrieve the most accurate coordinates available
				//
				//   options = { enableHighAccuracy : true, timeout : 60000, maximumAge : 0 };
				//
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



var startTime;

/**
 * The following are helper methods used for displaying text on the screen:
 */
function clearOutput()
{
	var ele = document.getElementById("geolocationInfo");
	if (ele)
	{
		ele.innerHTML = "";
	}
}
function displayOutput(output)
{
	var ele = document.getElementById("geolocationInfo");
	if (ele)
	{
		ele.innerHTML += "<div>" + output + "</div>";
	}
}
function errorMessage(msg)
{
	displayOutput("<span class='color:red'><b>Error</b>:" + msg + "</span>");
}