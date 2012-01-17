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
//INITIALIZATION!!!
var db;
var sqlString = '';

function openDB() {
	if (db)
		return;

	if (!window.openDatabase) {
		alert("Backward compatibility not yet implemented.");
		return;
	}

	try {
		db = openDatabase("weather", "1.0", "weather", 200000);
	}
	catch(e) {		
	}
}

var lives = 2;
function initDB(database) {
	isFirstLaunch = true;

	database.transaction(createDatabase, function(/*SQLException*/ e){
		if (--lives > 0) {
			alert(e.message + "\n" + lives + " attempts remaining.");
			initDB(database);
		} else {
			alert(e.message + "\nGame over! Please insert a quarter and try again.");
			blackberry.app.exit();
		}
	});
}

//Create Database schema and tables
function createDatabase(/*Transaction*/ tx) {
	function initializeDefaultCity(tx, rs) {
		defaultCity[0] =  rs.insertId;
		defaultCity[1] =  "My Location";
		defaultCity[2] =  0;
		defaultCity[3] =  0;
		defaultCity[4] =  "";
		defaultCity[5] =  0;
		defaultCity[6] =  "";
	}

	// Create the Schema
	tx.executeSql("CREATE TABLE StationList (RowId INTEGER PRIMARY KEY ASC, latitude REAL, longitude REAL, xml_url varchar(8));", null, null, sqlFail);
	tx.executeSql("CREATE TABLE Preferences (RowId INTEGER PRIMARY KEY ASC, PrefOption varchar(100), PrefValue1 varchar(50));", null, null, sqlFail);
	tx.executeSql("CREATE TABLE FavoritesCity (RowId INTEGER PRIMARY KEY ASC, CityName varchar(255), Latitude REAL, Longitude REAL, xmlFeedURL varchar(8), LastVisited INTEGER, LastUpdated varchar(100));", null, null, sqlFail);
	tx.executeSql("CREATE TABLE ndfdData (RowId INTEGER PRIMARY KEY ASC, ForecastDate varchar(25), FavoritesCityRowId varchar(10), TabItem varchar(15), LastUpdated varchar(100), CurrTemp varchar(10), MinTemp varchar(10), MaxTemp varchar(10), PoP varchar(10), Rain varchar(10), RelativeHumidity varchar(10), Snow varchar(10), WeatherStatus varchar(100), WeatherIcon varchar(255), Wind varchar(255), WWA varchar(100), hazardTextURL varchar(255));", null, null, sqlFail);

	// Initialize the settings.
	tx.executeSql("insert into Preferences(PrefOption, PrefValue1) values ('UseMyLocation' , 0);", null, null, sqlFail);
	tx.executeSql("insert into Preferences(PrefOption, PrefValue1) values ('SevereWeather' , 1);", null, null, sqlFail);
	tx.executeSql("insert into Preferences(PrefOption, PrefValue1) values ('UnitofMeasurement' , 'Fahrenheit');", null, null, sqlFail);
	tx.executeSql("insert into Preferences(PrefOption, PrefValue1) values ('RefreshRate' , 24);", null, null, sqlFail);

	// Initialize the default city.
	tx.executeSql("insert into FavoritesCity (CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated) values ('My Location', 0, 0, '', 0, '');", null, initializeDefaultCity, sqlFail);

	// Initialize the Stations list.
	insertDefaultStations(tx);

	// Initialize the settings variables.
	prefUnitOfTemp = 'F';
	prefRefreshRate = 24;
	prefMyLocation = 0;
	prefAlertOnSevereWeather = 1;
}



