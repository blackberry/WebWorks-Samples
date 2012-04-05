/**
 * Use the W3C Geolocation API to retrieve geographic information about 
 * the user's current location.
 *
 * @param params (PositionOptions) -  This is an optional parameter that 
 *        contains three attributes: enableHighAccuracy (boolean), timeout (long), 
 *        maximumAge (long).  For more information, see http://dev.w3.org/geo/api/spec-source.html#position-options
 */
function getPosition(params)
{
	try
	{
		clearOutput();
		
		//First test to verify that the browser supports the Geolocation API
		if (navigator.geolocation !== null)
		{
			//Configure optional parameters
			var options;
			if (params)
			{
				options = eval("options = " + params + ";");
			} 
			else {
				// Uncomment the following line to retrieve the most accurate coordinates available
				// options = { enableHighAccuracy : true, timeout : 60000, maximumAge : 0 };
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

/**
 * Calculates the  distance between two location coordinates.  There are various ways 
 * of implementing proximity detection.  This method uses trigonometry and the 
 * Haversine formula to calculate the distance between two points 
 * (current & target location) on a spehere (Earth).
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

		//Using the haversine formula, calculate the distance between two points (current & target coordinates) on a sphere (earth):
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
 * Displays the location information retrieved from the geolocation service.
 *
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayLocationInfo(coordinates)
{
	try
	{
		var lat = coordinates.latitude;
		var lon = coordinates.longitude;
		var alt = coordinates.altitude;
	
		var locationInfo = "<h3>My current location:</h3>";
		locationInfo += "<b>Latitude:</b> " + coordinates.latitude + "<br/>";
		locationInfo += "<b>Longitude:</b> " + coordinates.longitude + "<br/>";
		locationInfo += "<b>Altitude:</b> " + coordinates.altitude + "<br/>";
	
	    clearOutput();
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
		var locationSpecificContent = "<h3>Location-specific info:</h3>";
		
		var latitude = coordinates.latitude;
		var longitude = coordinates.longitude;
		var accuracy = coordinates.accuracy;

		//If a user is within 25km of Dallas, they are assumed to be in Dallas, USA:
		//Dallas is located at (32.802955, -96.769923)
		var dallas = distanceBetweenPoints(latitude, longitude, 32.802955, -96.769923);
		if (dallas <= (accuracy + 25000))
		{
			locationSpecificContent += "<div>You are in Dallas, Texas.</div>";
		} 
		else {
			dallas = (dallas/1000).toFixed(2);
			locationSpecificContent += "<div>You are " + dallas + " km from Dallas, Texas, USA.</div>";
		}
		
		//If a user is within 25km of Manaus, they are assumed to be in Manaus, Brazil:
		//Manaus  is located at (-3.106409, -60.026429)
		var manaus = distanceBetweenPoints(latitude, longitude, -3.106409, -60.026429);
		if (manaus <= (accuracy + 25000))
		{
			locationSpecificContent += "<div>You are in Manaus, Brazil.</div>";
		} 
		else {
			manaus = (manaus/1000).toFixed(2);
			locationSpecificContent += "<div>You are " + manaus + " km from Manaus, Brazil.</div>";
		}
		
		//If a user is within 25km of Marrakesh, they are assumed to be in Marrakesh, Morocco:
		//Marrakesh is located at (31.633333, -7.998046)
		var marrakesh = distanceBetweenPoints(latitude, longitude, 31.633333, -7.998046);
		if (marrakesh <= (accuracy + 25000))
		{
			
			locationSpecificContent += "<div>You are in Marrakesh, Morocco.</div>";
		} 
		else {
			marrakesh = (marrakesh/1000).toFixed(2);
			locationSpecificContent += "<div>You are " + marrakesh + " km from Marrakesh, Morocco.</div>";
		}
		
		displayOutput("<p>" + locationSpecificContent + "</p>");
	} 
	catch (e) {
		errorMessage("exception (displayContentForLocation): " + e);
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
		// The Position object contains the following parameters:
		//	coords - geographic information such as location coordinates, 
		//           accuracy, and optional attributes (altitude and speed).
		var coordinates = position.coords;
				
		//Now that we have the geographic information, what are some useful things that can be done with this info?
		
		//1) Display current location information:
		displayLocationInfo(coordinates);
		
		//2) Display content relevant to the users current location:
		//	 Identify whether a user is within range of a given location. This can be done by calculating their 
		//      distance from a known location (within an allowable threshold of accuracy).
		displayContentForLocation(coordinates);
		
		//3) Calculate relative direction to a point of interest
		//displayDirections(coordinates);
		
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
 * Helper methods to display text on the screen
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