function loadData(tx) {
	function loadPreferences(tx, rs) {
		for(var i = 0; i < rs.rows.length; i++) {
			var row = rs.rows.item(i);
			if (row.PrefOption == "UnitofMeasurement")
			{
				if (row.PrefValue1=='Fahrenheit')
					prefUnitOfTemp = 'F';
				else
					prefUnitOfTemp = 'C';
			}
			else if (row.PrefOption == "RefreshRate")
			{
				prefRefreshRate = row.PrefValue1; 
				interval = setInterval(collectDataInBackground, timeBetweenUpdates());
			}
			else if (row.PrefOption == "UseMyLocation")
			{
				prefMyLocation = row.PrefValue1; 
			}
			else if (row.PrefOption == "SevereWeather")
			{
				prefAlertOnSevereWeather = row.PrefValue1; 
			}
		}
	}

	function loadCities(tx, rs) {
		var rows = rs.rows;
		var j = 0;
		for(var i = 0; i < rows.length; i++) {
			var row = rows.item(i);
			if (row.LastVisited == 1)
			{
				defaultCity[0] =  row.RowId;
				defaultCity[1] =  row.CityName;
				defaultCity[2] =  row.Latitude;
				defaultCity[3] =  row.Longitude;
				defaultCity[4] =  row.xmlFeedURL;
				defaultCity[5] =  row.LastVisited;
				defaultCity[6] =  row.LastUpdated;
			}

			if(row.CityName == 'My Location')
			{
				if(prefMyLocation == 1 && row.xmlFeedURL != '')
					favoriteCities[j++] = row.RowId;
			}
			else
				favoriteCities[j++] = row.RowId;

		} // for i

		if (favoriteCities.length > 0)
		{
			activateTodayTab();		// Activate Today's Tab
			createMainMenu();		// Create Main Menu
			displayDataFromDB(tx);	// Display Weather Information
		}
		else
		{
			miActivateAddLocationTab();	// Activate Today's Tab
		}

	}

	// Load the preferences.
	tx.executeSql("SELECT PrefOption, PrefValue1 FROM Preferences;", null, loadPreferences);

	// Load Cities.
	tx.executeSql("SELECT * FROM FavoritesCity", null, loadCities);
}

//Set the timer for the initial update.
function initializeDB()
{
	try {
		openDB();

		if (!db) {
			alert("UD : Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
			blackberry.app.exit();
		}

		// Load data from the database.
		if (!isFirstLaunch) {
			db.transaction(loadData, function(/*SQLError*/ error){
				initDB(db);
			});
		}

	} catch(ex) {
		if (ex == 2)
		{
			// Version number mismatch.
			alert("Invalid database version.");
			console.log("Invalid database version.");
		}
		else
		{
			alert("Unknown error "+ex+".");
			console.log("Unknown error "+ex+".");
		}
//		blackberry.app.exit();
	}
}

//get Default City
function getDefaultCity(tx)
{
	unassignedDefaultCity();
	if (prefMyLocation == 1)
	{
		db.transaction(function(tx){getDefaultCityFromUseMyLocation(tx);}, txFail, function(){
			if (defaultCity[4] == "")
			{
				getCity();
			}
		});
	}
	else
	{
		getCity();
	}
	function getCity()
	{
		db.transaction(function(tx){getDefaultCityFromLastVisitedCity(tx);}, txFail, function(){
			if (defaultCity[4] == "")
				db.transaction(function(tx){getDefaultCityFromCityList(tx);}, txFail);
		});
	}
}

//Get current GPS Coordinates from the device.
//get GPS Coordinate codes will be here.
var myLocation = undefined;
function getFromGPSLocation()
{
	try
	{
		myLocation = undefined;
		var positionOptions = {timeout:35000, enableHighAccuracy:true};
		navigator.geolocation.getCurrentPosition(displayLocation, displayError, positionOptions);
	}
	catch(ex)
	{
		clearProgressBar();	
		errMessage = errMessage + "\n getFromGPSLocation(): " + ex ;
	}
}

/*
 * Resets Use My Location
 */
function resetUseMyLocation(){
	var element = document.getElementById("UseMyLocation");
	element.src = 'images/noSel.png';
	db.transaction(function(tx) {
		prefMyLocation = 0;
		tx.executeSql(
				"Update Preferences Set PrefValue1 = 0 where PrefOption = 'UseMyLocation';",
				null, null, sqlFail);

	}, null, function() {
		db.transaction(displayDataFromDB, txFail);
	});
}

/*
 * 
 */
function getByLatitudeLongitude() {
	try {	
		var reqServer;
		var latlng = Number(myLocation.coords.latitude) + "," + Number(myLocation.coords.longitude);
		if (handleGoogleRequest)
			reqServer = "http://maps.google.com/maps/api/geocode/xml?latlng=" + latlng + "&sensor=true";
		else
			reqServer = "http://where.yahooapis.com/geocode?q=" + latlng + "&gflags=R";

		// Assign callback function
		var request = new XMLHttpRequest();
		request.onreadystatechange = processGPSData;
		// URL for Web Method / API
		request.open("GET", reqServer, false);
		request.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
		request.setRequestHeader("Pragma", "cache");
		request.setRequestHeader("Cache-Control", "no-transform");
		request.send();
	} catch (ex) {
		clearProgressBar();
		alert("Failed to get data from the server. Please check your data connection and try again. Error Code : 115 ");
		errMessage = errMessage + "\n getByLatitudeLongitude() : " + ex;
		return null;
	}	
}

/*
 * Checks to see if current location is in the US
 * This application only provides US weather and
 * so being located outside the US, user will be unable
 * to get weather for his current location
 */
function isInUS(location) {
	var inUS = false;
	if(handleGoogleRequest){
		var componentNodes = location.getElementsByTagName("type");	
		for (var i = componentNodes.length - 1; i >= 0; i--) {
			if (componentNodes[i].childNodes[0].nodeValue == 'country') {				
				if (componentNodes[i].parentNode.nodeName == 'address_component') {			
					var parentNode = componentNodes[i].parentNode;
					if (parentNode.getElementsByTagName("short_name")[0].childNodes[0].nodeValue == 'US') {
						inUS = true;
						break;		
					}
				}
			}			
		}
	}
	else
	{
		if (location.getElementsByTagName("countrycode")[0].childNodes[0].nodeValue == 'US') {
			inUS = true;
		}
	}
	return inUS;
}

/*
 * Scans through the list of stations to find the station closest to the user
 */
function findClosestStation(results, loc) {
	// Variables declaration and initialization
	var distance;
	var minDistance= 999999;
	var xmlFeedURL='';
	
	for(var i = 0; i < results.rows.length; i++) {
		var row = results.rows.item(i);	        						
		//	calculate the nearest distance based upon latitude and longitude
		distance = getDistance(loc.coords.latitude, loc.coords.longitude, row.latitude, row.longitude);
		if (distance < minDistance) {
			xmlFeedURL = row.xml_url; // URL for XML Feed 
			minDistance = distance;
		}
	} // for i
	return xmlFeedURL;
}

/*
 * Find Weather station closest to current location and save Location
 */
function addCurrentLocation(loc) {
	// Variables declaration and initialization
	var xmlFeedURL='';
	var currentDate = new Date().toString();
	db.transaction(function(tx){
		/*
		 * Get all the stations, latitude, longitude amd xml feed url
		 * here we are assuming that we will get enough stations within the range of +/- 3 degree
		 * because we are having too many stations in the database and to pick all of them and compare the distance is not fruitful here
		 * So we are getting stations list which is near by around 3 degree, if we did not find nearest station then we will increase the criteria with +/- 3
		 */
		tx.executeSql("SELECT xml_url, latitude, longitude FROM StationList where latitude >=  ? and latitude <= ? ;", [(Number(loc.coords.latitude)-3), (Number(loc.coords.latitude)+3)],
			function(tx, results) {
				try {
					if(results.rows.length > 0) {
						xmlFeedURL = findClosestStation(results, loc);
					}
					else if(xmlFeedURL == '') {
						tx.executeSql("SELECT xml_url, latitude, longitude FROM StationList where latitude >= ? and latitude <= ? ;", [(Number(loc.coords.latitude)+4), (Number(loc.coords.latitude)-4)],
							function(tx, results) {
								if(results.rows.length > 0) {
									xmlFeedURL = findClosestStation(results, loc);
								}
								else if(xmlFeedURL == '') {
									tx.executeSql("SELECT xml_url, latitude, longitude FROM StationList;", null,
										function(tx, results) {
											if(results.rows.length > 0)	{
												xmlFeedURL = findClosestStation(results, loc);
											}
										}, sqlFail);
								}
							}, sqlFail);
					}
					tx.executeSql("Update FavoritesCity Set LastVisited = 0;", null, null, sqlFail);
					tx.executeSql("Update FavoritesCity Set Latitude = ?, Longitude = ?, xmlFeedURL = ?, LastVisited = 1, LastUpdated = ? Where CityName = 'My Location';",[loc.coords.latitude, loc.coords.longitude, xmlFeedURL, currentDate], null, sqlFail);
				} catch(ex)	{
					clearProgressBar();
					errMessage = errMessage + "\n displayLocation() : get xmlFeedURL " + ex ;
					showErrorsToDev();
				}
			}, sqlFail);						
	}, txFail, function(){
		db.transaction(function(tx){
			try {
				tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity Where CityName = 'My Location'", null,
					function(tx, results) {    			    	
						for(var i = 0; i < results.rows.length; i++) {
							var row = results.rows.item(i);
							defaultCity[0] =  row.RowId;    		    				
							defaultCity[1] =  row.CityName;
							defaultCity[2] =  row.Latitude;
							defaultCity[3] =  row.Longitude;
							defaultCity[4] =  row.xmlFeedURL;    		    				
							defaultCity[5] =  row.LastVisited;
							defaultCity[6] =  row.LastUpdated;
						} // for i
						populateFavoritesCity(tx);
						// We need to activate current tab regardless the 'My location' true or false
						insertForecastData(tx);
						// if (false) { remove city }
						// We need to populate the favorite cities regardless the 'My location' true or false
						activateTodayTab();
						createMainMenu();
						// We need to display data from the database regardless the 'My location' true or false
						displayDataFromDB(tx);
						clearProgressBar();
					}, sqlFail);
			}
			catch(ex) {
				clearProgressBar();
				errMessage = errMessage + "\n displayLocation() : defaultCity : " + ex;
				showErrorsToDev();
			}
		}, txFail);
	});	
}

/*
 * 
 */
function processGPSData() {
	if (this.readyState != 4)	
		return; // No data ready to be processed.
	try {					
		// Check for errors.
		if (this.status != 200) { 
			if (++currentTries < MAXTRIES) {
				handleGoogleRequest = !handleGoogleRequest;
				setTimeout("getByLatitudeLongitude();", 1000);
				return;
			} else { 
				currentTries = 0;
				throw "Google Request failed";
			}
		}
		// Make sure we got an XML response.
		var locationXML = this.responseXML;		
		if (!locationXML) {		
			if (++currentTries < MAXTRIES) {
				handleGoogleRequest = !handleGoogleRequest;
				setTimeout("getByLatitudeLongitude();", 1000);
				return;
			} else {
				currentTries = 0;
				throw "Bad XML Response";
			}
		}	
		if (handleGoogleRequest){
			if (locationXML.getElementsByTagName("status")[0].childNodes[0].nodeValue != "OK") {
				if (++currentTries < MAXTRIES) {
					handleGoogleRequest = !handleGoogleRequest;
					setTimeout("getByLatitudeLongitude();", 1000);
					return;
				} else {
					currentTries = 0; 
					throw "XML Status not OK";
				}
			}
		}else{ 
			if (locationXML.getElementsByTagName("Error")[0].childNodes[0].nodeValue != 0) {
				if (++currentTries < MAXTRIES) {
					handleGoogleRequest = !handleGoogleRequest;
					setTimeout("getByLatitudeLongitude();", 1000);
					return;
				} else {
					currentTries = 0; 
					throw "XML Status not OK";
				}
			}
		}
		// If not in the US then alert and reset settings
		if (!isInUS(locationXML)) {
			alert("Currently this widget supports U.S. locations only.");
			resetUseMyLocation();
			clearProgressBar();
			return null;
		}
		addCurrentLocation(myLocation);
		showErrorsToDev();
	} catch (e) {
		alert("Currently unable to lookup your location, please try again later.");
		errMessage = errMessage + "\n processGPSData() : " + e;
		showErrorsToDev();
		clearProgressBar();
	}
}

/*
 * Display Current 'My Location' Information into Main Screen
 */
function displayLocation(loc) 
{
	currentTries = 0;	
	startGPSProgress();
	myLocation = loc;
	getByLatitudeLongitude();
} 

/*
 * On Error of getting GPS Location
 */
function displayError(err) 
{ 
	if (++currentTries < MAXTRIES) {
		handleGoogleRequest = !handleGoogleRequest;
		setTimeout("getFromGPSLocation();", 200);
	}
	else {
		currentTries = 0;
		clearProgressBar();
		if (!window.google || !google.gears) {
			// 6.0 Device Message
			alert("Currently we are not able to get the GPS location from your phone. Please ensure \n1. You have proper data connectivity. \n2. Your device must have GPS options enabled. \n3. Go to Browser->Options-> and 'Enable Geolocation' should be checked. \n");
		} else {
			// 5.0 Device Message
			alert("Currently we are not able to get the GPS location from your phone. Please ensure \n1. You have proper data connectivity. \n2. Your device must have GPS options enabled. \n3. Go to Browser->Options->General Properties and 'Enable JavaScript Location Support' should be checked. \n");			
		}
	}
} 

//get the default City from the current GPS location
function getDefaultCityFromUseMyLocation(tx)
{
	unassignedDefaultCity();
	tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity Where CityName = 'My Location';", null,
			function(tx, results) 
			{
		try
		{
			for(var i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				if(row.xmlFeedURL != '')
				{
					defaultCity[0] =  row.RowId;
					defaultCity[1] =  row.CityName;
					defaultCity[2] =  row.Latitude;
					defaultCity[3] =  row.Longitude;
					defaultCity[4] =  row.xmlFeedURL;
					defaultCity[5] =  row.LastVisited;
					defaultCity[6] =  row.LastUpdated;
				}
			} // for i
		}
		catch(ex)
		{
			errMessage = errMessage + "\n getDefaultCityFromUseMyLocation() : " + ex;
		}
			}, sqlFail);
}

//get the first city from the user's preferred cities and make it as a default City 
function getDefaultCityFromCityList(tx)
{
	unassignedDefaultCity();
	tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity Where CityName != 'My Location';", null,
			function(tx, results) 
			{
		try
		{
			for(var i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				defaultCity[0] =  row.RowId;
				defaultCity[1] =  row.CityName;
				defaultCity[2] =  row.Latitude;
				defaultCity[3] =  row.Longitude;
				defaultCity[4] =  row.xmlFeedURL;
				defaultCity[5] =  row.LastVisited;
				defaultCity[6] =  row.LastUpdated;
			} // for i
		}
		catch(ex)
		{
			errMessage = errMessage + "\n getDefaultCityFromCityList() : " + ex;
		}
			}, sqlFail);
}

//get the default City from the last visited city 
function getDefaultCityFromLastVisitedCity(tx)
{
	unassignedDefaultCity();
	tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity Where LastVisited = 1;",null,
			function(tx, results) 
			{
		try
		{
			for(var i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				if (row.LastVisited == 1)
				{
					defaultCity[0] =  row.RowId;
					defaultCity[1] =  row.CityName;
					defaultCity[2] =  row.Latitude;
					defaultCity[3] =  row.Longitude;
					defaultCity[4] =  row.xmlFeedURL;
					defaultCity[5] =  row.LastVisited;
					defaultCity[6] =  row.LastUpdated;
				}
			} // for i
		}
		catch(ex)
		{
			unassignedDefaultCity();
			errMessage = errMessage + "\n getDefaultCityFromLastVisitedCity() : " + ex;
		}
			}, sqlFail);
}

/*
 * Get city information based on RowId
 */
function getDefaultCityByRowId(tx, cityId)
{
	var currentDate = new Date().toString();
	unassignedDefaultCity();
	tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity Where RowId = ?;", [cityId],
			function(tx, results) 
			{
		try
		{
			for(var i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				defaultCity[0] =  row.RowId;
				defaultCity[1] =  row.CityName;
				defaultCity[2] =  row.Latitude;
				defaultCity[3] =  row.Longitude;
				defaultCity[4] =  row.xmlFeedURL;
				defaultCity[5] =  1;
				defaultCity[6] =  currentDate;
			} // for i
		}
		catch(ex)
		{
			unassignedDefaultCity();
			errMessage = errMessage + "\n getDefaultCityByRowId() : defaultCity " + ex;
		}
			}, sqlFail);

	try
	{
		tx.executeSql("Update FavoritesCity Set LastVisited = 0;", null, null, sqlFail);
		tx.executeSql("Update FavoritesCity set LastVisited = 1, LastUpdated = ? Where RowId = ?" , [currentDate, cityId], null, sqlFail);
	}
	catch(ex)
	{
		errMessage = errMessage + "\n getDefaultCityByRowId() : updateFavoritesCity : " + ex;
	}
}

/*
 * Update FavoritesCity Array
 */
function populateFavoritesCity(tx)
{
	favoriteCities = new Array();
	var currentDate = new Date().toString();
	tx.executeSql("SELECT RowId, CityName, xmlFeedURL FROM FavoritesCity;", null,
			function(tx, results) 
			{
		try
		{
			if(results.rows.length > 0)
			{
				var j=0;
				for(var i = 0; i < results.rows.length; i++) 
				{
					var row = results.rows.item(i);
					if(row.CityName == 'My Location')
					{
						if(prefMyLocation == 1)
						{
							if(row.xmlFeedURL != '')
							{
								favoriteCities[j++] = row.RowId;
							}	
						}
					}
					else
					{
						favoriteCities[j++] = row.RowId;
					}
				} // for i
			}
		}
		catch(ex)
		{
			errMessage = errMessage + "\n populateFavoritesCity() : " + ex;
		}
			}, sqlFail);
}

/*
 * Update the last visited city, if user has deleted the last visited city, so we need to make next available city to default city,
 * We need to update the UI also if the last visited city has been deleted. 
 */
function updateLastVisitedCity(tx)
{
	var currentDate = new Date().toString();
	tx.executeSql("SELECT RowId FROM FavoritesCity Where LastVisited = 1;", null, 
			function(tx, results)
			{
		try
		{
			if( results.rows.length <= 0 ) 
			{
				tx.executeSql("SELECT RowId FROM FavoritesCity Where CityName != 'My Location';", null, 
						function(tx, results1)
						{
					if( results1.rows.length > 0 ) 
					{
						tx.executeSql("Update FavoritesCity Set LastVisited = 1 Where RowId = ?;", [results1.rows.item(0).RowId], null, sqlFail);
					}
					else
					{
						tx.executeSql("Update FavoritesCity Set LastVisited = 1 Where CityName = 'My Location';", null, null, sqlFail); 
					}
						}, sqlFail);
			}
		}
		catch(ex)
		{
			errMessage = errMessage + "\n updateLastVisitedCity() : " + ex;
		}
		getDefaultCity(tx);
			}, sqlFail);
}

/*
 * Make 'My Location' as Last Visited City 
 */
function makeMyLocationAsLastVisitedCity(tx)
{
	var currentDate = new Date().toString();
	unassignedDefaultCity();
	tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity where CityName = 'My Location';", null,
			function(tx, results)
			{
		try
		{
			for(var i = 0; i < results.rows.length; i++) 
			{
				var row = results.rows.item(i);
				defaultCity[0] =  row.RowId;
				defaultCity[1] =  row.CityName;
				defaultCity[2] =  row.Latitude;
				defaultCity[3] =  row.Longitude;
				defaultCity[4] =  row.xmlFeedURL;
				defaultCity[5] =  row.LastVisited;
				defaultCity[6] =  row.LastUpdated;
				if(row.xmlFeedURL!='')
				{
					tx.executeSql("Update FavoritesCity Set LastVisited = 0;", null, null, sqlFail);
					tx.executeSql("update FavoritesCity set LastVisited = 1, LastUpdated = ? Where RowId = ?;", [currentDate, defaultCity[0]], null, sqlFail);
				}
			} // for i
		}
		catch(ex)
		{
			unassignedDefaultCity();
			errMessage = errMessage + "\n makeMyLocationAsLastVisitedCity() : " + ex;
		}
			}, sqlFail);
}

/*
 *  Get the count of favorites Cities
 */
function countFavoriteCities()
{
	var cityCount = 0 ;
	try
	{
		db.transaction( function(tx) {
			tx.executeSql("SELECT * FROM FavoritesCity Where CityName != 'My Location';",null,
					function(tx, results) {
				cityCount = results.rows.length;
			}, sqlFail);
		}, txFail);
	}
	catch(ex)
	{
		errMessage = errMessage + "\n countFavoriteCities() : " + ex;
	}
	return cityCount;
}

function unassignedDefaultCity()
{
	defaultCity = new Array();	// Array for default city, 
	defaultCity[0] =  "";
	defaultCity[1] =  "";
	defaultCity[2] =  "";
	defaultCity[3] =  "";
	defaultCity[4] =  "";
	defaultCity[5] =  "";
	defaultCity[6] =  "";
}


//******************************************************************************************************************
//HTML5 database related stuffs
//******************************************************************************************************************

function sqlFail(tx, err) { errMessage = errMessage + "\nSQL Failed Error : " +  err.message; showErrorsToDev();}

function sqlWin(tx, response) { console.log("SQL succeeded."); }

function txFail(err) { handleMultipleSwipe = false; errMessage = errMessage + "\nTransaction Failed Error : " +  err.message; showErrorsToDev();}

function txWin() { console.log("TX succeeded."); }

function insertRecordInSameTransaction(tx, sqlString)
{
	var queryParams = [];
	tx.executeSql(sqlString, queryParams, null, sqlFail);
}

function insertRecordInSeperateTransaction(sqlString)
{
	db.transaction(
			function(tx)
			{
				var queryParams = [];
				tx.executeSql(sqlString, queryParams, null, sqlFail);
			}); 
}
//******************************************************************************************************************
