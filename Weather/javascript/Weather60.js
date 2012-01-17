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
 //variables for HttpRequest
var httpReq = new XMLHttpRequest();

//variables for user friendly error messages
var isDebugMode = false;

//variables for Error Message
var errMessage = '';

//variables for Preferences
var prefUnitOfTemp;										// User's Preferences for Unit to meassure
var prefRefreshRate;									// User's Preferences for Refresh Rate
var prefMyLocation = 0;									// User's Preferences for Use My Location
var prefAlertOnSevereWeather = 0; 						// User's Preferences for Alert on Severe

//variables for cities
var defaultCity = new Array(); 							// Array for default city,
var favoriteCities = new Array(); 						// Array for user's favorites cities, requires for swiping and navigating one city to another (Next / Previous)

//variables for Flags
var isDialogOpened = true; 								// We should display severe weather alert once
var isDOMUpdated = false;
var isFirstLaunch = false;
var isViewDirty = false; 								// Notify that whether we should prompt to Save or not
var showSevereWeatherDialog = true; 					// We should display severe weather alert once untill unless user response that alert

//variables for the Progress Bar on adding Location
var states = {
		READY:0,
		DOWNLOADING:1,
		PREPARING:2,
		GPS:3
};

//variables for retrying requests
var MAXTRIES = 2;
var currentTries = 0;

var url = null;
var progress = 0;										// Percentage of maximum time waited.
var DELAY = 250;  										// Time between progress progress updates.
var DOWNLOADMAX = 100; 									// Maximum number of progress bar updates.
var MAXPREPARE = 300; 									// Maximum number of progress bar updates.
var state = states.READY;
var timeout = 0;

//other variables
var interval = 0;
var dummy = document.createElement("span"); // table
dummy.id = "dummyspan1";
var selectedButton = 'btnToday';
var sqlString = '';

//Array for month name
var m_Names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

//***** variables & value for sending an email
var todayLastUpdated; 									// Last updated
var todayLocation; 										// City
var todayCurrentTemp;									// Current Temp.
var todayWeatherStatus;									// Weather Status
var todayHi;											// Max Temp.
var todayLow;											// Min Temp.
var todayPoP;											// Max PoP
var todayHumidity;										// Max Humidity
var todaySnow;											// Max Snow
var todayRain;											// Max Rain
var todayWind;											// Max Wind
var todayLatitude;										// Latitude
var todayLongitude;										// Longitude
var todayWWA;											// WWA (Watches, Warnings, Alerts)
var todayhazardTextURL;									// URL for more info.
//****
var divMain;
var divMenu;
var divToday;
var divSevenDays;
var divShortTerm;
var divSettings;
var divManageLocation;
var divAddLocation;
var locationlist;
var txtcityzip;
var selectedMeasureUnit;
var selectedRefreshRate;
var btnShortTerm;
var btnToday;
var btn7Days;
var severeweather;
var lblLocation;
var cityTemplate;
var cityParent;
var addCityRow;
var handleMultipleRequest = true;
var handleMultipleSwipe = true;
var handleGoogleRequest = true;

function initializeDivs() {
	// Div IDs
	addCityRow = document.getElementById('addLocationTR');
	divMain = document.getElementById('divMain');
	divMenu = document.getElementById('divMenu');
	divToday = document.getElementById('divToday');
	divSevenDays = document.getElementById('divSevenDays');
	divShortTerm = document.getElementById('divShortTerm');
	divSettings = document.getElementById('divSettings');
	divManageLocation = document.getElementById('divManageLocation');
	divAddLocation = document.getElementById('divAddLocation');

	locationlist = document.getElementById('locationlist');
	txtcityzip = document.getElementById("txtcityzip");
	selectedRefreshRate = document.getElementById('selectedRefreshRate');

	btnShortTerm = document.getElementById('btnShortTerm');
	btnToday = document.getElementById('btnToday');
	btn7Days = document.getElementById('btn7Days');
	severeweather = document.getElementById('severeweather');
	lblLocation = document.getElementById('lblLocation');

	cityTemplate = document.getElementById('cityTemplate');
	cityParent = cityTemplate.parentNode;
	cityParent.removeChild(cityTemplate);
}


//******************************************************************************************************************
//On Page Load Related functions
//******************************************************************************************************************

/*
 * Setup and Load the configurations which is required for the application
 * startup. Called when the application getting loaded
 */
function loadConfig() {
	try {
		errMessage = '';
		initializeDivs();
		initializeDB(); 						// Create Database & Tables if not exists and initialize
		resetHeight();
		// user's preferences.
		// If the application is launching very first time then we need to redirect user to Add Location screen else in Main Screen
		// Here if user is having 'My Location' true or having city at least 1 city then we should redirect them to Main Screen else Add Location Screen
	} catch (ex) {
		alert('Loading configuration failed... : Error Code : 107 ');
		errMessage = errMessage + "\n " + ex;
	}
	showErrorsToDev();
}

//On Orientation Change
window.onorientationchange = function() {
	if (divMain.offsetHeight < screen.height) {
		divMain.style.height = screen.height + 'px';
	}
};

//Reset the height of screen on load of the application.
function resetHeight() {
	try {
		if (divMain.offsetHeight < screen.height) {
			divMain.style.height = screen.height + "px";
		}
	} catch (ex) {
		errMessage = errMessage + "\n resetHeight() : " + ex;
	}
}
//******************************************************************************************************************

//******************************************************************************************************************
//Menu Items Related functions
//******************************************************************************************************************

/*
 * Create Menu Items based on the favorite cities and "Refresh" menu item.
 * Called when the application getting loaded or explicitly from adding city in
 * the Settings Section.
 */
function createMainMenu() {
	try {
		// Clear menu items if already created
		if (blackberry.ui.menu.getMenuItems().length > 0)
			blackberry.ui.menu.clearMenuItems();
		// Add items to menu
		// Create Menu from the cities available into the database
		createMenuItemsForCities();
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 10));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 11, "Send Email", miSendEmail));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 12, "Refresh", miRefresh));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 13)); // Divider
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 14, "Settings", miSettings));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 15, "Manage Locations", miManageLocation));
	} catch (ex) {
		errMessage = errMessage + "\n createMainMenu() : " + ex;
	}
}

/*
 * Create Menu Items based on the Settings menu item. Called when click on the
 * Settings menu item.
 */
function createSettingsMenu() {
	try {
		// Clear menu items if already created
		if (blackberry.ui.menu.getMenuItems().length > 0)
			blackberry.ui.menu.clearMenuItems();
		// Add items to menu
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 0));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 1, "Save", miSaveSettings));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 3)); // Divider
	} catch (ex) {
		errMessage = errMessage + "\n createSettingsMenu() : " + ex;
	}
}

/*
 * Create Menu for Add Location Screen
 */
function createAddLocationMenu() {
	try {
		// Clear menu items if already created
		if (blackberry.ui.menu.getMenuItems().length > 0)
			blackberry.ui.menu.clearMenuItems();
		// Add items to menu
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 0));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 1, "Add", miAddLocation));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 1, "Back", miCancelLocation));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 3)); // Divider
	} catch (ex) {
		errMessage = errMessage + "\n createAddLocationMenu() : " + ex;
	}
}

/*
 * Create Menu Items based on the Manage Location. Called when click on the
 * Manage Location menu item.
 */
function createManageLocationMenu() {
	try {
		// Clear menu items if already created
		if (blackberry.ui.menu.getMenuItems().length > 0)
			blackberry.ui.menu.clearMenuItems();

		// Add items to menu
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 0));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 1, "Add Location", miActivateAddLocationTab));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 2, "Delete Location", miDeleteCity));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 3, "Delete All", miDeleteAll));
		blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(true, 4)); // Divider
	} catch (ex) {
		errMessage = errMessage + "\n createManageLocationMenu() : " + ex;
	}
}

/*
 * Populate available cities in Main Menu Item (Menu->)
 */
function createMenuItemsForCities() {
	var i = 0;
	// Fetch Cities list from the preference table
	db.transaction(
			function (tx) {
				tx.executeSql("SELECT CityName FROM FavoritesCity", null,
						function (tx, results) {
					try {
						for (i = 0; i < results.rows.length; i++) {
							var row = results.rows.item(i);
							if (row.CityName == 'My Location') {
								if (prefMyLocation == 1) {
									blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, i, row.CityName, miMyLocationClicked));
									continue;
								}
							}
							switch (i) {
							case 1:
								blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, i, row.CityName, miCity0Clicked));
								break;
							case 2:
								blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, i, row.CityName, miCity1Clicked));
								break;
							case 3:
								blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, i, row.CityName, miCity2Clicked));
								break;
							case 4:
								blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, i, row.CityName, miCity3Clicked));
								break;
							case 5:
								blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, i, row.CityName, miCity4Clicked));
								break;
							}
						} // for i
					} catch (ex) {
						errMessage = errMessage + "\n createMenuItemsForCities() : " + ex;
					}
				}, sqlFail);
			}, txFail);
}

//Invoke Manage Location Screen
function miManageLocation() {
	try {
		errMessage = '';
		clearProgressBar();
		divMenu.style.display = 'none';
		divToday.style.display = 'none';
		divSevenDays.style.display = 'none';
		divShortTerm.style.display = 'none';
		divSettings.style.display = 'none';
		divManageLocation.style.display = 'block';
		divAddLocation.style.display = 'none';
		loadManageLocationScreen();
		createManageLocationMenu();
		setSelectedIndex(null);
		setFocusToElement('dummyDivManageLocation', 'addLocationTR');
	} catch (ex) {
		errMessage = errMessage + "\n miManageLocation() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Get Updated / Refreshed Data on selection of My Location. Called when the
 * dynamically generated 1st Menu Item clicked
 */
function miMyLocationClicked() {
	db.transaction( function (tx) {
		makeMyLocationAsLastVisitedCity(tx);
	}, txFail, function() {
		if (defaultCity[4] != '') {
			// Here we are sure that user have valid coordinates and we
			// are having data in database
			// so here we are going to display data which we are having
			// in database.
			db.transaction(function (tx) {
				displayDataFromDB(tx);
			}, txFail);
		} else {
			// We know that currently we are not having the current GPS
			// coordinates from the user.
			// This may be because we did not get the GPS location when
			// user tried last time.
			// So here once again we will try to get the current GPS
			// Location
			if (confirm("We do not have your GPS location. Do you want to get it now?")) {
				startGPSQueryProgress();
				getFromGPSLocation();
			}
			db.transaction(function (tx) {
				getDefaultCity(tx);
			}, txFail);
		}
	});
	showErrorsToDev();
}

/*
 * Get Updated / Refreshed Data on selection of the city. Called when the
 * dynamically generated 0th Menu Item clicked
 */
function miCity0Clicked() {
	try {
		errMessage = '';
		getNthRecord(1);
	} catch (ex) {
		errMessage = errMessage + "\n miCity0Clicked() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Get Updated / Refreshed Data on selection of the city. Called when the
 * dynamically generated 1st Menu Item clicked
 */
function miCity1Clicked() {
	try {
		errMessage = '';
		getNthRecord(2);
	} catch (ex) {
		errMessage = errMessage + "\n miCity1Clicked() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Get Updated / Refreshed Data on selection of the city. Called when the
 * dynamically generated 2nd Menu Item clicked
 */

function miCity2Clicked() {
	try {
		errMessage = '';
		getNthRecord(3);
	} catch (ex) {
		errMessage = errMessage + "\n miCity2Clicked() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Get Updated / Refreshed Data on selection of the city. Called when the
 * dynamically generated 3rd Menu Item clicked
 */
function miCity3Clicked() {
	try {
		errMessage = '';
		getNthRecord(4);
	} catch (ex) {
		errMessage = errMessage + "\n miCity3Clicked() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Get Updated / Refreshed Data on selection of the city. Called when the
 * dynamically generated 4th Menu Item clicked
 */
function miCity4Clicked() {
	try {
		errMessage = '';
		getNthRecord(5);
	} catch (ex) {
		errMessage = errMessage + "\n miCity4Clicked() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Update / Refresh Data for currently selected city. Called when the Refresh
 * Menu Item clicked
 */
function miRefresh() {
	errMessage = '';
	if (!blackberry.system.hasDataCoverage()) {
		alert("you are not in coverage, try to refresh later");
		return;
	}
	db.transaction( function (tx) {
		getDefaultCityFromLastVisitedCity(tx);
	}, txFail, function() {
		// if last visited city was 'My Location' and My Location is refreshed then we need to do other treatment for that We need to find out the current coordinates for the Device and fetch the data for that coordinates
		if (defaultCity[1] == 'My Location') {
			startGPSQueryProgress();
			getFromGPSLocation();
		} else {
			db.transaction(function (tx) {
				insertForecastData(tx);
				displayDataFromDB(tx);
			}, txFail);
		}
	});
	showErrorsToDev();
}

/*
 * Display / Hide DIVs on selection of tabs, and perform action accordingly
 * Called when user clicks on tabs Invoke Preferences settings menu item. Called
 * when the Refresh Menu Item clicked
 */
function miSettings() {
	try {		
		errMessage = '';
		clearProgressBar();
		divMenu.style.display = 'none';
		divToday.style.display = 'none';
		divSevenDays.style.display = 'none';
		divShortTerm.style.display = 'none';
		divSettings.style.display = 'block';
		divManageLocation.style.display = 'none';
		divAddLocation.style.display = 'none';
		loadSettingsScreen();
		createSettingsMenu();
		setFocusToElement('dummyDivSettings', 'Fahrenheit');
	} catch (ex) {
		errMessage = errMessage + "\n miSettings() : " + ex;
	}
	showErrorsToDev();
}

/*
 * On Cancel of Add Location Screen
 */
function miCancelLocation() {
	try {
		if (!handleMultipleRequest) {
			// The user is already adding a city so ignore this click
			return;
		}
		errMessage = '';
		setTimeout(miManageLocation); // Do this asynchronously, because the
		// cancel button on the add location
		// screen hangs the app otherwise.
	} catch (ex) {
		errMessage = errMessage + "\n miCancelLocation() : " + ex;
	}
	showErrorsToDev();
}

/*
 * Send Email with appropriate information Called when the dynamically generated
 * Send Email Menu Item clicked
 */
function miSendEmail() {
	try {
		var strMailSubject = "Weather Information";
		var strMailBody = "\nLocation : " + todayLocation;
		strMailBody = strMailBody + "\nCurrent Temperature : " + todayCurrentTemp;
		strMailBody = strMailBody + "\nWeather : " + todayWeatherStatus;
		strMailBody = strMailBody + "\nHigh : " + todayHi;
		strMailBody = strMailBody + "\nLow : " + todayLow;
		strMailBody = strMailBody + "\nWind : " + todayWind;
		strMailBody = strMailBody + "\nHumidity : " + todayHumidity;
		strMailBody = strMailBody + "\nPoP : " + todayPoP;
		strMailBody = strMailBody + "\nRain : " + todayRain;
		strMailBody = strMailBody + "\nSnow : " + todaySnow;
		strMailBody = strMailBody + "\n\n*Last Updated : " + todayLastUpdated;
		strMailBody = strMailBody + "\n\nMore Information : http://forecast.weather.gov/MapClick.php?textField1=" + todayLatitude + "&textField2=" + todayLongitude + "&e=1";

		// Launch the eMail send process with subject and body
		var emailArgs = new blackberry.invoke.MessageArguments("", strMailSubject, strMailBody);
		emailArgs.view = blackberry.invoke.MessageArguments.VIEW_NEW;
		blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES, emailArgs);
	} catch (ex) {
		alert('Composing Email failed... : Error Code : 109 ');
	}
}

/*
 * Add Location. Called when the Add Location Menu Item clicked
 */
function miActivateAddLocationTab() {
	errMessage = '';
	db.transaction( function (tx) {tx.executeSql("SELECT * FROM FavoritesCity Where CityName != 'My Location';", null, handleActivateAddLocationTab, sqlFail); }, txFail);

	function handleActivateAddLocationTab(tx, results) {
		if (results.rows.length >= 5) {
			alert("You cannot add more than 5 cities");
			return false;
		} else {
			divMenu.style.display = 'none';
			divToday.style.display = 'none';
			divSevenDays.style.display = 'none';
			divShortTerm.style.display = 'none';
			divSettings.style.display = 'none';
			divManageLocation.style.display = 'none';
			divAddLocation.style.display = 'block';
			document.getElementById("txtcityzip").focus();
			createAddLocationMenu();
			setFocusToElement('dummyDivAddLocation', 'txtcityzip');
		}
	}
	showErrorsToDev();
}

/*
 * Remove selected city from the list and from the database as well
 */
function miDeleteCity() {
	try {
		errMessage = '';
		if (selectedLocation != null) {
			var selectedCityId = selectedLocation.rowId;
			var selectedCityName = selectedLocation.cityName;

			if (confirm("Are you sure you want to delete [" + selectedCityName + "] city?") == true) {
				db.transaction(
						function (tx) {
							tx.executeSql("delete from ndfdData where FavoritesCityRowId = ?;", [ selectedCityId ], null, sqlFail);
							tx.executeSql("delete from FavoritesCity where RowId = ?;", [ selectedCityId ], null, sqlFail);
							// Update FavoritesCity Array, Since city is
							// deleted now and we should remove the city
							// from array too.
							// Add/Delete city details in FavoritesCity
							// Array, it will helpful to swipe and other
							// stuff too.
							populateFavoritesCity(tx);
							// Update Last visited city, it may possible
							// that the user has deleted the last
							// visited city, so we need to make next
							// available city to last visited city
							updateLastVisitedCity(tx);

							setFocusToElement('dummyDivManageLocation', 'addLocationTR');
						},
						txFail,
						function () {
							for ( var i = 1; i < locationlist.rows.length; i++) {
								if ("delete" + selectedCityId == locationlist.rows[i].id)
									locationlist.deleteRow(i);
							}
						});
			} else {
				return false;
			}
		} else {
			alert('Please select a city first then delete it using Menu Item');
		}
	} catch (ex) {
		errMessage = errMessage + "\n miDeleteCity() : " + ex;
	}
	showErrorsToDev();
}

/*
 * 
 */
function miDeleteAll()
{
	try {
		errMessage = '';

		if (!confirm("Are you sure you want to remove all of your locations?")) {
			return;
		}

		db.transaction(function (tx) {
			tx.executeSql("DELETE FROM FavoritesCity WHERE CityName != 'My Location'", null, null, sqlFail);
			tx.executeSql("DELETE FROM ndfdData WHERE FavoritesCityRowId != (SELECT RowId FROM FavoritesCity WHERE CityName == 'My Location')", null, null, sqlFail);
		}, function (/*SQLException*/ ex) {
			alert("Error: Failed to remove locations.");
			errMessage = errMessage + "\n miDeleteAll() : Error: Failed to remove locations : " + ex.message ;
			showErrorsToDev();
		}, function () {
			for(var i=locationlist.rows.length-1; i>0; i--)
			{
				locationlist.deleteRow(i);
			}

			db.transaction(function(tx){populateFavoritesCity(tx);updateLastVisitedCity(tx);});
		});
	} catch(e) {
		errMessage = errMessage + "\n miDeleteAll() : " + ex ;
	}
	showErrorsToDev();
}

/*
 * Start the down load progress bar.
 */
function startProgress() {
	try {	
		document.getElementById("progressBar").style.display = "block";
		progress = 0;
		state = states.DOWNLOADING;
		updateProgress();
	} catch(e) {alert(e);};
}

/*
 * Start the GPS Query fetch progress bar.
 */
function startGPSQueryProgress() {
	try {	
		document.getElementById("progressBar").style.display = "block";
		progress = 0;
		state = states.PREPARING;
		updateProgress();
	} catch(e) {alert(e);};
}

/*
 * Start the GPS fetch progress bar.
 */
function startGPSProgress() {
	try {	
		document.getElementById("progressBar").style.display = "block";
		progress = 0;
		state = states.GPS;
		updateProgress();
	} catch(e) {alert(e);};
}

/*
 * Increments the progress bar.  Checks if the download should be timed out.
 */
function updateProgress() {
	progress++;
	switch(state) {
	default: 			// states.READY
		return;
	case states.DOWNLOADING:		
		if (progress > DOWNLOADMAX) {
			handleTimeout();
			return;
		}
		timeout = window.setTimeout(updateProgress, DELAY);
		document.getElementById('progress').style.width = Math.round(100*progress/DOWNLOADMAX) + "%";
		break;
	case states.PREPARING:
		if (progress > MAXPREPARE) {
			stopTimeout();
			return;
		}
		timeout = window.setTimeout(updateProgress, DELAY);
		document.getElementById('progress').style.width = Math.round(100*progress/MAXPREPARE) + "%";
		break;
	case states.GPS:
		if (progress > DOWNLOADMAX) {
			handleGPSTimeout();
			return;
		}
		timeout = window.setTimeout(updateProgress, DELAY);
		document.getElementById('progress').style.width = Math.round(100*progress/DOWNLOADMAX) + "%";
		break;
	}	
}

/*
 * 
 */
function stopTimeOut() {
	if (timeout) {
		window.clearTimeout(timeout);  // clear the timer.
		timeout = 0;
	}
}

/*
 * Handler for when a requested city download times out.
 */
function handleTimeout() {
	alert("Timeout : Currently unable to lookup your city, please try again later.");
	handleMultipleRequest = true;
	clearProgressBar();
}

/*
 * Handler for when a request GPS times out
 */
function handleGPSTimeout() {
	alert("GPS Timeout : Currently unable to lookup your location, please try again later.");
	clearProgressBar();
}

/*
 * Reset everything after adding (or attempting to add) a feed.
 */
function clearProgressBar() {	
	document.getElementById("progressBar").style.display = "none";
	state = states.READY;
	progress = 0;
	if (timeout) {
		window.clearTimeout(timeout);  // clear the timer.
		timeout = 0;
	}
}

/*
 * Add entered location into the list and database 
 * Called in Settings Tab, when user adds favorites city
 */
function miAddLocation()
{
	try
	{
		if (!handleMultipleRequest) {
			// The user is already adding a city so ignore this click
			return;
		}
		errMessage = '';
		if (txtcityzip.value.length == 0) {
			alert("Enter valid input");
			document.getElementById("txtcityzip").focus();
			setFocusToElement('dummyDivAddLocation', 'txtcityzip');
			return;
		}

		if (!blackberry.system.hasDataCoverage()) {
			alert("you are not in coverage, try to add cities later");
			return;
		}
		if (handleMultipleRequest) {
			handleMultipleRequest = false;
			db.transaction(function (tx) {
				tx.executeSql("SELECT * FROM FavoritesCity Where CityName != ?;", [ 'My Location' ], handleCityCount, sqlFail);
			}, function (ex) {			
				handleMultipleRequest = true;
			});
		} else {
			alert('Please Wait While Your Request is Being Processed...');
		}

		function handleCityCount(tx, results) {
			if (results.rows.length >= 5) {
				alert("You cannot add more than 5 cities");
				handleMultipleRequest = true;
				return false;
			}
			startProgress();
			requestCityInfo();
		}
	} catch (ex) {
		errMessage = errMessage + "\n miAddLocation() : " + ex;
		alert("miAddLocation: " + ex);
		clearProgressBar();
		handleMultipleRequest = true;
	}
	showErrorsToDev();
}

/*
 * 
 */
function getForecastDateForNewCity() {
	db.transaction( function (tx) {
		getDefaultCityFromLastVisitedCity(tx);
	}, txFail, function() {
		db.transaction( function (tx) {
			insertForecastData(tx);
			txtcityzip.value = "";
			clearProgressBar();
			handleMultipleRequest = true;		
			if (isFirstLaunch) {
				isFirstLaunch = false;
				activateTodayTab(); // Activate Today's Tab
				createMainMenu(); // Create menu items
				displayDataFromDB(tx);// Display Info From Database
			} else {			
				showErrorsToDev();
				miManageLocation();
			}
		}, txFail);
	});
}

/*
 * Save user preferences.
 */
function miSaveSettings() {
	try {
		var exitFromTheApp = false;
		errMessage = '';
		if (isViewDirty) {
			db.transaction(
					function (tx) {
						tx.executeSql("SELECT * FROM FavoritesCity Where CityName != 'My Location';", null, handleSaveSettings, sqlFail);
					}, txFail, function () {
						db.transaction(handleExitFromApp, txFail);
					});
			
			function handleExitFromApp(tx)
			{
				if(exitFromTheApp){
					blackberry.app.exit();
				}
				else {
					activateTodayTab();
					// if No isDirty then We should display Today's Tab, with Main Menu
					// Items
					setTimeout(createMainMenu);
					displayDataFromDB(tx);
				}
			}

			function handleSaveSettings(tx, results) {
				if ((results.rows.length <= 0) && (!evaluateYesNo('UseMyLocation'))) {
					if (confirm("Are you sure you wish to exit from the application without making 'Use My Location' checked?")) {
						exitFromTheApp = true;			
						// Change to default App Icon and App Text
						changeAppIcon('sunny.jpg', 'Weather');
					} else {
						showErrorsToDev();
						return false;
					}
				}
				// We should not allow user to de-select 'Use My Location' if
				// favorites city list is empty

				if (evaluateYesNo('severeweather'))
					tx.executeSql("Update Preferences Set PrefValue1 = 1 where PrefOption='SevereWeather';", null, null, sqlFail);
				else
					tx.executeSql("Update Preferences Set PrefValue1 = 0 where PrefOption='SevereWeather';", null, null, sqlFail);

				tx.executeSql("Update Preferences Set PrefValue1=? where PrefOption = 'UnitofMeasurement';", [ selectedMeasureUnit ], null, null, sqlFail);
				if (selectedMeasureUnit == 'Fahrenheit')
					prefUnitOfTemp = 'F';
				else
					prefUnitOfTemp = 'C';

				var oldRefreshRate = prefRefreshRate;
				prefRefreshRate = parseInt(selectedRefreshRate.innerHTML.substring(0, 2), 10);
				tx.executeSql("Update Preferences Set PrefValue1 = ? where PrefOption = 'RefreshRate';", [ selectedRefreshRate.innerHTML.substring(0, 2) ], null, sqlFail);
				if (oldRefreshRate != prefRefreshRate)
					changeRefreshRate();

				if (evaluateYesNo('UseMyLocation')) {
					prefMyLocation = 1;
					tx.executeSql("Update Preferences Set PrefValue1 = 1 where PrefOption = 'UseMyLocation';", null, null, sqlFail);
					// since 'use my location' overrides, so we need to get
					// default city by getFromGPSLocation rather than last
					// visited or added city
					if (!blackberry.system.hasDataCoverage()) {
						alert("you are not in coverage, try to refresh 'My Location' later");
					} else {
						startGPSQueryProgress();
						getFromGPSLocation();
					}
				} else {
					prefMyLocation = 0;
					tx.executeSql("Update Preferences Set PrefValue1 = 0 where PrefOption = 'UseMyLocation';", null, null, sqlFail);
					tx.executeSql("Update FavoritesCity Set LastVisited = 0, Latitude = '', Longitude = '', xmlFeedURL = '' Where CityName = 'My Location';", null, null, sqlFail);
					tx.executeSql("delete from ndfdData where FavoritesCityRowId = (select RowId from FavoritesCity where CityName = 'My Location');", null, null, sqlFail);
					// We need to populate the favorite cities
					// Add/Delete city details in FavoritesCity Array, it will
					// helpfull to swipe and other stuff too.
					populateFavoritesCity(tx);
					// We need to update last visited city
					// This will make next available city to default city
					updateLastVisitedCity(tx);
					// We need to create Main Menu regardless the 'My location'
					// true or false
				}

				isViewDirty = false;
			}
		}
		else{
			activateTodayTab();
			// if No isDirty then We should display Today's Tab, with Main Menu Items
			setTimeout(createMainMenu);
		}
	} catch (ex) {
		errMessage = errMessage + "\n miSaveSettings() : " + ex;
	}
	showErrorsToDev();
}

//******************************************************************************************************************

//******************************************************************************************************************
//Tabs Activation Related functions
//******************************************************************************************************************

/*
 * Display / Hide DIVon selection of tabs, and perform action accordingly Called
 * when user clicks on tabs
 */
function doSelect(id) {
	var button = document.getElementById(id);
	if (id == 'btnToday') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = 'bottom left';
		// Reset 7Days and ShortTerm
		resetShortTermBtn();
		reset7DaysBtn();
		setFocusToElement('dummyDivMenu', 'btnToday');
	} else if (id == 'btnShortTerm') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = '-10px -39px';
		// Reset 7Days and Today
		reset7DaysBtn();
		resetTodayBtn();
		setFocusToElement('dummyDivMenu', 'btnShortTerm');
	} else if (id == 'btn7Days') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = '-10px -39px';
		// Reset ShortTerm and Today
		resetShortTermBtn();
		resetTodayBtn();
		setFocusToElement('dummyDivMenu', 'btn7Days');
	} else if (id == 'btnCancel') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = 'bottom left';
		var button1 = document.getElementById('btnAdd');
		button1.style.backgroundPosition = 'top right';
		button1.firstChild.style.backgroundPosition = 'top left';
	} else if (id == 'btnAdd') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = 'bottom left';
		var button1 = document.getElementById('btnCancel');
		button1.style.backgroundPosition = 'top right';
		button1.firstChild.style.backgroundPosition = 'top left';
	} else if (id == 'btnSave') {
		resetImages();
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = 'bottom left';
	}
}

function unSelectButtons() {
	var button1 = document.getElementById('btnAdd');
	button1.style.backgroundPosition = 'top right';
	button1.firstChild.style.backgroundPosition = 'top left';
	var button2 = document.getElementById('btnCancel');
	button2.style.backgroundPosition = 'top right';
	button2.firstChild.style.backgroundPosition = 'top left';
}

function resetShortTermBtn() {
	btnShortTerm.style.backgroundPosition = 'top right';
	btnShortTerm.firstChild.style.backgroundPosition = '-10px 0px';
}

function resetTodayBtn() {
	btnToday.style.backgroundPosition = 'top right';
	btnToday.firstChild.style.backgroundPosition = 'top left';
}

function reset7DaysBtn() {
	btn7Days.style.backgroundPosition = 'top right';
	btn7Days.firstChild.style.backgroundPosition = '-10px 0px';
}

function activateShortTermTab() {
	try {
		divMenu.style.display = 'block';
		divToday.style.display = 'none';
		divSevenDays.style.display = 'none';
		divShortTerm.style.display = 'block';
		divSettings.style.display = 'none';
		divManageLocation.style.display = 'none';
		divAddLocation.style.display = 'none';

		selectedButton = 'btnShortTerm';
		doSelect(selectedButton);
	} catch (ex) {
		errMessage = errMessage + "\n activateShortTermTab() : " + ex;
	}
}

/*
 * Display / Hide DIVon selection of tabs, and perform action accordingly Called
 * when user clicks on tabs
 */
function activate7DaysTab() {
	try {
		divMenu.style.display = 'block';
		divToday.style.display = 'none';
		divSevenDays.style.display = 'block';
		divShortTerm.style.display = 'none';
		divSettings.style.display = 'none';
		divManageLocation.style.display = 'none';
		divAddLocation.style.display = 'none';

		selectedButton = 'btn7Days';
		doSelect(selectedButton);
	} catch (ex) {
		errMessage = errMessage + "\n activate7DaysTab() : " + ex;
	}
}

/*
 * Display / Hide DIVon selection of tabs, and perform action accordingly Called
 * when user clicks on tabs
 */
function activateTodayTab() {
	try {
		divMenu.style.display = 'block';
		divToday.style.display = 'block';
		divSevenDays.style.display = 'none';
		divShortTerm.style.display = 'none';
		divSettings.style.display = 'none';
		divManageLocation.style.display = 'none';
		divAddLocation.style.display = 'none';

		selectedButton = 'btnToday';
		doSelect(selectedButton);
	} catch (ex) {
		errMessage = errMessage + "\n activateTodayTab() : " + ex;
	}
}

/*
 * To bring the style sheet and background image in original i.e. not selected
 * Called when user clicks on tabs
 */
function reset7DaysBtn() {
	try {
		btn7Days.style.backgroundPosition = 'top right';
		btn7Days.firstChild.style.backgroundPosition = '-10px 0px';
	} catch (ex) {
		errMessage = errMessage + "\n reset7DaysBtn() : " + ex;
	}
}

/*
 * To bring the style sheet and background image in original i.e. not selected
 * Called when user clicks on tabs
 */
function resetTodayBtn() {
	try {
		btnToday.style.backgroundPosition = 'top right';
		btnToday.firstChild.style.backgroundPosition = 'top left';
	} catch (ex) {
		errMessage = errMessage + "\n resetTodayBtn() : " + ex;
	}
}

/*
 * To bring the style sheet and background image in original i.e. not selected
 * Called when user clicks on tabs
 */
function resetShortTermBtn() {
	try {
		btnShortTerm.style.backgroundPosition = 'top right';
		btnShortTerm.firstChild.style.backgroundPosition = '-10px 0px';
	} catch (ex) {
		errMessage = errMessage + "\n resetShortTermBtn() : " + ex;
	}
}

function doHover(id) {
	if (blackberry.focus) {
    	if (blackberry.focus.getFocus() != id)
		return;
    }
    
	var button = document.getElementById(id);
	if (id == 'btnToday') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = 'bottom left';
		if (selectedButton != 'btnShortTerm')
			resetShortTermBtn();
		if (selectedButton != 'btn7Days')
			reset7DaysBtn();
	} else if (id == 'btnShortTerm') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = '-10px -39px';
		if (selectedButton != 'btnToday')
			resetTodayBtn();
		if (selectedButton != 'btn7Days')
			reset7DaysBtn();
	} else if (id == 'btn7Days') {
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = '-10px -39px';
		if (selectedButton != 'btnToday')
			resetTodayBtn();
		if (selectedButton != 'btnShortTerm')
			resetShortTermBtn();
	} else if (id == 'imgPreviousCity' || id == 'imgNextCity') {
		if (selectedButton != 'btnToday')
			resetTodayBtn();
		if (selectedButton != 'btnShortTerm')
			resetShortTermBtn();
		if (selectedButton != 'btn7Days')
			reset7DaysBtn();
	}
}
//******************************************************************************************************************

//*****************************************************************************************************************
//Main Page Related
//*****************************************************************************************************************

//Display Information from the database, It will fetch all the data from
//database and display to user
function displayDataFromDB(tx) {
	try {
		displayTodayScreen(tx);					// Display Info in Today's Screen
		display7DaysForecastScreen(tx);			// Display Info in 7 Days Forecast Screen
		displayShortTermScreen(tx);				// Display Info in Short Term Forecast Screen
		resetHeight();							// Reset the screen height
	} catch (ex) {
		errMessage = errMessage + "\n displayDataFromDB() : " + ex;
	}
}

//Display data in Todays Screen
function displayTodayScreen(tx) {
	var strToday = "";
	document.getElementById('currentCityRowId').value = defaultCity[0];
	tx.executeSql("SELECT FavoritesCity.RowId, FavoritesCity.CityName, FavoritesCity.Latitude, FavoritesCity.Longitude, ndfdData.* FROM FavoritesCity, ndfdData where ndfdData.TabItem='Today' and ndfdData.FavoritesCityRowId = ? and FavoritesCity.RowId = ? ", [ defaultCity[0], defaultCity[0] ],
			function (tx, results) {
		try {
			updateHeaders(defaultCity[1]);
			if (results.rows.length > 0) {
				for ( var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);

					todayLastUpdated = row.LastUpdated;
					todayLocation = row.CityName;
					if (row.CurrTemp != null)
						todayCurrentTemp = (prefUnitOfTemp == 'F' ? (row.CurrTemp + '<span class="suphilowtext">&deg;F</span>') : (f2c1(checkNull(row.CurrTemp, false)) + '<span class="suphilowtext">&deg;C</span>'));
					else
						todayCurrentTemp = '&nbsp;';
					todayWeatherStatus = checkNull(row.WeatherStatus, false);
					todayHi = (prefUnitOfTemp == 'F' ? (checkNull(row.MaxTemp, true) + '<span class="supvaluetext">&deg;F</span>'): (f2c(checkNull(row.MaxTemp, false)) + '<span class="supvaluetext">&deg;C</span>'));
					todayLow = (prefUnitOfTemp == 'F' ? (checkNull(row.MinTemp, true) + '<span class="supvaluetext">&deg;F</span>'): (f2c(checkNull(row.MinTemp, false)) + '<span class="supvaluetext">&deg;C</span>'));
					todayPoP = row.PoP;
					todayHumidity = row.RelativeHumidity;
					todaySnow = row.Snow + ' in';
					todayRain = row.Rain + ' in';
					todayWind = row.Wind;
					todayLatitude = row.Latitude;
					todayLongitude = row.Longitude;
					todayWWA = checkNull(row.WWA, false);
					todayhazardTextURL = checkNull(row.hazardTextURL, false);
					document.getElementById('lblLastUpdated').innerHTML = todayLastUpdated;

					// this will execute only once for today's screen
					if (todayWWA != null && todayWWA != "") 		// if Watches, Warnings and Alerts
					{
						strToday = "<span class='lblWarning'>&nbsp;&nbsp;" + todayWWA + " : </span><span class='WWAUrl' x-blackberry-focusable='true' onclick = invokeBrowser('" + todayhazardTextURL + "')>Click here for More Info</span>";
					}
					strToday = strToday + "<table cellpadding='2' cellspacing='4' border='0' width='100%'>";
					strToday = strToday + "<tr><td colspan='2'><span id='lblTodayWarning' style='display:none;' class='lblWarning'>warning will be here</span></td></tr>";
					strToday = strToday + "<tr><td align='center'><img  alt='" + checkNull(row.WeatherStatus, false) + "' height='110px' width='110px' src='" + row.WeatherIcon + "'></img></td><td align='center'>";
					strToday = strToday + "<table cellpadding='2' cellspacing='5' border='0' width='100%'>";
					strToday = strToday + "<tr><td class='hilowtext' align='center'>" + todayCurrentTemp + "</td></tr>";
					strToday = strToday + "<tr><td class='weatherstatus' align='center'>" + todayWeatherStatus + "</td></tr>";
					strToday = strToday + "</table></td></tr>";
					strToday = strToday + "<tr><td colspan='2'><hr noshade size='1px' width='100%' style='color: white;' ></hr><table cellpadding='2' cellspacing='5' border='0' width='100%'>";
					strToday = strToday + "<tr><td width='19%' class='lbltext'>Hi</td><td width='1%'>:</td><td width='30%' class='lblvaluetext'>" + todayHi + "</td><td width='19%' class='lbltext'>Low</td><td width='1%'>:</td><td width='30%' class='lblvaluetext'>" + todayLow + "</td></tr>";
					strToday = strToday + "<tr><td class='lbltext'>P.O.P.</td><td>:</td><td class='lblvaluetext'>" + todayPoP + " %</td><td class='lbltext'>Precip.</td><td>:</td><td class='lblvaluetext'>" + todayRain + "</td></tr>";
					strToday = strToday + "<tr><td class='lbltext'>Humidity</td><td>:</td><td class='lblvaluetext'>" + todayHumidity + " %</td><td class='lbltext'>Snow</td><td>:</td><td class='lblvaluetext'>" + todaySnow + "</td></tr>";
					strToday = strToday + "<tr><td class='lbltext'>Wind</td><td>:</td><td colspan='4' class='lblvaluetext'>" + todayWind + "</td></tr>";
					strToday = strToday + "</table><hr noshade size='1px' width='100%' style='color: white;' ></hr></td></tr>";
					strToday = strToday + "<tr><td colspan='2'>&nbsp;</td></tr></table>";

					// reformat the information for Email, since
					// currently email doesn't supports html
					// formatting.
					todayCurrentTemp = (prefUnitOfTemp == 'F' ? (checkNull( row.CurrTemp, true) + ' F') : (f2c1(checkNull(row.CurrTemp, false)) + ' C'));
					todayHi = (prefUnitOfTemp == 'F' ? (checkNull(row.MaxTemp, true) + ' F') : (f2c(checkNull(row.MaxTemp, false)) + ' C'));
					todayLow = (prefUnitOfTemp == 'F' ? (checkNull(row.MinTemp, true) + ' F') : (f2c(checkNull(row.MinTemp, false)) + ' C'));
					divToday.innerHTML = strToday;

				} // for i
			} else {
				document.getElementById('lblLastUpdated').innerHTML = '';
				strToday = "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='ShortTermHiLowText'>Data not available. Try to refresh from the menu.</td></tr></table>";
				divToday.innerHTML = strToday;
				errMessage = errMessage + "\n displayTodayScreen() : NO DATA ";
			}
		} catch (ex) {
			strToday = "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='ShortTermHiLowText'>Data not available. Try to refresh from the menu.</td></tr></table>";
			divToday.innerHTML = strToday;
			errMessage = errMessage + "\n displayTodayScreen() : " + ex;
		}
		showErrorsToDev();
	}, sqlFail);
}

//Display data in 7 Days Forecast Screen
function display7DaysForecastScreen(tx) {
	var str7Days = "";
	tx.executeSql("SELECT * FROM ndfdData where TabItem='7Days' and FavoritesCityRowId = ? ", [ defaultCity[0] ],
			function (tx, results) {
		try {
			if (results.rows.length > 0) {
				var moreInfo = "";
				str7Days = "<table width='100%' cellpadding='3' cellspacing='0'> ";
				str7Days = str7Days + "<tr><td colspan='5' class='sevendaysheadertr'><table table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td align='center' width='15%' class='smalltext'>Date </td><td align='center' width='18%' class='smalltext'>Looks</td><td width='32%' class='smalltext'>&nbsp;&nbsp;&nbsp;Max / Min</td><td align='center' width='12%' class='smalltext'>Precip.</td><td align='center' width='24%' class='smalltext'>Wind </td></tr></table></td></tr>";
				for ( var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					moreInfo = "";
					if (row.WWA != null && row.WWA != "") 		// if Watches, Warnings and Alerts
					{
						moreInfo = "<span class='lblWarning'>&nbsp;&nbsp;" + row.WWA + " : </span><span class='WWAUrl' x-blackberry-focusable='true' onclick = invokeBrowser('" + row.hazardTextURL + "')>Click here for More Info</span>";
					}
					var imgTag = '';
					if (row.WeatherIcon)
						imgTag = "<img class='WI7Days' alt='" + checkNull(row.WeatherStatus, false) + "' src='" + row.WeatherIcon + "'></img>";
					var tempStr = 'unavailable';
					if (row.MaxTemp != null || row.MinTemp)
						tempStr = (prefUnitOfTemp == 'F' ? (checkNull( row.MaxTemp, true) + '<span class="supvaluetext">&deg;F</span>') : (f2c(checkNull( row.MaxTemp, false)) + '<span class="supvaluetext">&deg;C</span>')) + ' / ' + (prefUnitOfTemp == 'F' ? (checkNull( row.MinTemp, true) + '<span class="supvaluetext">&deg;F</span>') : (f2c(checkNull( row.MinTemp, false)) + '<span class="supvaluetext">&deg;C</span>'));
					str7Days = str7Days + "<tr><td colspan='5' class='smallrowspace'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='lbltext' width='16%'>&nbsp;" + checkNull(row.ForecastDate, false) + "</td><td align='center' width='18%'>" + imgTag + "</td><td class='lblvaluetext' width='31%'>&nbsp;" + tempStr + "</td><td class='lblvaluetext' width='12%'>" + checkNull(row.PoP, true) + "%</td><td class='windvaluetext' width='24%'>" + row.Wind + "</td></tr>" + "<tr><td align='left' colspan='5'><div style='width:50%' class='smalltext7'>" + checkNull(row.WeatherStatus, false) + "</td></tr>" + "<tr><td colspan='5'>" + moreInfo + "</td></tr></table><hr noshade size='1px' width='100%' style='color: white;' ></hr></td></tr>";
				} // end for
				str7Days = str7Days + "</table>";
				divSevenDays.innerHTML = str7Days;
			} else {
				str7Days = "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='ShortTermHiLowText'>Data not available. Try to refresh from the menu.</td></tr></table>";
				divSevenDays.innerHTML = str7Days;
				errMessage = errMessage + "\n display7DaysForecastScreen() : NO DATA ";
			}
		} catch (ex) {
			str7Days = "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='ShortTermHiLowText'>Data not available. Try to refresh from the menu.</td></tr></table>";
			divSevenDays.innerHTML = str7Days;
			errMessage = errMessage + "\n display7DaysForecastScreen() : " + ex;
		}
		showErrorsToDev();
	}, sqlFail);
}

//Display data in Short Term Forecast Screen
function displayShortTermScreen(tx) {
	var strShortTerm = "";
	tx.executeSql("SELECT * FROM ndfdData where TabItem='ShortTerm' and FavoritesCityRowId = ? ", [ defaultCity[0] ],
			function (tx, results) {
		try {
			if (results.rows.length > 0) {
				var moreInfo;
				var TempF;
				strShortTerm = "<table width='100%' cellpadding='3' cellspacing='0' border='0'> ";
				for ( var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					TempF = "";
					if (checkNull(row.ForecastDate, false).indexOf('Evening') > -1 || checkNull(row.ForecastDate, false).indexOf('Night') > -1) {
						TempF = (prefUnitOfTemp == 'F' ? (checkNull(
								row.MinTemp, true) + '<span class="ShortTermSupText">&deg;F</span>') : (f2c(checkNull(row.MinTemp, false)) + '<span class="ShortTermSupText">&deg;C</span>'));
					} else {
						TempF = (prefUnitOfTemp == 'F' ? (checkNull(
								row.MaxTemp, true) + '<span class="ShortTermSupText">&deg;F</span>') : (f2c(checkNull(row.MaxTemp, false)) + '<span class="ShortTermSupText">&deg;C</span>'));
					}
					moreInfo = "";
					if (row.WWA != null && row.WWA != "") 		// if Watches, Warnings and Alerts
					{
						moreInfo = "<span class='lblWarning'>&nbsp;" + row.WWA + " : </span><span class='WWAUrl' x-blackberry-focusable='true'  onclick = invokeBrowser('" + row.hazardTextURL + "')>Click here for More Info</span>";
					}
					var imgTag = '';
					if (row.WeatherIcon)
						imgTag = "<img class='WIShortTerm' alt='" + checkNull(row.WeatherStatus, false) + "' src='" + row.WeatherIcon + "'></img>";
					strShortTerm = strShortTerm + "<tr><td colspan='2' class='smallrowspace'>" + "<table cellpadding='0' cellspacing='0' width='100%' border='0'>" + "<tr><td  width='50%'>" + "<table cellpadding='0' cellspacing='0' width='100%' border='0'>" + "<tr><td colspan='2' class='lblShortTermDateHeader'>&nbsp;" + checkNull(row.ForecastDate, false) + "</td></tr>" + "<tr><td align='center' valign='middle' width='50%'>" + imgTag + "</td><td  width='50%' class='ShortTermHiLowText'>" + TempF + "</td></tr>" + "<tr><td colspan=2 class='smalltext7'>" + checkNull(row.WeatherStatus, false) + "</td></tr>" + "</table></td>" + "<td  width='50%'>" + "<table cellpadding='0' cellspacing='0' border='0' width='100%'>" + "<tr><td class='lbltext' width='49%'>P.O.P.</td><td width='1%'>:</td><td class='lblvaluetext' width='50%'>&nbsp;" + row.PoP + " %</td></tr>" + "<tr><td class='lbltext'>Precip.</td><td>:</td><td class='lblvaluetext'>&nbsp;" + row.Rain + " in</td></tr>" + "<tr><td class='lbltext'>Humidity</td><td>:</td><td class='lblvaluetext'>&nbsp;" + row.RelativeHumidity + " %</td></tr>" + "<tr><td class='lbltext'>Wind</td><td>:</td><td class='windvaluetext'>&nbsp;" + row.Wind + "</td></tr>" + "</table></td></tr>" + "<tr><td colspan='2'>" + moreInfo + "</td></tr>" + "</table><hr noshade size='1px' width='100%' style='color: white;' ></hr></td></tr>";
				} // for i
				strShortTerm = strShortTerm + "</table>";
				divShortTerm.innerHTML = strShortTerm;
			} else {
				strShortTerm = "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='ShortTermHiLowText'>Data not available. Try to refresh from the menu.</td></tr></table>";
				divShortTerm.innerHTML = strShortTerm;
				errMessage = errMessage + "\n displayShortTermScreen() : NO DATA ";
			}
		} catch (ex) {
			strShortTerm = "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='ShortTermHiLowText'>Data not available. Try to refresh from the menu.</td></tr></table>";
			divShortTerm.innerHTML = strShortTerm;
			errMessage = errMessage + "\n displayShortTermScreen() : " + ex;
		}
		showErrorsToDev();
	}, sqlFail);
}

//******************************************************************************************************************

//******************************************************************************************************************
//Page Load Related Stuffs
//******************************************************************************************************************

/*
 * Load Settings Page
 */
function loadSettingsPage() {
	try {
		loadSettingsScreen(); // Load values from preferences into the settings Screen.
		createSettingsMenu(); // Create Menu items for Settings Screen
	} catch (ex) {
		errMessage = errMessage + "\n loadSettingsPage() : " + ex;
	}
}

//Load Manage Location Screen,
function loadManageLocationScreen() {
	db.transaction(
			function (tx) {
				var sqlStatement = "SELECT c.RowId, c.CityName, d.CurrTemp, d.PoP, d.WeatherIcon, d.FavoritesCityRowId FROM FavoritesCity AS c LEFT JOIN ndfdData AS d ON c.RowId=d.FavoritesCityRowId AND d.TabItem='Today' WHERE c.CityName!='My Location'";
				function processCities(tx, rs) {
					try {
						// Remove the old data from the display.
						for ( var i = locationlist.rows.length - 1; i > 0; i--) {
							locationlist.deleteRow(i);
						}

						var length = rs.rows.length;
						for ( var i = 0; i < length; i++) {
							var row = rs.rows.item(i);
							var cityName = row.CityName;
							var rowId = row.RowId;
							var imageURL = '';
							var strTemp = '';
							if (row.FavoritesCityRowId) {
								var temp = row.CurrTemp;
								var pop = row.PoP;
								if (temp != null)
									strTemp += ',' + (prefUnitOfTemp == 'F' ? (temp + '&deg;F') : (f2c(temp) + '&deg;C'));
								if (pop != null)
									strTemp += ', P.O.P.: ' + pop + '%';
								imageURL = row.WeatherIcon;
							}
							strTemp = strTemp.substring(1);
							addRow(cityName, rowId, strTemp, imageURL);
						}
					} catch (ex) {
						errMessage = errMessage + "\n loadManageLocationScreen() : " + ex;
					}
				}
				tx.executeSql(sqlStatement, null, processCities, sqlFail);
			}, txFail);
}
/*
 * Load Settings DIV, populate existing information and sets for user input
 * Called when user clicks on Settings Tab,
 */
function loadSettingsScreen() {
	db.transaction(
			function (tx) {
				tx.executeSql("SELECT RowId, PrefOption, PrefValue1 FROM Preferences;", null,
						function (tx, results) {
					try {
						for ( var i = 0; i < results.rows.length; i++) {
							var row = results.rows.item(i);
							if (row.PrefOption == "UseMyLocation") {
								var element = document.getElementById('UseMyLocation');
								if (row.PrefValue1 != null && row.PrefValue1 != 0) {
									element.src = 'images/yes.png';
								} else {
									element.src = 'images/no.png';
								}
							}
							if (row.PrefOption == "SevereWeather") {
								if (row.PrefValue1 != null && row.PrefValue1 != 0) {
									severeweather.src = 'images/yes.png';
								} else {
									severeweather.src = 'images/no.png';
								}
							}
							if (row.PrefOption == "UnitofMeasurement") {
								selectedMeasureUnit = row.PrefValue1;
								document.getElementById(selectedMeasureUnit).checked = true;
							}
							if (row.PrefOption == "RefreshRate") {
								selectedRefreshRate.innerHTML = row.PrefValue1 + ' hours';
							}
						} // for i
					} catch (ex) {
						errMessage = errMessage + "\n loadSettingsScreen() : " + ex;
					}
				}, sqlFail);
			}, txFail);
}

//******************************************************************************************************************

//******************************************************************************************************************
//Miscellaneous Functions
//******************************************************************************************************************

/*
 * Get nth record from the database, because in Gears there is no method by
 * which we can get nth record from the recordset Called when the dynamically
 * generated n Menu Item clicked
 */
function getNthRecord(/* integer */n) {
	var currentDate = new Date().toString();
	unassignedDefaultCity();
	db.transaction(
			function (tx) {
				tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity;", null,
						function (tx, results) {
					try {
						var row = results.rows.item(n);
						defaultCity[0] = row.RowId;
						defaultCity[1] = row.CityName;
						defaultCity[2] = row.Latitude;
						defaultCity[3] = row.Longitude;
						defaultCity[4] = row.xmlFeedURL;
						defaultCity[5] = row.LastVisited;
						defaultCity[6] = row.LastUpdated;
						tx.executeSql("update FavoritesCity set LastVisited = 0;", null, null, sqlFail);
						tx.executeSql("update FavoritesCity set LastVisited = 1, LastUpdated = ? Where RowId = ?;", [ currentDate, defaultCity[0] ], null, sqlFail);
						displayDataFromDB(tx);
					} catch (ex) {
						unassignedDefaultCity();
						errMessage = errMessage + "\n getNthRecord() : defaultCity : " + ex;
					}
				}, sqlFail);
			}, txFail);
}

/*
 * Calculate the nearest distance based upon latitude and longitude Called when
 * application getting loaded / when Today Screen of the widget loaded.
 */
function getDistance(/* float */latitude1, /* float */longitude1, /* float */ latitude2, /* float */longitude2) {
	var returnValue = 0;
	try {
		var EarthRadius = 6378.16; 			// in kms
		var radLat1 = toRadians(latitude1);
		var radLon1 = toRadians(longitude1);
		var radLat2 = toRadians(latitude2);
		var radLon2 = toRadians(longitude2);
		returnValue = Math.acos((Math.sin(radLat1) * Math.sin(radLat2)) + (Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radLon2 - radLon1))) * EarthRadius;
	} catch (ex) {
		errMessage = errMessage + "\n getDistance() : " + ex;
	}
	return returnValue;
}

/*
 * Convert / Calculate degree in Radians Called when application getting loaded /
 * when Today Screen of the widget loaded.
 */
function toRadians(/* integer */degrees) {
	try {
		var returnValue = 0;
		returnValue = (degrees * Math.PI) / 180;
	} catch (ex) {
		errMessage = errMessage + "\n ToRadians() : " + ex;
	}
	return returnValue;
}

//Convert temperature into degree Celcius without decimal point
function f2c(/* Float */fahrenheit) {
	try {
		if (fahrenheit != null && fahrenheit != '') {
			return Math.round(5 / 9 * (fahrenheit - 32));
		} else {
			return '';
		}
	} catch (ex) {
		errMessage = errMessage + "\n f2c() : " + ex;
	}
}

//Convert temperature into degree Celcius with 1 decimal point precision
function f2c1(/* Float */fahrenheit) {
	try {
		if (fahrenheit != null && fahrenheit != '') {
			return (5 / 9 * (fahrenheit - 32)).toFixed(1);
		} else {
			return '';
		}
	} catch (ex) {
		errMessage = errMessage + "\n f2c1() : " + ex;
	}
}

//Get wind direction based upon degree.
function getWindDirection(/* integer */degree) {
	try {
		var direction = "";
		switch (true) {
		case (degree >= 22.5 && degree < 67.5):
			direction = "NE";
		break;
		case (degree >= 67.5 && degree < 112.5):
			direction = "E";
		break;
		case (degree >= 112.5 && degree < 157.5):
			direction = "SE";
		break;
		case (degree >= 157.5 && degree < 202.5):
			direction = "S";
		break;
		case (degree >= 202.5 && degree < 247.5):
			direction = "SW";
		break;
		case (degree >= 247.5 && degree < 292.5):
			direction = "W";
		break;
		case (degree >= 292.5 && degree < 337.5):
			direction = "NW";
		break;
		case (degree >= 337.5 && degree <= 360 || degree > 0 && degree < 22.5):
			direction = "N";
		break;
		}
	} catch (ex) {
		errMessage = errMessage + "\n getWindDirection() : " + ex;
	}
	return direction;
}

//get the string value from the childnodes,
//returns "" if no childnode found
function getStrNodeValues(/* xml Element */elmnt) {
	var returnValue = "";
	try {
		if (elmnt.length > 0)
			if (elmnt[0].childNodes.length > 0)
				returnValue = elmnt[0].childNodes[0].nodeValue;
	} catch (ex) {
		errMessage = errMessage + "\n getStrNodeValues() : " + ex;
	}
	return returnValue;
}

//get the integer value from the childnodes
//returns 0 if no childnode found
function getIntNodeValues(/* xml Element */elmnt) {
	var returnValue = Number.NaN;
	try {
		if (elmnt.length > 0)
			if (elmnt[0].childNodes.length > 0)
				returnValue = elmnt[0].childNodes[0].nodeValue;
	} catch (ex) {
		errMessage = errMessage + "\n getIntNodeValues() : " + ex;
	}
	return returnValue;
}

//get the string value from the childnodes,
//returns "" if no childnode found
function getStrNodeValues1(/* xml Element */elmnt) {
	var returnValue = "";
	try {
		if (elmnt.childNodes.length > 0)
			returnValue = elmnt.childNodes[0].nodeValue;
	} catch (ex) {
		errMessage = errMessage + "\n getStrNodeValues1() : " + ex;
	}
	return returnValue;
}

//get the integer value from the childnodes
//returns 0 if no childnode found
function getIntNodeValues1(/* xml Element */elmnt) {
	var returnValue = Number.NaN;
	try {
		if (elmnt.childNodes.length > 0)
			returnValue = elmnt.childNodes[0].nodeValue;
	} catch (ex) {
		errMessage = errMessage + "\n getIntNodeValues1() : " + ex;
	}
	return returnValue;
}

//Update Location and Last updated date time once in header
function updateHeaders(/* string */location) {
	try {
		if (location.length > 22) {
			lblLocation.innerHTML = location.substring(0, 22) + '...';
		} else {
			lblLocation.innerHTML = location;
		}
		if (favoriteCities.length > 1) {
			document.getElementById('imgPreviousCity').style.display = 'block';
			document.getElementById('imgNextCity').style.display = 'block';
		} else {
			document.getElementById('imgPreviousCity').style.display = 'none';
			document.getElementById('imgNextCity').style.display = 'none';
		}
	} catch (ex) {
		errMessage = errMessage + "\n updateHeaders() : " + ex;
	}
}

/*
 * Fill empty string or NaN for remaining elements of the 2D array
 */
function fillArray2(/* Array */arr, /* Integer */maxlength, /* DataType */type) {
	try {
		for ( var i = arr.length; i < maxlength; i++) {
			if (type == 'number') {
				arr[i] = [ "", Number.NaN ];
			} else {
				arr[i] = [ "", "" ];
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n fillArray2() : " + ex;
	}
	return arr;
}

/*
 * Fill empty string or NaN for remaining elements of the 3D array
 */
function fillArray3(/* Array */arr, /* Integer */maxlength, /* DataType */type) {
	try {
		for ( var i = arr.length; i < maxlength; i++) {
			if (type == 'number') {
				arr[i] = [ "", Number.NaN, Number.NaN ];
			} else {
				arr[i] = [ "", "", "" ];
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n fillArray3() : " + ex;
	}
	return arr;
}

/*
 * Format Dates , "DD MMM" like format
 */
function formatDate(/* String */strDate) {
	var returnValue = '';
	try {
		returnValue = m_Names[parseInt(strDate.substring(5, 7), 10) - 1] + ' ' + strDate.substring(8, 10);
	} catch (ex) {
		errMessage = errMessage + "\n formatDate() : " + ex;
	}
	return returnValue;
}

/*
 * Get the file name from the URL
 */
function getFileName(/* String */url) {
	try {
		if (url != null) {
			var lastSlash = url.lastIndexOf("/");
			if (lastSlash > 0)
				url = url.substring(lastSlash + 1);
		} else {
			url = '';
		}
	} catch (ex) {
		errMessage = errMessage + "\n getFileName() : " + ex;
	}
	return url;
}

/*
 * Opens a URL in the browser.
 * 
 * url: String - The URL to be opened.
 */
function invokeBrowser(/* String */url) {
	try {
		var args = new blackberry.invoke.BrowserArguments(url);
		blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
	} catch (ex) {
		errMessage = errMessage + "\n invokeBrowser() : " + ex;
	}
}

/*
 * Generate a popup for asking user's response on Refresh Rate option
 * (Menu->Settings->Refresh Rate)
 */
function openRefreshRateDialog() {
	try {
		ddlDoSelect('refreshRate');
		var selectedValue = 0;
		isViewDirty = true;

		var elementText = document.getElementById("selectedRefreshRate").innerHTML;
		if (elementText == "2 hours")
			selectedValue = 0;
		else if (elementText == "6 hours")
			selectedValue = 1;
		else if (elementText == "12 hours")
			selectedValue = 2;
		else if (elementText == "24 hours")
			selectedValue = 3;
		else
			selectedValue = 0;

		var arrRefreshRates = new Array();
		arrRefreshRates[0] = "2 hours";
		arrRefreshRates[1] = "6 hours";
		arrRefreshRates[2] = "12 hours";
		arrRefreshRates[3] = "24 hours";

		// Open the spin dialog
        showSpinnerDialog("Select a refresh interval :", arrRefreshRates, selectedValue, 
            function (refreshRateChoice) {
                if (refreshRateChoice != undefined) {
                    document.getElementById("selectedRefreshRate").innerHTML = arrRefreshRates[refreshRateChoice];
                } else {
                    document.getElementById("selectedRefreshRate").innerHTML = arrRefreshRates[selectedValue];
                }
            }
        );
		
	} catch (ex) {
		errMessage = errMessage + "\n openRefreshRateDialog() : " + ex;
	}
}

/*
 * Since we need to delete a city from Menu option, but we dont know which city
 * is currently selected So we have created this method which will track on
 * "onmouseover" event of the city Here we are just assigning the selected city,
 * this is useful for miDeleteCity() method
 */
var selectedLocation = null;
function setSelectedIndex(/* HTML Element */selection) {
	try {	
		if (selectedLocation == selection)
			return;
		setSelectedCity(selection);
		selectedLocation = selection;
		 
		//Removed because causing an issue with focus moving by itself between items.
		/*
		if (blackberry.focus) {
			if(selection){
				setFocusToElement('dummyDivManageLocation', selection.id);
			}
			else{
				setFocusToElement('dummyDivManageLocation', 'addLocationTR');
			}
		}
		*/
	} catch (ex) {
		errMessage = errMessage + "\n setSelectedIndex() : " + ex;
	}
}

function setSelectedCity(/* HTML Element */selection) {
	// First clear last city
	if (selectedLocation) {
		selectedLocation.setAttribute("class", "CityListRow");
	}
	if (selection) {
		// Now mark current City
		selection.setAttribute("class", "SelectedCityListRow");
		// Reset addRow to cityListRow
		addCityRow.setAttribute("class", "CityListRow");
	} else {
		// Mark Add City
		addCityRow.setAttribute("class", "SelectedCityListRow");
	}
}

/*
 * Set focus on desired element, parentDiv : We should pass the id for parent
 * div on which are are going to add/remove a dummy element , so DOM will
 * re-index the elements elemntId : On which element do we wants to focus
 */
function setFocusToElement(/* string */parentDiv, /* string */elemntId) {
	if (blackberry.focus) {
		try {
			var elmnt = document.getElementById(parentDiv);
			elmnt.appendChild(dummy); 		// Adding a dummy element
			elmnt.removeChild(dummy); 		// Removing the dummy element
		} catch (e) {
			alert(e);
		}
		try {
			blackberry.focus.setFocus(elemntId);
			if (blackberry.focus.getFocus() != elemntId) {
				setTimeout("setFocusToElement('" + parentDiv + "','" + elemntId + "');", 1000);
			}
		} catch (ex) {
			if (blackberry.focus.getFocus() != elemntId) {
				setTimeout("setFocusToElement('" + parentDiv + "','" + elemntId + "');", 1000);
			}
		}
	}
}

/*
 * Check Null, if null then return empty string
 */
function checkNull(/* string or null */val, isround) {
	try {
		if (val != null) {
			if (isround)
				return Math.round(val);
			else
				return val;
		} else {
			return '';
		}
	} catch (ex) {
		errMessage = errMessage + "\n checkNull() : " + ex;
	}
}

//******************************************************************************************************************

//******************************************************************************************************************
//Swiping Realted Functions
//******************************************************************************************************************

//Swipe Feature in the application
//When user swipe left then we need to display information for previous city
function swipeLeft() {
	try {
		errMessage = '';
		if(handleMultipleSwipe){
			handleMultipleSwipe = false;
			var currentRowId = document.getElementById('currentCityRowId').value;
			if (currentRowId != null && currentRowId != "") {
				var prevRow = currentRowId;
				if (favoriteCities.length > 1) {
					for ( var i = 0; i < favoriteCities.length; i++) {
						if (favoriteCities[i] == currentRowId) {
							if (i == 0) {
								prevRow = favoriteCities[favoriteCities.length - 1];
								break;
							} else {
								prevRow = favoriteCities[i - 1];
								break;
							}

						}
					}
					document.getElementById('currentCityRowId').value = prevRow;
					db.transaction( function (tx) {
						getDefaultCityByRowId(tx, prevRow);
					}, txFail, function() {
						db.transaction( function (tx) {
							displayDataFromDB(tx);
							handleMultipleSwipe = true;
						}, txFail);
					});
				}
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n swipeLeft() : " + ex;
		handleMultipleSwipe = true;
	}
	showErrorsToDev();
}

//Swipe Feature in the application
//When user swipe left then we need to display information for next city
function swipeRight() {
	try {
		errMessage = '';
		if(handleMultipleSwipe){
			handleMultipleSwipe = false;
			var currentRowId = document.getElementById('currentCityRowId').value;
			if (currentRowId != null && currentRowId != "") {
				var nextRow = currentRowId;
				if (favoriteCities.length > 1) {
					for ( var i = 0; i < favoriteCities.length; i++) {
						if (favoriteCities[i] == currentRowId) {
							if (i == favoriteCities.length - 1) {
								nextRow = favoriteCities[0];
								break;
							} else {
								nextRow = favoriteCities[i + 1];
								break;
							}

						}
					}
					document.getElementById('currentCityRowId').value = nextRow;
					db.transaction( function (tx) {
						getDefaultCityByRowId(tx, nextRow);
					}, txFail, function() {
						db.transaction( function (tx) {
							displayDataFromDB(tx);
							handleMultipleSwipe = true;
						}, txFail);
					});
				}
			}
		}
	} catch (ex) {
		handleMultipleSwipe = true;
		errMessage = errMessage + "\n swipeRight() : " + ex;
	}
	showErrorsToDev();
}

//******************************************************************************************************************

//******************************************************************************************************************
//Custom Icons Related Functions
//******************************************************************************************************************
/*
 * Change application icon based on current weather conditions, since we are
 * having limited icons to show all weather conditions, we have have grouped
 * some conditions into one condition
 */
function changeAppIcon(/* string */imgsrc, /* string */imgScreenName) {
	try {
		imgsrc = getFileName(imgsrc);

		if (imgsrc != null)
			blackberry.app.setHomeScreenName(imgScreenName);

		if (imgsrc == null || imgsrc == '') {
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Sunny.png");
			return;
		}

		Array.prototype.contains = function (element) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == element) {
					return true;
				}
			}
			return false;
		};


		var imgSunny_Filelist = ["hi_clr.jpg", "hi_nclr.jpg", "hi_nskc.jpg", "hi_skc.jpg", "hot1.jpg", "hot.jpg", "nskc.jpg", "skc.jpg",
		                         "sunny.gif", "sunny.jpg", "sunny.png", "sunnyn.gif", "sunnyn.jpg", "sunnyn.png"];
		var imgSunny_windy_Filelist = ["wind1.jpg", "wind2.jpg", "wind.jpg", "nwind.jpg"];
		var imgPartly_Cloudy_Filelist = ["bkn.jpg", "du.jpg", "dust.jpg", "fair.gif", "fair.jpg", "fair.png", "few.jpg", "fg.jpg", "fog.gif",
		                                 "fog.jpg", "fog.png", "fogn.jpg", "fu.jpg", "hazy.gif", "hazy.jpg", "hazy.png", "hi_bkn.jpg", "hi_few.jpg", "hi_moclr.jpg", "hi_nbkn.jpg",
		                                 "hi_nfew.jpg", "hi_nmoclr.jpg", "hi_nptcldy.jpg", "hi_nsct.jpg", "hi_ptcldy.jpg", "hi_sct.jpg", "hiclouds.jpg", "mist.jpg", "nbkn.jpg",
		                                 "nbknfg.jpg", "nfew.jpg", "nfg.jpg", "nhiclouds.jpg", "novc.jpg", "nsct.jpg", "pcloudy.gif", "pcloudy.jpg", "pcloudy.png", "pcloudyn.gif",
		                                 "pcloudyn.jpg", "pcloudyn.png", "sct.jpg", "sctfg.jpg", "smoke.gif", "smoke.jpg", "smoke.png", "tcu.jpg"];
		var imgCloudy_Filelist = ["ovc.jpg", "hi_mocldy.jpg", "hi_nmocldy.jpg", "cloudy.gif", "cloudy.jpg", "cloudy.png", "cloudynight.jpg",
		                          "mcloudy.gif", "mcloudy.jpg", "mcloudy.png", "mcloudyn.gif", "mcloudyn.jpg", "mcloudyn.png"];
		var imgRain_Filelist = ["drizzle.gif", "drizzle.jpg", "drizzle.png", "fdrizzle.gif", "fdrizzle.jpg", "fdrizzle.png",
		                        "freezingrain.gif", "freezingrain.jpg", "freezingrain.png", "fzra1.jpg", "fzra10.jpg", "fzra20.jpg", "fzra30.jpg", "fzra40.jpg",
		                        "fzra50.jpg", "fzra60.jpg", "fzra70.jpg", "fzra80.jpg", "fzra90.jpg", "fzra100.jpg", "fzra.jpg", "fzrara.jpg", "hi_nshwrs10.jpg",
		                        "hi_nshwrs20.jpg", "hi_nshwrs30.jpg", "hi_nshwrs40.jpg", "hi_nshwrs50.jpg", "hi_nshwrs60.jpg", "hi_nshwrs70.jpg", "hi_nshwrs80.jpg",
		                        "hi_nshwrs90.jpg", "hi_nshwrs100.jpg", "hi_nshwrs.jpg", "hi_shwrs10.jpg", "hi_shwrs20.jpg", "hi_shwrs30.jpg", "hi_shwrs40.jpg",
		                        "hi_shwrs50.jpg", "hi_shwrs60.jpg", "hi_shwrs70.jpg", "hi_shwrs80.jpg", "hi_shwrs90.jpg", "hi_shwrs100.jpg", "hi_shwrs.jpg", "nra10.jpg",
		                        "nra20.jpg", "nra30.jpg", "nra40.jpg", "nra50.jpg", "nra60.jpg", "nra70.jpg", "nra80.jpg", "nra90.jpg", "nra100.jpg", "nra.jpg", "nraip10.jpg",
		                        "nraip20.jpg", "nraip30.jpg", "nraip40.jpg", "nraip50.jpg", "nraip60.jpg", "nraip70.jpg", "nraip80.jpg", "nraip90.jpg", "nraip100.jpg", "nraip.jpg",
		                        "ra1.jpg", "ra2.jpg", "ra4.jpg", "ra10.jpg", "ra20.jpg", "ra30.jpg", "ra40.jpg", "ra50.jpg", "ra60.jpg", "ra70.jpg", "ra80.jpg", "ra90.jpg", "ra100.jpg",
		                        "ra.jpg", "rain.gif", "rain.jpg", "rain.png", "raip10.jpg", "raip20.jpg", "raip30.jpg", "raip40.jpg", "raip50.jpg", "raip60.jpg", "raip70.jpg", "raip80.jpg",
		                        "raip90.jpg", "raip100.jpg", "raip.jpg", "showers.gif", "showers.jpg", "showers.png", "shra1.jpg", "shra2.jpg", "shra10.jpg", "shra20.jpg",
		                        "shra30.jpg", "shra40.jpg", "shra50.jpg", "shra60.jpg", "shra70.jpg", "shra80.jpg", "shra90.jpg", "shra100.jpg", "shra.jpg", "sleet.gif",
		                        "sleet.jpg", "sleet.png"];
		var imgRain_windy_Filelist = ["hurr.jpg"];
		var imgSnow_Filelist = ["ip10.jpg", "ip20.jpg", "ip30.jpg", "ip40.jpg", "ip50.jpg", "ip60.jpg", "ip70.jpg", "ip80.jpg", "ip90.jpg",
		                        "ip100.jpg", "ip.jpg", "mix10.jpg", "mix20.jpg", "mix30.jpg", "mix40.jpg", "mix50.jpg", "mix60.jpg", "mix70.jpg", "mix80.jpg",
		                        "mix90.jpg", "mix100.jpg", "mix.jpg", "nmix.jpg", "nrasn10.jpg", "nrasn20.jpg", "nrasn30.jpg", "nrasn40.jpg", "nrasn50.jpg",
		                        "nrasn60.jpg", "nrasn70.jpg", "nrasn80.jpg", "nrasn90.jpg", "nrasn100.jpg", "nrasn.jpg", "nsn10.jpg", "nsn20.jpg", "nsn30.jpg",
		                        "nsn40.jpg", "nsn50.jpg", "nsn60.jpg", "nsn70.jpg", "nsn80.jpg", "nsn90.jpg", "nsn100.jpg", "nsn.jpg", "rainandsnow.gif",
		                        "rainandsnow.jpg", "rainandsnow.png", "rasn10.jpg", "rasn20.jpg", "rasn30.jpg", "rasn40.jpg", "rasn50.jpg", "rasn60.jpg",
		                        "rasn70.jpg", "rasn80.jpg", "rasn90.jpg", "rasn100.jpg", "rasn.jpg", "sn10.jpg", "sn20.jpg", "sn30.jpg", "sn40.jpg", "sn50.jpg",
		                        "sn60.jpg", "sn70.jpg", "sn80.jpg", "sn90.jpg", "sn100.jpg", "sn.jpg", "snow.gif", "snow.jpg", "snow.png", "snowshowers.gif",
		                        "snowshowers.jpg", "snowshowers.png","snowshwrs.jpg"];
		var imgSnow_windy_Filelist = ["blizzard10.jpg", "blizzard20.jpg", "blizzard30.jpg", "blizzard40.jpg", "blizzard50.jpg", "blizzard60.jpg",
		                              "blizzard70.jpg", "blizzard80.jpg", "blizzard90.jpg", "blizzard100.jpg", "blizzard.jpg", "blizzard.gif", "blizzard.png", "blowingsnow.gif", "blowingsnow.jpg",
		                              "blowingsnow.png", "flurries.gif", "flurries.jpg", "flurries.png", "wswarning.gif", "wswarning.jpg", "wswarning.png", "wswatch.gif", "wswatch.jpg", "wswatch.png"];
		var imgThunderstorms_Filelist = ["hi_ntsra10.jpg", "hi_ntsra20.jpg", "hi_ntsra30.jpg", "hi_ntsra40.jpg", "hi_ntsra50.jpg",
		                                 "hi_ntsra60.jpg", "hi_ntsra70.jpg", "hi_ntsra80.jpg", "hi_ntsra90.jpg", "hi_ntsra100.jpg", "hi_ntsra.jpg", "hi_tsra10.jpg",
		                                 "hi_tsra20.jpg", "hi_tsra30.jpg", "hi_tsra40.jpg", "hi_tsra50.jpg", "hi_tsra60.jpg", "hi_tsra70.jpg", "hi_tsra80.jpg",
		                                 "hi_tsra90.jpg", "hi_tsra100.jpg", "hi_tsra.jpg", "nscttsra10.jpg", "nscttsra20.jpg", "nscttsra30.jpg", "nscttsra40.jpg",
		                                 "nscttsra50.jpg", "nscttsra60.jpg", "nscttsra70.jpg", "nscttsra80.jpg", "nscttsra90.jpg", "nscttsra100.jpg", "nscttsra.jpg",
		                                 "ntsra1.jpg", "ntsra3.jpg", "ntsra10.jpg", "ntsra20.jpg", "ntsra30.jpg", "ntsra40.jpg", "ntsra50.jpg", "ntsra60.jpg", "ntsra70.jpg",
		                                 "ntsra80.jpg", "ntsra90.jpg", "ntsra100.jpg", "ntsra.jpg", "ntsraold.jpg", "scttsra10.jpg", "scttsra20.jpg", "scttsra30.jpg",
		                                 "scttsra40.jpg", "scttsra50.jpg", "scttsra60.jpg", "scttsra70.jpg", "scttsra80.jpg", "scttsra90.jpg", "scttsra100.jpg", "scttsra.jpg",
		                                 "tsra10.jpg", "tsra20.jpg", "tsra30.jpg", "tsra40.jpg", "tsra50.jpg", "tsra60.jpg", "tsra70.jpg", "tsra80.jpg", "tsra90.jpg", "tsra100.jpg",
		                                 "tsra.jpg", "tstorm.gif", "tstorm.jpg", "tstorm.png", "tstormn.gif", "tstormn.jpg", "tstormn.png"];
		var imgTornado_Filelist = ["nsvrtsra.jpg", "ntor.jpg", "tor.jpg"];

		switch (true) {
		case (imgTornado_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Tornado.png");
		break;
		case (imgSunny_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Sunny.png");
		break;
		case (imgSunny_windy_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_SunnyWindy.png");
		break;
		case (imgPartly_Cloudy_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_PartlyCloudy.png");
		break;
		case (imgCloudy_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Cloudy.png");
		break;
		case (imgRain_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Rain.png");
		break;
		case (imgRain_windy_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_RainWindy.png");
		break;
		case (imgSnow_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Snow.png");
		break;
		case (imgSnow_windy_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_SnowWindy.png");
		break;
		case (imgThunderstorms_Filelist.contains(imgsrc)):
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_Thunderstorms.png");
		break;
		default:
			blackberry.app.setHomeScreenIcon("local:///images/LBAI53_PartlyCloudy.png");
		break;
		}
	} catch (ex) {
		errMessage = errMessage + "\n changeAppIcon() : " + ex;
	}
}

/*
 * Change application icon based on current weather conditions, since we are
 * having limited icons to show all weather conditions, we have have grouped
 * some conditions into one condition
 */
function changeWeatherIcon(/* string */imgsrc) {
	try {
		imgsrc = getFileName(imgsrc);
		if (imgsrc == null || imgsrc == '') {
			return '';
		}

		var LBImage = '';

		Array.prototype.contains = function (element) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == element) {
					return true;
				}
			}
			return false;
		};

		var LBWI75_Tornado = ["nsvrtsra.jpg", "ntor.jpg", "tor.jpg"];	
		var LBWI75_Snow_Night = ["nsn10.jpg", "nsn20.jpg", "nsn30.jpg", "nsn40.jpg", "nsn50.jpg", "nsn60.jpg",
		                         "nsn70.jpg", "nsn80.jpg", "nsn90.jpg", "nsn100.jpg", "nsn.jpg"];
		var LBWI75_Snow = ["blizzard10.jpg", "blizzard20.jpg", "blizzard30.jpg", "blizzard40.jpg", "blizzard50.jpg",
		                   "blizzard60.jpg", "blizzard70.jpg", "blizzard80.jpg", "blizzard90.jpg", "blizzard100.jpg", "blizzard.jpg",
		                   "blizzard.gif", "blizzard.png", "blowingsnow.gif", "blowingsnow.jpg", "blowingsnow.png", "flurries.gif",
		                   "flurries.jpg", "flurries.png", "wswarning.gif", "wswarning.jpg", "wswarning.png", "wswatch.gif",
		                   "wswatch.jpg", "wswatch.png", "sn10.jpg", "sn20.jpg", "sn30.jpg", "sn40.jpg", "sn50.jpg", "sn60.jpg",
		                   "sn70.jpg", "sn80.jpg", "sn90.jpg", "sn100.jpg", "sn.jpg", "snow.gif", "snow.jpg", "snow.png",
		                   "snowshowers.gif", "snowshowers.jpg", "snowshowers.png", "snowshwrs.jpg"];
		var LBWI75_Cloudy_Night = ["novc.jpg"];
		var LBWI75_Cloudy = ["ovc.jpg"];
		var LBWI75_Clear_Night = ["hi_nclr.jpg", "hi_nskc.jpg", "nskc.jpg", "sunnyn.gif", "sunnyn.jpg", "sunnyn.png"];
		var LBWI75_Sunny = ["hi_clr.jpg", "hi_skc.jpg", "hot1.jpg", "hot.jpg", "skc.jpg", "sunny.gif", "sunny.jpg",
		                    "sunny.png"];
		var LBWI75_ClearWindy_Night = ["nwind.jpg"];
		var LBWI75_SunnyWindy = ["wind1.jpg", "wind2.jpg", "wind.jpg"];
		var LBWI75_FreezingRain = ["rainandsnow.gif", "rainandsnow.jpg", "rainandsnow.png", "fzra.jpg",
		                           "freezingrain.gif", "freezingrain.jpg", "freezingrain.png", "fzra1.jpg", "fzra10.jpg", "fzra20.jpg",
		                           "fzra30.jpg", "fzra40.jpg", "fzra50.jpg", "fzra60.jpg", "fzra70.jpg", "fzra80.jpg", "fzra90.jpg",
		                           "fzra100.jpg", "fzra.jpg", "fzrara.jpg", "ip.jpg", "raip10.jpg", "raip20.jpg", "raip30.jpg", "raip40.jpg",
		                           "raip50.jpg", "raip60.jpg", "raip70.jpg", "raip80.jpg", "raip90.jpg", "raip100.jpg", "raip.jpg",
		                           "mix10.jpg", "mix20.jpg", "mix30.jpg", "mix40.jpg", "mix50.jpg", "mix60.jpg", "mix70.jpg", "mix80.jpg",
		                           "mix90.jpg", "mix100.jpg", "mix.jpg", "rasn10.jpg", "rasn20.jpg", "rasn30.jpg", "rasn40.jpg", "rasn50.jpg",
		                           "rasn60.jpg", "rasn70.jpg", "rasn80.jpg", "rasn90.jpg",	"rasn100.jpg", "rasn.jpg"];
		var LBWI75_FreezingRain_Night = ["nrasn10.jpg", "nrasn20.jpg", "nrasn30.jpg", "nrasn40.jpg", "nrasn50.jpg",
		                                 "nrasn60.jpg", "nrasn70.jpg", "nrasn80.jpg", "nrasn90.jpg", "nrasn100.jpg", "nrasn.jpg", "nmix.jpg",
		                                 "nmix.jpg", "nrasn10.jpg", "nrasn20.jpg", "nrasn30.jpg", "nrasn40.jpg", "nrasn50.jpg", "nrasn60.jpg",
		                                 "nrasn70.jpg", "nrasn80.jpg", "nrasn90.jpg", "nrasn100.jpg", "nrasn.jpg", "nrasn.jpg", "nraip10.jpg",
		                                 "nraip20.jpg", "nraip30.jpg", "nraip40.jpg", "nraip50.jpg", "nraip60.jpg", "nraip70.jpg", "nraip80.jpg",
		                                 "nraip90.jpg", "nraip100.jpg", "nraip.jpg"];
		var LBWI75_PartlyCloudy = ["bkn.jpg", "du.jpg", "dust.jpg", "fair.gif", "fair.jpg", "fair.png", "few.jpg",
		                           "fg.jpg", "fog.gif", "fog.jpg", "fog.png", "fogn.jpg", "fu.jpg", "hazy.gif", "hazy.jpg", "hazy.png",
		                           "hi_bkn.jpg", "hi_few.jpg", "hi_ptcldy.jpg", "hi_sct.jpg", "hiclouds.jpg", "mist.jpg", "pcloudy.gif",
		                           "pcloudy.jpg", "pcloudy.png", "sct.jpg", "sctfg.jpg", "smoke.gif", "smoke.jpg", "smoke.png", "tcu.jpg"];
		var LBWI75_PartlyCloudy_Night = ["fogn.jpg", "hi_bkn.jpg", "hi_nbkn.jpg", "hi_nfew.jpg", "hi_nmoclr.jpg",
		                                 "hi_nptcldy.jpg", "hi_nsct.jpg", "nbkn.jpg", "nbknfg.jpg", "nfew.jpg", "nfg.jpg", "nhiclouds.jpg",
		                                 "novc.jpg", "nsct.jpg", "pcloudyn.gif", "pcloudyn.jpg", "pcloudyn.png"];
		var LBWI75_Rain_Night = ["hi_nshwrs10.jpg", "hi_nshwrs20.jpg", "hi_nshwrs30.jpg", "hi_nshwrs40.jpg",
		                         "hi_nshwrs50.jpg", "hi_nshwrs60.jpg", "hi_nshwrs70.jpg", "hi_nshwrs80.jpg", "hi_nshwrs90.jpg",
		                         "hi_nshwrs100.jpg", "hi_nshwrs.jpg", "nra10.jpg", "nra20.jpg", "nra30.jpg", "nra40.jpg", "nra50.jpg",
		                         "nra60.jpg", "nra70.jpg", "nra80.jpg", "nra90.jpg", "nra100.jpg", "nra.jpg"];
		var LBWI75_Rain = ["drizzle.gif", "drizzle.jpg", "drizzle.png", "fdrizzle.gif", "fdrizzle.jpg", "fdrizzle.png",
		                   "shra1.jpg", "shra2.jpg", "shra10.jpg", "shra20.jpg", "shra30.jpg", "shra40.jpg", "shra50.jpg",
		                   "shra60.jpg", "shra70.jpg", "shra80.jpg", "shra90.jpg", "shra100.jpg", "shra.jpg", "hi_shwrs10.jpg",
		                   "hi_shwrs20.jpg", "hi_shwrs30.jpg", "hi_shwrs40.jpg", "hi_shwrs50.jpg", "hi_shwrs60.jpg", "hi_shwrs70.jpg",		
		                   "hi_shwrs80.jpg", "hi_shwrs90.jpg", "hi_shwrs100.jpg", "hi_shwrs.jpg", "ra1.jpg", "ra2.jpg", "ra4.jpg",
		                   "ra10.jpg", "ra20.jpg", "ra30.jpg", "ra40.jpg", "ra50.jpg", "ra60.jpg", "ra70.jpg", "ra80.jpg", "ra90.jpg",
		                   "ra100.jpg", "ra.jpg", "rain.gif", "rain.jpg", "rain.png"];
		var LBWI75_Thunderstorms_Night = ["hi_ntsra10.jpg", "hi_ntsra20.jpg", "hi_ntsra30.jpg", "hi_ntsra40.jpg",
		                                  "hi_ntsra50.jpg", "hi_ntsra60.jpg", "hi_ntsra70.jpg", "hi_ntsra80.jpg", "hi_ntsra90.jpg",
		                                  "hi_ntsra100.jpg", "hi_ntsra.jpg", "nscttsra10.jpg", "nscttsra20.jpg", "nscttsra30.jpg", "nscttsra40.jpg",
		                                  "nscttsra50.jpg", "nscttsra60.jpg", "nscttsra70.jpg", "nscttsra80.jpg", "nscttsra90.jpg",
		                                  "nscttsra100.jpg", "nscttsra.jpg", "ntsra1.jpg", "ntsra3.jpg", "ntsra10.jpg", "ntsra20.jpg", "ntsra30.jpg",
		                                  "ntsra40.jpg", "ntsra50.jpg", "ntsra60.jpg", "ntsra70.jpg", "ntsra80.jpg", "ntsra90.jpg", "ntsra100.jpg",
		                                  "ntsra.jpg", "ntsraold.jpg"];
		var LBWI75_Thunderstorms = ["hurr.jpg", "hi_tsra10.jpg", "hi_tsra20.jpg", "hi_tsra30.jpg", "hi_tsra40.jpg",
		                            "hi_tsra50.jpg", "hi_tsra60.jpg", "hi_tsra70.jpg", "hi_tsra80.jpg", "hi_tsra90.jpg", "hi_tsra100.jpg",
		                            "hi_tsra.jpg", "scttsra10.jpg", "scttsra20.jpg", "scttsra30.jpg", "scttsra40.jpg", "scttsra50.jpg",
		                            "scttsra60.jpg", "scttsra70.jpg", "scttsra80.jpg", "scttsra90.jpg", "scttsra100.jpg", "scttsra.jpg",
		                            "tsra10.jpg", "tsra20.jpg", "tsra30.jpg", "tsra40.jpg", "tsra50.jpg", "tsra60.jpg", "tsra70.jpg", 
		                            "tsra80.jpg", "tsra90.jpg", "tsra100.jpg", "tsra.jpg", "tstorm.gif", "tstorm.jpg", "tstorm.png",
		                            "tstormn.gif", "tstormn.jpg", "tstormn.png"];

		switch (true) {
		case (LBWI75_Tornado.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Tornado.png";
		break;
		case (LBWI75_Snow.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Snow.png";
		break;
		case (LBWI75_Snow_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Snow_Night.png";
		break;
		case (LBWI75_Cloudy.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Cloudy.png";
		break;
		case (LBWI75_Cloudy_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Cloudy_Night.png";
		break;
		case (LBWI75_Sunny.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Sunny.png";
		break;
		case (LBWI75_Clear_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Clear_Night.png";
		break;
		case (LBWI75_SunnyWindy.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_SunnyWindy.png";
		break;
		case (LBWI75_ClearWindy_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_ClearWindy_Night.png";
		break;
		case (LBWI75_FreezingRain.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_FreezingRain.png";
		break;
		case (LBWI75_FreezingRain_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_FreezingRain_Night.png";
		break;
		case (LBWI75_PartlyCloudy.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_PartlyCloudy.png";
		break;
		case (LBWI75_PartlyCloudy_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_PartlyCloudy_Night.png";
		break;
		case (LBWI75_Rain.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Rain.png";
		break;
		case (LBWI75_Rain_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Rain_Night.png";
		break;
		case (LBWI75_Thunderstorms.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Thunderstorms.png";
		break;
		case (LBWI75_Thunderstorms_Night.contains(imgsrc)):
			LBImage = "local:///images/LBWI100_Thunderstorms_Night.png";
		break;
		default:
			LBImage = "local:///images/LBWI100_PartlyCloudy.png";
		break;
		}
	} catch (ex) {
		errMessage = errMessage + "\n changeWeatherIcon() : " + ex;
	}
	return LBImage;
}

//******************************************************************************************************************

//******************************************************************************************************************
//NDFD Data Invoke Related Functions
//******************************************************************************************************************
/*
 * Get Todays weather conditions Called when application getting loaded.
 */
function getDataFromStation(/* defaultCity Array */defaultCity) {
	// Variables declaration and initialization
	var xmlFeedURL;
	var dom;
	var zipLatitude;
	var zipLongitude;
	var resxml;

	try {
		zipLatitude = defaultCity[2];
		zipLongitude = defaultCity[3];

		/*
		 * Get the xml feed URL for the selected city / coordinates this is the
		 * url from where we are going to fetch the current weather condition
		 */
		xmlFeedURL = defaultCity[4];
		// Get the xml feed from the URL using XMLHttpRequest
		httpReq.onreadystatechange = handleStateChange;
		// URL of xml Feed for Current Weather Condition
		httpReq.open("GET", 'http://weather.gov/xml/current_obs/' + xmlFeedURL + '.xml', false);
		httpReq.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		httpReq.setRequestHeader("Pragma", "cache");
		httpReq.setRequestHeader("Cache-Control", "no-transform");
		httpReq.send(null);
		if (httpReq.readyState == 4 && httpReq.status == 200) {
			var xmlString = parseStringIntoValidXML(httpReq.responseText);
			var ret = new DOMParser().parseFromString(xmlString, "text/xml");
			return ret;
		} else {
			return null;
		}
	} catch (ex) {
		alert("Failed to get data from the server. Please check your data connection and try again. Error Code : 111 ");
		errMessage = errMessage + "\n getDataFromStation() : " + ex;
		return null;
	}
}

/*
 * Callback function for each XMLHttpRequest Called when any XMLHttpRequest
 * request made TO DO : Need to format callback function.
 */
function handleStateChange() {
	if (httpReq.readyState != 4)
		return;
}

/*
 * Get forecast information from NOAA site Called when user clicks for Today /
 * Seven Days Forecast information. From this method we are getting wind speed/
 * wind direction/ snow status/ weather condition/ probability of precipitation
 * in 3/4/6/12 hour format, To determine the weather condition for wind/ snow/
 * rain/ probability of precipitation, we need to call this method to get
 * information in 3/4/6/12 hours format. Returns National Weather Service
 * digital weather forecast data. Supports latitudes and longitudes for the
 * Continental United States, Allowable values for the input variable "product"
 * are "time-series" and "glance". For both products, a start and end time
 * (Local) are required. For the time-series product, the input variable
 * "weatherParameters" has array elements set to "true" to indicate which
 * weather parameters are being requested. If an array element is set to
 * "false", data for that weather parameter are not to be returned.
 */
function NDFDgen(/* float */latitude, /* float */longitude) {
	try {
		// Assign callback function
		httpReq.onreadystatechange = handleStateChange;
		// URL for Web Method
		httpReq.open("POST", "http://graphical.weather.gov/xml/SOAP_server/ndfdXMLserver.php", false);
		httpReq.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		// Determine which method we need to call
		httpReq.setRequestHeader("SoapAction", "http://graphical.weather.gov/xml/DWMLgen/wsdl/ndfdXML.wsdl#NDFDgen");
		httpReq.setRequestHeader("Pragma", "cache");
		httpReq.setRequestHeader("Cache-Control", "no-transform");
		// List of parameters going to pass with the request
		var weatherparam = "<maxt xsi:type='xsd:boolean'>true</maxt>";
		weatherparam = weatherparam + "<mint xsi:type='xsd:boolean'>true</mint>";
		weatherparam = weatherparam + "<pop12 xsi:type='xsd:boolean'>true</pop12>";
		weatherparam = weatherparam + "<wspd xsi:type='xsd:boolean'>true</wspd>";
		weatherparam = weatherparam + "<wdir xsi:type='xsd:boolean'>true</wdir>";
		weatherparam = weatherparam + "<wx xsi:type='xsd:boolean'>true</wx>";
		weatherparam = weatherparam + "<icons xsi:type='xsd:boolean'>true</icons>";
		weatherparam = weatherparam + "<snow xsi:type='xsd:boolean'>true</snow>";
		weatherparam = weatherparam + "<qpf xsi:type='xsd:boolean'>true</qpf>";
		weatherparam = weatherparam + "<rh xsi:type='xsd:boolean'>true</rh>";
		weatherparam = weatherparam + "<wwa xsi:type='xsd:boolean'>true</wwa>";

		var unitType = "e";
		
		// List of parameters going to pass with the request
		var param = "<?xml version='1.0' encoding='UTF-8' standalone='no'?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:SOAP-ENV='http://schemas.xmlsoap.org/soap/envelope/' xmlns:SOAP-ENC='http://schemas.xmlsoap.org/soap/encoding/' xmlns:tns='http://graphical.weather.gov/xml/DWMLgen/wsdl/ndfdXML.wsdl' xmlns:typens='http://graphical.weather.gov/xml/DWMLgen/schema/DWML.xsd'> <soapenv:Header/><SOAP-ENV:Body><mns:NDFDgen><latitude xsi:type='xsd:decimal'>" + latitude + "</latitude><longitude xsi:type='xsd:decimal'>" + longitude + "</longitude><product xsi:type='typens:productType'>time-series</product><startTime xsi:type='xsd:dateTime'></startTime><endTime xsi:type='xsd:dateTime'></endTime><Unit xsi:type='typens:unitType'>" + unitType + "</Unit><weatherParameters xsi:type='typens:weatherParametersType'>" + weatherparam + "</weatherParameters></mns:NDFDgen></SOAP-ENV:Body></SOAP-ENV:Envelope>";		
		httpReq.send(param);
		if (httpReq.readyState == 4 && httpReq.status == 200) {
			var ret = (new DOMParser()).parseFromString(httpReq.responseText, "text/xml");
			var dwmlOut = ret.getElementsByTagName("dwmlOut")[0];
			ret = (new DOMParser()).parseFromString(dwmlOut.textContent, "text/xml");
			return ret;
		} else {
			return null;
		}
	} catch (ex) {
		alert("Failed to get data from the server. Please check your data connection and try again. Error Code : 113 :" + ex);
		errMessage = errMessage + "\n NDFDgen() : " + ex;
		return null;
	}
}

/*
 * Get latitude and longitude of a specified city or zip code Called in Setting
 * Screen, when user adds favorites city. The Geocoding API requests an xml
 * response for the identical city or zip code. The status of xml Response can
 * be one of the following, "OK" indicates that no errors occurred; the address
 * was successfully parsed and at least one geocode was returned. "ZERO_RESULTS"
 * indicates that the geocode was successful but returned no results. This may
 * occur if the geocode was passed a non-existent address or a latlng in a
 * remote location. "OVER_QUERY_LIMIT" indicates that you are over your quota.
 * "REQUEST_DENIED" indicates that your request was denied, generally because of
 * lack of a sensor parameter. "INVALID_REQUEST" generally indicates that the
 * query (address or latlng) is missing.
 */
function requestCityInfo() {
	try {
		// Assign callback function
		var request = new XMLHttpRequest();
		var reqServer;
		if (handleGoogleRequest)
			reqServer = "http://maps.google.com/maps/api/geocode/xml?address=" + txtcityzip.value + ",United States&sensor=true";
		else
			reqServer = "http://where.yahooapis.com/geocode?q=" + txtcityzip.value;
		
		request.onreadystatechange = processAddingCity;
		// URL for Web Method / API
		request.open("GET", reqServer, false);
		request.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
		request.setRequestHeader("Pragma", "cache");
		request.setRequestHeader("Cache-Control", "no-transform");
		request.send();
	} catch (ex) {
		alert("Failed to get data from the server. Please check your data connection and try again. Error Code : 115 ");
		errMessage = errMessage + "\n requestCityInfo() : " + ex;
		return null;
	}
}

/*
 * Create and Display a spinner for selecting a city
 */
function selectACityFromGoogle(cities, callback) {
	var cityResults = new Array();
	var cityTmpResults = new Array();
	for (var i = 0; i < cities.length; i++) {
		var cityname = cities[i].getElementsByTagName("formatted_address")[0].childNodes[0].nodeValue;
		cityTmpResults[i] = cityname;
		cityResults[i] = new Array(3);
		cityResults[i][0] = cityname;
		cityResults[i][1] = cities[i].getElementsByTagName("location")[0].childNodes[1].childNodes[0].nodeValue;
		cityResults[i][2] = cities[i].getElementsByTagName("location")[0].childNodes[3].childNodes[0].nodeValue;
	}

	// Open the spin dialog	
    showSpinnerDialog("Select A City :", cityTmpResults, 0, 
        function (cityIndex) {
            var cityData = { latitude:0, longitude:0, name:'' };

            if (cityIndex != undefined) {
                cityData.name = cityResults[cityIndex][0];
                cityData.latitude = cityResults[cityIndex][1];
                cityData.longitude = cityResults[cityIndex][2];
            } else {
                cityData = null;
            }
            
            callback(cityData);
        }
    );	
}

/*
 * Create and Display a spinner for selecting a city
 */
function selectACityFromYahoo(cities, callback) {
	var cityResults = new Array();
	var cityTmpResults = new Array();
	for (var i = 0; i < cities.length; i++) {
		if(cities[i].getElementsByTagName("line2")[0].childNodes.length > 0)
			var cityname = cities[i].getElementsByTagName("line2")[0].childNodes[0].nodeValue + ', ' + cities[i].getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
		else if(cities[i].getElementsByTagName("line3")[0].childNodes.length> 0)
			var cityname = cities[i].getElementsByTagName("line3")[0].childNodes[0].nodeValue + ', ' + cities[i].getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
		else if(cities[i].getElementsByTagName("line1")[0].childNodes.length> 0)
			var cityname = cities[i].getElementsByTagName("line1")[0].childNodes[0].nodeValue + ', ' + cities[i].getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
		else if(cities[i].getElementsByTagName("line4")[0].childNodes.length> 0)
			var cityname = cities[i].getElementsByTagName("line4")[0].childNodes[0].nodeValue + ', ' + cities[i].getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
		cityTmpResults[i] = cityname;
		cityResults[i] = new Array(3);
		cityResults[i][0] = cityname;
		cityResults[i][1] = cities[i].getElementsByTagName("latitude")[0].childNodes[0].nodeValue;
		cityResults[i][2] = cities[i].getElementsByTagName("longitude")[0].childNodes[0].nodeValue;
	}

	// Open the spin dialog
	showSpinnerDialog("Select A City :", cityTmpResults, 0,
        function (cityIndex) {
            var cityData = { latitude:0, longitude:0, name:'' };

            if (cityIndex != undefined) {
                cityData.name = cityResults[cityIndex][0];
                cityData.latitude = cityResults[cityIndex][1];
                cityData.longitude = cityResults[cityIndex][2];
            } else {
                cityData = null;
            }
            
            callback(cityData);
        }
    );

	
}

/*
 * Add Selected City to Database and refresh screen * 
 */
function addSelectedCity(cityData) {
	var xmlFeedURL = undefined;
	var currentDate = new Date().toString();
	// Variables declaration and initialization
	var minDistance = 999999;
	var distance;
	db.transaction( function (tx) {
		/*
		 * Get all the stations, latitude, longitude amd xml feed url
		 * here we are assuming that we will get enough stations within
		 * the range of +/- 3 degree because we are having too many
		 * stations in the database and to pick all of them and compare
		 * the distance is not fruitful here So we are getting stations
		 * list which is near by around 3 degree, if we did not find
		 * nearest station then we will increase the criteria with +/- 3
		 */
		tx.executeSql("SELECT xml_url, latitude, longitude FROM StationList where latitude >=  ? and latitude <= ? ;",
				[(Number(cityData.latitude) - 3),(Number(cityData.latitude) + 3)],
				function (tx, results) {
			if (results.rows.length > 0) {
				for ( var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
					// calculate the nearest distance based upon latitude and longitude
					distance = getDistance(cityData.latitude, cityData.longitude, row.latitude, row.longitude);
					if (distance < minDistance) {
						xmlFeedURL = row.xml_url; // URL for XML Feed
						minDistance = distance;
					}
				} // for i
			} else if (xmlFeedURL != '') {
				tx.executeSql("SELECT xml_url, latitude, longitude FROM StationList where latitude >= ? and latitude <= ? ;",
						[(Number(cityData.latitude) + 4), (Number(cityDatalatitude) - 4) ],
						function (tx, results) {
					if (results.rows.length > 0) {
						for ( var i = 0; i < results.rows.length; i++) {
							var row = results.rows.item(i);
							// calculate the nearest distance based upon latitude and longitude
							distance = getDistance(cityData.latitude, cityData.longitude, row.latitude, row.longitude);
							if (distance < minDistance) {
								xmlFeedURL = row.xml_url; // URL for XML Feed
								minDistance = distance;
							}
						} // for i
					} else if (xmlFeedURL != '') {
						tx.executeSql("SELECT xml_url, latitude, longitude FROM StationList;",
								null, function (tx,results) {
							if (results.rows.length > 0) {
								for ( var i = 0; i < results.rows.length; i++) {
									var row = results.rows.item(i);
									// calculate the nearest distance based upon latitude and longitude
									distance = getDistance(cityData.latitude, cityData.longitude, row.latitude, row.longitude);
									if (distance < minDistance) {
										xmlFeedURL = row.xml_url; // URL for XML Feed
										minDistance = distance;
									}
								} // for i
							}
						}, sqlFail);
					}
				}, sqlFail);
			}				
			tx.executeSql("Update FavoritesCity Set LastVisited = 0;", null, null, sqlFail);
			tx.executeSql("insert into FavoritesCity (CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated) values (?, ?, ?, ?, ?, ?);",
					[cityData.name, cityData.latitude, cityData.longitude, xmlFeedURL, 1, currentDate ],
					populateFavoritesCity, sqlFail);
			// done adding city so now clear the progressBar
			getForecastDateForNewCity();
		}, sqlFail);			
	}, txFail/*Error*/, null/*success*/);			
}

/*
 * Process the result of the XMLHTTPRequest
 */
function processAddingCity() {
	if (this.readyState != 4)	
		return; // No data ready to be processed.
	try {			
		// Check for errors.
		if (this.status != 200) { 
			if (++currentTries < MAXTRIES) {
				handleGoogleRequest = !handleGoogleRequest;
				setTimeout("requestCityInfo();",1000);
				return;
			} else {
				currentTries = 0;
				showErrorsToDev();
				handleMultipleRequest = true;
				alert("Currently unable to lookup your city, please try again later.");
				throw "Google Request failed";
			}
		}
		// Make sure we got an XML response.
		var locationXML = this.responseXML;
		if (null == locationXML) {
			if (++currentTries < MAXTRIES) {
				handleGoogleRequest = !handleGoogleRequest;
				setTimeout("requestCityInfo();",1000);
				return;
			} else {
				currentTries = 0;
				showErrorsToDev();
				handleMultipleRequest = true;
				alert("Currently unable to lookup your city, please try again later.");
				throw "Google Request failed";
			}
		}
		if (handleGoogleRequest) 
			ProcessDataFromGoogle(locationXML);
		else
			ProcessDataFromYahoo(locationXML);
	} catch (e) {
		errMessage = errMessage + "\nprocessAddingCity: " + e;
		showErrorsToDev();
		clearProgressBar();
	}
}

function ProcessDataFromYahoo(locationXML)
{
	if (locationXML.getElementsByTagName("Error")[0].childNodes[0].nodeValue == 0) {
		var cityData = {
				latitude:0,
				longitude:0,
				name:''
		};

		var results = locationXML.getElementsByTagName("Result");
		if (results.length > 1) {
			selectACityFromYahoo(results, preAddCityYahoo);			
		} else {
			cityData.latitude = locationXML.getElementsByTagName("latitude")[0].childNodes[0].nodeValue;
			cityData.longitude = locationXML.getElementsByTagName("longitude")[0].childNodes[0].nodeValue;
			if(locationXML.getElementsByTagName("line2")[0].childNodes.length > 0)
				cityData.name = locationXML.getElementsByTagName("line2")[0].childNodes[0].nodeValue + ', ' + locationXML.getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
			else if(locationXML.getElementsByTagName("line3")[0].childNodes.length > 0)
				cityData.name = locationXML.getElementsByTagName("line3")[0].childNodes[0].nodeValue + ', ' + locationXML.getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
			else if(locationXML.getElementsByTagName("line4")[0].childNodes.length > 0)
				cityData.name = locationXML.getElementsByTagName("line4")[0].childNodes[0].nodeValue + ', ' + locationXML.getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
			else if(locationXML.getElementsByTagName("line1")[0].childNodes.length > 0)
				cityData.name = locationXML.getElementsByTagName("line1")[0].childNodes[0].nodeValue + ', ' + locationXML.getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
            preAddCityYahoo(cityData);
		}
		
	} else {
		if (++currentTries < MAXTRIES) {
			handleGoogleRequest = !handleGoogleRequest;
			setTimeout("requestCityInfo();",1000);
			return;
		} else {
			currentTries = 0;
			alert("Currently unable to lookup your city, please try again later.");
			handleMultipleRequest = true;
			throw locationXML.getElementsByTagName("status")[0].childNodes[0].nodeValue;
		}
	}	
}

function preAddCityYahoo(cityData){
    // If user didn't want one of the cities from the list then end the request
    if(!cityData) {
        handleMultipleRequest = true;
        clearProgressBar();
        return;
    }
    
    if (cityData.name.substring(cityData.name.length - 4) != ", US") {
        var msg = "Currently this widget supports U.S. cities only.";
        alert(msg);
        errMessage = errMessage + "\n miAddLocation() : " + msg ;
        document.getElementById("txtcityzip").focus();
        setFocusToElement('dummyDivAddLocation', 'txtcityzip');
        showErrorsToDev();
        handleMultipleRequest = true;
        throw msg;
    }
    
    addSelectedCity(cityData);
}

function ProcessDataFromGoogle(locationXML)
{
	if (locationXML.getElementsByTagName("status")[0].childNodes[0].nodeValue == "OK") {
		var cityData = {
				latitude:0,
				longitude:0,
				name:''
		};

		var results = locationXML.getElementsByTagName("result");
		if (results.length > 1) {
			selectACityFromGoogle(results, preAddCityGoogle);
		} else {
			var location = locationXML.getElementsByTagName("location")[0];
			cityData.latitude = location.childNodes[1].childNodes[0].nodeValue;
			cityData.longitude = location.childNodes[3].childNodes[0].nodeValue;
			cityData.name = locationXML.getElementsByTagName("formatted_address")[0].childNodes[0].nodeValue;
            preAddCityGoogle(cityData);
		}
		
	} else {
		if (++currentTries < MAXTRIES) {
			handleGoogleRequest = !handleGoogleRequest;
			setTimeout("requestCityInfo();",1000);
			return;
		} else {
			currentTries = 0;
			alert("Currently unable to lookup your city, please try again later.");
			handleMultipleRequest = true;
			throw locationXML.getElementsByTagName("status")[0].childNodes[0].nodeValue;
		}
	}	
}

function preAddCityGoogle(cityData){
    // If user didn't want one of the cities from the list then end the request
    if(!cityData) {
        handleMultipleRequest = true;
        clearProgressBar();
        return;
    }
    
    if (cityData.name.substring(cityData.name.length - 5) != ", USA") {
        var msg = "Currently this widget supports U.S. cities only.";
        alert(msg);
        errMessage = errMessage + "\n miAddLocation() : " + msg ;
        document.getElementById("txtcityzip").focus();
        setFocusToElement('dummyDivAddLocation', 'txtcityzip');
        showErrorsToDev();
        handleMultipleRequest = true;
        throw msg;
    }
    
    addSelectedCity(cityData);
}

function showSpinnerDialog(title, arrChoices, defaultChoice, callback)
{
	var rowHeight,
        visibleRows,
        options;

	if (screen.height < 480) {
		rowHeight = 60;
		visibleRows = 3;
	} else {
		rowHeight = 75;
		visibleRows = 4;
	}
    options = {
        'title' : title,
        'rowHeight': rowHeight,
        'visibleRows': visibleRows,
        'selectedIndex': defaultChoice,
        'items' : arrChoices
    };
    
    // Open the spin dialog
    blackberry.ui.Spinner.open(options, callback);	
}

//******************************************************************************************************************

//******************************************************************************************************************
//NDFD Data calculation and manipulation Related Functions
//******************************************************************************************************************
/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter operation : What kind of operations need to perform on
 * result array, i.e. Min, Max
 */
function readNDFDDataIn12hFormat(/* xml nodeList */timeLayout, /* xml nodeList */ param1, /* string */operation) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			var time = timeLayout[k].childNodes[0].nodeValue.substring(11, 13);
			arrFinalValue[i] = new Array(2);
			arrFinalValue[i][0] = formatDate(currentDate);
			arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
			k++;

			// We need to store data next after 12 hours;
			var nextTime = parseInt(time, 10) + 12;
			for ( var j = 0; k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				var time1 = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
				if (currentDate != currentDate1) {
					currentDate = currentDate1;
					nextTime -= 24;
				}
				if (time1 >= nextTime) {
					break;
				}
				if (operation == 'max') {
					// Only store maximum values
					if (parseInt(getIntNodeValues1(param1[k]), 10) > arrFinalValue[i][1]) {
						arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
					}
				} else if (operation == 'min') {
					// Only store minimum values
					if (parseInt(getIntNodeValues1(param1[k]), 10) < arrFinalValue[i][1]) {
						arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
					}
				}
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDDataIn12hFormat() : " + ex;
	}
	return arrFinalValue;
}

/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter (Wind) Param2 : NDFD Value Elements for Wind Direction
 */
function readNDFDWindDataIn12hFormat(/* xml nodeList */timeLayout, /* xml nodeList */ param1, /* xml nodeList */param2) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			var time = timeLayout[k].childNodes[0].nodeValue.substring(11, 13);
			arrFinalValue[i] = new Array(2);
			arrFinalValue[i][0] = formatDate(currentDate);
			arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
			arrFinalValue[i][2] = parseInt(getIntNodeValues1(param2[k]), 10);
			k++;

			// We need to store data next after 12 hours;
			var nextTime = parseInt(time, 10) + 12;
			for ( var j = 0; k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				var time1 = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
				if (currentDate != currentDate1) {
					currentDate = currentDate1;
					nextTime -= 24;
				}
				if (time1 >= nextTime) {
					break;
				}
				// Only store maximum values
				if (parseInt(getIntNodeValues1(param1[k]), 10) > arrFinalValue[i][1]) {
					arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
					arrFinalValue[i][2] = parseInt(getIntNodeValues1(param2[k]), 10);
				}
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDWindDataIn12hFormat() : " + ex;
	}

	return arrFinalValue;
}

/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter
 */
function readNDFDIconIn12hFormat(/* xml nodeList */timeLayout, /* xml nodeList */ param1, /* xml nodeList */param2) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";
		var weatherConditions = "";

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			var time = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
			arrFinalValue[i] = new Array(2);
			// Customize timing name
			switch (true) {
			case (time >= 0 && time < 5):
				arrFinalValue[i][0] = formatDate(currentDate) + " - Night";
			break;
			case (time >= 5 && time < 8):
				arrFinalValue[i][0] = formatDate(currentDate) + " - Morning";
			break;
			case (time >= 8 && time < 12):
				arrFinalValue[i][0] = formatDate(currentDate) + " - Day";
			break;
			case (time >= 12 && time < 18):
				arrFinalValue[i][0] = formatDate(currentDate) + " - Afternoon";
			break;
			case (time >= 18 && time < 22):
				arrFinalValue[i][0] = formatDate(currentDate) + " - Evening";
			break;
			case (time >= 22):
				arrFinalValue[i][0] = formatDate(currentDate) + " - Night";
			break;
			}
			arrFinalValue[i][1] = getStrNodeValues1(param1[k]);
			weatherConditions = param2[k].getElementsByTagName("value");
			if (weatherConditions.length > 0) {
				arrFinalValue[i][2] = weatherConditions[0].getAttribute("weather-type");
			} else {
				arrFinalValue[i][2] = "";
			}
			k++;
			var nextDay = false;
			var nextTime = 0;
			// We need to store data next after 12 hours;
			nextTime = time + 12;
			if (nextTime >= 24) {
				nextDay = true;
				nextTime -= 24;
			}
			for ( var j = 0; k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				var time1 = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
				if (time1 >= nextTime && (!nextDay || currentDate1 != currentDate)) {
					break;
				}
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDIconIn12hFormat() : " + ex;
	}
	return arrFinalValue;
}

/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter (Icon)
 */
function readNDFDIconIn24hFormat(/* xml nodeList */timeLayout, /* xml nodeList */ param1, /* xml nodeList */param2) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";
		var weatherConditions = "";

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			arrFinalValue[i] = new Array(2);
			arrFinalValue[i][0] = formatDate(currentDate);
			arrFinalValue[i][1] = getStrNodeValues1(param1[k]);
			weatherConditions = param2[k].getElementsByTagName("value");
			if (weatherConditions.length > 0) {
				arrFinalValue[i][2] = weatherConditions[0].getAttribute("weather-type");
			} else {
				arrFinalValue[i][2] = "";
			}
			k++;
			for ( var j = 0; k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				var time1 = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
				// We need to store days icon only for seven days forecast icon;
				if (time1 >= 11 && time1 <= 17 && currentDate1 != currentDate) {
					break;
				}

			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDIconIn24hFormat() : " + ex;
	}
	return arrFinalValue;
}

/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter operation : What kind of operations need to perform on
 * result array, i.e. Min, Max
 */
function readNDFDDataIn24hFormat(/* xml nodeList */timeLayout, /* xml nodeList */ param1, /* string */operation) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			arrFinalValue[i] = new Array(2);
			arrFinalValue[i][0] = formatDate(currentDate);
			arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
			k++;
			for ( var j = 0; k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				if (currentDate != currentDate1) {
					break;
				}
				if (operation == 'max') {
					// Only store maximum values
					if (parseInt(getIntNodeValues1(param1[k]), 10) > arrFinalValue[i][1]) {
						arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
					}
				} else if (operation == 'min') {
					// Only store minimum values
					if (parseInt(getIntNodeValues1(param1[k]), 10) < arrFinalValue[i][1]) {
						arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
					}
				}
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDDataIn24hFormat() : " + ex;
	}

	return arrFinalValue;
}

/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter (Wind) Param2 : NDFD Value Elements for Wind Direction
 */
function readNDFDWindDataIn24hFormat(/* xml nodeList */timeLayout, /*xml nodeList*/param1, /* xml nodeList */param2) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			arrFinalValue[i] = new Array(2);
			arrFinalValue[i][0] = formatDate(currentDate);
			arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
			arrFinalValue[i][2] = parseInt(getIntNodeValues1(param2[k]), 10);
			k++;
			for ( var j = 0; k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				if (currentDate != currentDate1) {
					break;
				}
				// Only store maximum values
				if (parseInt(getIntNodeValues1(param1[k]), 10) > arrFinalValue[i][1]) {
					arrFinalValue[i][1] = parseInt(getIntNodeValues1(param1[k]), 10);
					arrFinalValue[i][2] = parseInt(getIntNodeValues1(param2[k]), 10);
				}

			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDWindDataIn24hFormat() : " + ex;
	}
	return arrFinalValue;
}

/*
 * timeLayout : NDFD TimeLayout Elements Param1 : NDFD Value Elements for
 * specific parameter hoursformat : In what hours format we need to convert the
 * data (12/24)
 */
function readNDFDDataWWA(/* xml nodeList */timeLayout, /* xml nodeList */param1, /* integer */ hoursformat) {
	try {
		var arrFinalValue = new Array();
		var k = 0;
		var currentDate;
		var previousDate = "";
		var hazards;
		var hazardTextURLs;
		var warningString;

		for ( var i = 0; k < timeLayout.length; i++) {
			currentDate = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
			var time = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
			arrFinalValue[i] = new Array(2);
			arrFinalValue[i][0] = formatDate(currentDate);
			hazards = param1[k].getElementsByTagName("hazard");
			if (hazards.length > 0) {
				hazardTextURLs = hazards[0].getElementsByTagName("hazardTextURL");
				arrFinalValue[i][1] = hazards[0].getAttribute("phenomena") + ' ' + hazards[0].getAttribute("significance");
				arrFinalValue[i][2] = hazardTextURLs[0].textContent;
			} else {
				arrFinalValue[i][1] = "";
				arrFinalValue[i][2] = "";
			}
			k++;
			var nextTime = parseInt(time, 10) + hoursformat;
			for ( var j = 0, k = hoursformat * i; j < hoursformat && k < timeLayout.length; j++, k++) {
				var currentDate1 = timeLayout[k].childNodes[0].nodeValue.substring(0, 10);
				var time1 = parseInt(timeLayout[k].childNodes[0].nodeValue.substring(11, 13), 10);
				if (hoursformat == 12) {
					if (currentDate != currentDate1) {
						currentDate = currentDate1;
						nextTime = nextTime - hoursformat + 12;
					}
					if (time1 >= nextTime) {
						break;
					}
				} else if (hoursformat == 24) {
					if (currentDate != currentDate1) {
						break;
					}
				}
				if (arrFinalValue[i][1] == '') {
					hazards = param1[k].getElementsByTagName("hazard");
					if (hazards.length > 0) {
						hazardTextURLs = hazards[0].getElementsByTagName("hazardTextURL");
						arrFinalValue[i][0] = formatDate(currentDate);
						arrFinalValue[i][1] = hazards[0].getAttribute("phenomena")+ ' ' + hazards[0].getAttribute("significance");
						arrFinalValue[i][2] = hazardTextURLs[0].textContent;
					}
				}
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n readNDFDDataWWA() : " + ex;
	}

	return arrFinalValue;
}

//******************************************************************************************************************

//******************************************************************************************************************
//NDFD Data Collection and Insertion Functions
//******************************************************************************************************************

//Fetch Data from stations, web-service and the URL and insert these
//information into the database
function insertForecastData(tx) {
	try {
		// Fetch data from the sources,
		var dataFromStation = null;
		var dataFromNDFD = null;
		dataFromStation = getDataFromStation(defaultCity);
		if (dataFromStation != null) {
			dataFromNDFD = NDFDgen(defaultCity[2], defaultCity[3]);
			if (dataFromNDFD != null) {
				try {
					tx.executeSql("delete from ndfdData where FavoritesCityRowId = ?", [ defaultCity[0] ], null, sqlFail);
				} catch (ex) {
					errMessage = errMessage + "\n insertForecastData() : deleteNDFDData : " + ex;
				}
			} else {
				showErrorsToDev();
				return false;
			}
		} else {
			showErrorsToDev();
			return false;
		}

		var paramElement;
		var paramElement1;
		var paramValues;
		var paramValues1;
		var timeLayout;
		var nthTimeLayout;
		var startValidTime;

		paramElement = dataFromNDFD.getElementsByTagName("conditions-icon");
		timeLayout = paramElement[0].getAttribute("time-layout");
		nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
		startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
		paramValues = paramElement[0].getElementsByTagName("icon-link");
		paramValues1 = dataFromNDFD.getElementsByTagName("weather-conditions");
		var arrIcon12h = readNDFDIconIn12hFormat(startValidTime, paramValues,paramValues1);
		var arrIcon24h = readNDFDIconIn24hFormat(startValidTime, paramValues,paramValues1);

		paramElement = dataFromNDFD.getElementsByTagName("wind-speed");
		timeLayout = paramElement[0].getAttribute("time-layout");
		nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
		startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
		paramValues = dataFromNDFD.getElementsByTagName("wind-speed")[0].getElementsByTagName("value");
		paramValues1 = dataFromNDFD.getElementsByTagName("direction")[0].getElementsByTagName("value");

		var arrWind12h = readNDFDWindDataIn12hFormat(startValidTime,paramValues, paramValues1);
		var arrWind24h = readNDFDWindDataIn24hFormat(startValidTime,paramValues, paramValues1);

		var arrMaxTemp24h;
		var arrMinTemp24h;

		paramElement = dataFromNDFD.getElementsByTagName("temperature");
		for ( var i = 0; i < paramElement.length; i++) {
			var tempType = paramElement[i].getAttribute("type");
			if (tempType == "maximum") {
				timeLayout = paramElement[i].getAttribute("time-layout");
				nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
				startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
				paramValues = paramElement[i].getElementsByTagName("value");

				arrMaxTemp24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');
			} else if (tempType == "minimum") {
				timeLayout = paramElement[i].getAttribute("time-layout");
				nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
				startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
				paramValues = paramElement[i].getElementsByTagName("value");

				arrMinTemp24h = readNDFDDataIn24hFormat(startValidTime,paramValues, 'min');
			}
		}

		paramElement = dataFromNDFD.getElementsByTagName("probability-of-precipitation");
		timeLayout = paramElement[0].getAttribute("time-layout");
		nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
		startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
		paramValues = paramElement[0].getElementsByTagName("value");

		var arrPoP12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
		var arrPoP24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');

		var arrRain12h;
		var arrRain24h;
		var arrSnow12h;
		var arrSnow24h;

		paramElement = dataFromNDFD.getElementsByTagName("precipitation");
		for ( var i = 0; i < paramElement.length; i++) {
			var tempType = paramElement[i].getAttribute("type");
			if (tempType == "snow") {
				timeLayout = paramElement[i].getAttribute("time-layout");
				nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
				startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
				paramValues = paramElement[i].getElementsByTagName("value");

				arrSnow12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
				arrSnow24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');
			} else if (tempType == "liquid") {
				timeLayout = paramElement[i].getAttribute("time-layout");
				nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
				startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
				paramValues = paramElement[i].getElementsByTagName("value");

				arrRain12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
				arrRain24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');
			}
		}

		paramElement = dataFromNDFD.getElementsByTagName("humidity");
		timeLayout = paramElement[0].getAttribute("time-layout");
		nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
		startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
		paramValues = paramElement[0].getElementsByTagName("value");

		var arrHumidity12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
		var arrHumidity24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');

		var hazards = dataFromNDFD.getElementsByTagName("hazards");
		paramElement = hazards[0].getElementsByTagName("hazard-conditions");
		timeLayout = hazards[0].getAttribute("time-layout");
		nthTimeLayout = hazards[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
		startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");

		var arrWWA12h = readNDFDDataWWA(startValidTime, paramElement, 12);
		var arrWWA24h = readNDFDDataWWA(startValidTime, paramElement, 24);

		arrIcon12h = fillArray3(arrIcon12h, 4, '');
		arrIcon24h = fillArray3(arrIcon24h, 7, '');

		arrHumidity12h = fillArray2(arrHumidity12h, 4, 'number');
		arrHumidity24h = fillArray2(arrHumidity24h, 7, 'number');

		arrRain12h = fillArray2(arrRain12h, 4, 'number');
		arrRain24h = fillArray2(arrRain24h, 7, 'number');

		arrSnow12h = fillArray2(arrSnow12h, 4, 'number');
		arrSnow24h = fillArray2(arrSnow24h, 7, 'number');

		arrPoP12h = fillArray2(arrPoP12h, 4, 'number');
		arrPoP24h = fillArray2(arrPoP24h, 7, 'number');

		arrMaxTemp24h = fillArray2(arrMaxTemp24h, 7, 'number');
		arrMinTemp24h = fillArray2(arrMinTemp24h, 7, 'number');

		arrWind12h = fillArray3(arrWind12h, 4, 'number');
		arrWind24h = fillArray3(arrWind24h, 7, 'number');

		var arrWWA12h = fillArray3(arrWWA12h, 4, '');
		var arrWWA24h = fillArray3(arrWWA24h, 7, '');

		// Collect Data From Station for inserting and displaying Today's
		// Weather condition
		// *********************
		var lastupdated = getStrNodeValues(dataFromStation.getElementsByTagName("observation_time"));
		var location = getStrNodeValues(dataFromStation.getElementsByTagName("location"));
		var imgsrcdir = getStrNodeValues(dataFromStation.getElementsByTagName("icon_url_base"));
		var imgsrcfile = getStrNodeValues(dataFromStation.getElementsByTagName("icon_url_name"));
		var imgsrc = imgsrcdir + imgsrcfile;
		if (imgsrc == "") {
			imgsrc = getStrNodeValues(dataFromNDFD.getElementsByTagName("conditions-icon")[0].getElementsByTagName("icon-link"));
			if (imgsrc == "") {
				imgsrc = "Image not available";
			}
		}

		var currTemp = getIntNodeValues(dataFromStation.getElementsByTagName("temp_f"));
		var weather = getStrNodeValues(dataFromStation.getElementsByTagName("weather"));
		var windstr = getStrNodeValues(dataFromStation.getElementsByTagName("wind_string"));
		var wind = windstr.substring(0, windstr.indexOf("("));
		// *********************

		for ( var i = 0; i < 7; i++) {
			if (i == 0) {
				var rh = getIntNodeValues(dataFromStation.getElementsByTagName("relative_humidity"));
				if (rh == 0) {
					rh = arrHumidity24h[0][1];
				}
				if (imgsrc == 'Image not available')
					imgsrc = arrIcon24h[0][1];
				try {
					// Inserting information for Todays Weather Condition, in 24 hours format
					// Insert information for Today's Weather condition
					tx.executeSql("insert into ndfdData (ForecastDate, FavoritesCityRowId, TabItem, LastUpdated, CurrTemp, MinTemp, MaxTemp, PoP, Rain, RelativeHumidity, Snow, WeatherStatus, WeatherIcon, Wind, WWA, hazardTextURL)"
							+ " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ", [ arrIcon24h[0][0], defaultCity[0], 'Today', lastupdated, currTemp, arrMinTemp24h[0][1], arrMaxTemp24h[0][1], arrPoP24h[0][1], arrRain24h[0][1], rh, arrSnow24h[0][1], weather, changeWeatherIcon(imgsrc), wind, arrWWA24h[0][1], arrWWA24h[0][2] ], null, sqlFail);
				} catch (ex) {
					errMessage = errMessage + "\n : insertForecastData() : insert Current Weather Conditon Data : " + ex;
				}
				if (defaultCity[1] != 'My Location')
					location = defaultCity[1].substring(0, defaultCity[1].indexOf(',') + 4);
				else
					location = defaultCity[1];
				location = location + ' ' + (prefUnitOfTemp == 'F' ? (arrMaxTemp24h[0][1] + ' F') : (f2c(arrMaxTemp24h[0][1]) + ' C')) + ' / ' + (prefUnitOfTemp == 'F' ? (arrMinTemp24h[0][1] + ' F') : (f2c(arrMinTemp24h[0][1]) + ' C'));
				changeAppIcon(imgsrcfile, location);
			}
			if (i < 4) {
				try {
					tx.executeSql("insert into ndfdData (ForecastDate, FavoritesCityRowId, TabItem, LastUpdated, CurrTemp, MinTemp, MaxTemp, PoP, Rain, RelativeHumidity, Snow, WeatherStatus, WeatherIcon, Wind, WWA, hazardTextURL)"
							+ " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ", [arrIcon12h[i][0], defaultCity[0], 'ShortTerm', lastupdated, 0, arrMinTemp24h[i][1], arrMaxTemp24h[i][1], arrPoP12h[i][1], arrRain12h[i][1], arrHumidity12h[i][1], arrSnow12h[i][1], arrIcon12h[i][2], changeWeatherIcon(arrIcon12h[i][1]), arrWind12h[i][1] + 'mph ' + getWindDirection(arrWind12h[i][2]), arrWWA12h[i][1], arrWWA12h[i][2] ], null, sqlFail);
				} catch (ex) {
					errMessage = errMessage + "\n insertForecastData() : insert Short Term Data : " + ex;
				}
			}
			try {

				// Want to execute once for Today's Weather Condition
				// Inserting information for 7 Days Forecast, in 12 hours format

				// This is temporary solution for 7th day minimum temp.
				if (isNaN(arrMinTemp24h[i][1])) {
					arrMinTemp24h[i][1] = null;
				}
				if (isNaN(arrMaxTemp24h[i][1])) {
					arrMaxTemp24h[i][1] = null;
				}
				tx.executeSql("insert into ndfdData (ForecastDate, FavoritesCityRowId, TabItem, LastUpdated, CurrTemp, MinTemp, MaxTemp, PoP, Rain, RelativeHumidity, Snow, WeatherStatus, WeatherIcon, Wind, WWA, hazardTextURL)"
						+ " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ", [ arrIcon24h[i][0], defaultCity[0], '7Days', lastupdated, 0, arrMinTemp24h[i][1], arrMaxTemp24h[i][1], arrPoP24h[i][1], '', '', '', arrIcon24h[i][2], changeWeatherIcon(arrIcon24h[i][1]), arrWind24h[i][1] + 'mph ' + getWindDirection(arrWind24h[i][2]), arrWWA24h[i][1], arrWWA24h[i][2] ], null, sqlFail);
			} catch (ex) {
				errMessage = errMessage + "\n insertForecastData() : insert Seven Days Forecast Data : " + ex;
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n insertForecastData() : " + ex;
		alert("Failed to get data from the server. Please check your data connection and try again. Error Code : 116 ");
	}

	showErrorsToDev();
}

//Fetch Data from stations, web-service and the URL and insert these
//information into the database
//This method being called by background
function collectDataInBackground() {
	try {
		db.transaction(
				function (tx) {
					tx.executeSql("SELECT RowId, CityName, Latitude, Longitude, xmlFeedURL, LastVisited, LastUpdated FROM FavoritesCity where cityName != 'My Location'", null,
							function (tx, results) {
						for ( var x = 0; x < results.rows.length; x++) {
							var currentCity = new Array();
							var row = results.rows.item(x);
							currentCity[0] = row.RowId;
							currentCity[1] = row.CityName;
							currentCity[2] = row.Latitude;
							currentCity[3] = row.Longitude;
							currentCity[4] = row.xmlFeedURL;
							currentCity[5] = row.LastVisited;
							currentCity[6] = row.LastUpdated;
							// Fetch data from the sources,
							var dataFromStation = null;
							var dataFromNDFD = null;
							dataFromStation = getDataFromStation(currentCity);
							if (dataFromStation != null) {
								dataFromNDFD = NDFDgen( currentCity[2], currentCity[3]);
								if (dataFromNDFD != null) {
									try {
										tx.executeSql("delete from ndfdData where FavoritesCityRowId = ?", [ currentCity[0] ], null, sqlFail);
									} catch (ex) {
									}
								} else {
									continue;
								}
							} else {
								continue;
							}

							var paramElement;
							var paramElement1;
							var paramValues;
							var paramValues1;
							var timeLayout;
							var nthTimeLayout;
							var startValidTime;

							paramElement = dataFromNDFD.getElementsByTagName("conditions-icon");
							timeLayout = paramElement[0].getAttribute("time-layout");
							nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length,timeLayout.length - 1);
							startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
							paramValues = paramElement[0].getElementsByTagName("icon-link");
							paramValues1 = dataFromNDFD.getElementsByTagName("weather-conditions");

							var arrIcon12h = readNDFDIconIn12hFormat(startValidTime, paramValues, paramValues1);
							var arrIcon24h = readNDFDIconIn24hFormat(startValidTime, paramValues, paramValues1);

							paramElement = dataFromNDFD.getElementsByTagName("wind-speed");
							timeLayout = paramElement[0].getAttribute("time-layout");
							nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
							startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
							paramValues = dataFromNDFD.getElementsByTagName("wind-speed")[0].getElementsByTagName("value");
							paramValues1 = dataFromNDFD.getElementsByTagName("direction")[0].getElementsByTagName("value");

							var arrWind12h = readNDFDWindDataIn12hFormat(startValidTime, paramValues, paramValues1);
							var arrWind24h = readNDFDWindDataIn24hFormat(startValidTime, paramValues, paramValues1);

							var arrMaxTemp24h;
							var arrMinTemp24h;

							paramElement = dataFromNDFD.getElementsByTagName("temperature");
							for ( var i = 0; i < paramElement.length; i++) {
								var tempType = paramElement[i].getAttribute("type");
								if (tempType == "maximum") {
									timeLayout = paramElement[i].getAttribute("time-layout");
									nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length,timeLayout.length - 1);
									startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
									paramValues = paramElement[i].getElementsByTagName("value");

									arrMaxTemp24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');
								} else if (tempType == "minimum") {
									timeLayout = paramElement[i].getAttribute("time-layout");
									nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
									startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
									paramValues = paramElement[i].getElementsByTagName("value");

									arrMinTemp24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'min');
								}
							}

							paramElement = dataFromNDFD.getElementsByTagName("probability-of-precipitation");
							timeLayout = paramElement[0].getAttribute("time-layout");
							nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
							startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
							paramValues = paramElement[0].getElementsByTagName("value");

							var arrPoP12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
							var arrPoP24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');

							var arrRain12h;
							var arrRain24h;
							var arrSnow12h;
							var arrSnow24h;

							paramElement = dataFromNDFD.getElementsByTagName("precipitation");
							for ( var i = 0; i < paramElement.length; i++) {
								var tempType = paramElement[i].getAttribute("type");
								if (tempType == "snow") {
									timeLayout = paramElement[i].getAttribute("time-layout");
									nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
									startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
									paramValues = paramElement[i].getElementsByTagName("value");

									arrSnow12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
									arrSnow24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');
								} else if (tempType == "liquid") {
									timeLayout = paramElement[i].getAttribute("time-layout");
									nthTimeLayout = paramElement[i].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
									startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
									paramValues = paramElement[i].getElementsByTagName("value");

									arrRain12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
									arrRain24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');
								}
							}

							paramElement = dataFromNDFD.getElementsByTagName("humidity");
							timeLayout = paramElement[0].getAttribute("time-layout");
							nthTimeLayout = paramElement[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
							startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");
							paramValues = paramElement[0].getElementsByTagName("value");

							var arrHumidity12h = readNDFDDataIn12hFormat(startValidTime, paramValues, 'max');
							var arrHumidity24h = readNDFDDataIn24hFormat(startValidTime, paramValues, 'max');

							var hazards = dataFromNDFD.getElementsByTagName("hazards");
							paramElement = hazards[0].getElementsByTagName("hazard-conditions");
							timeLayout = hazards[0].getAttribute("time-layout");
							nthTimeLayout = hazards[0].getAttribute("time-layout").substring(timeLayout.length, timeLayout.length - 1);
							startValidTime = dataFromNDFD.getElementsByTagName("time-layout")[nthTimeLayout - 1].getElementsByTagName("start-valid-time");

							var arrWWA12h = readNDFDDataWWA(startValidTime, paramElement, 12);
							var arrWWA24h = readNDFDDataWWA(startValidTime, paramElement, 24);

							arrIcon12h = fillArray3(arrIcon12h, 4, '');
							arrIcon24h = fillArray3(arrIcon24h, 7, '');

							arrHumidity12h = fillArray2(arrHumidity12h, 4, 'number');
							arrHumidity24h = fillArray2(arrHumidity24h, 7, 'number');

							arrRain12h = fillArray2(arrRain12h, 4, 'number');
							arrRain24h = fillArray2(arrRain24h, 7, 'number');

							arrSnow12h = fillArray2(arrSnow12h, 4, 'number');
							arrSnow24h = fillArray2(arrSnow24h, 7, 'number');

							arrPoP12h = fillArray2(arrPoP12h, 4, 'number');
							arrPoP24h = fillArray2(arrPoP24h, 7, 'number');

							arrMaxTemp24h = fillArray2(arrMaxTemp24h, 7, 'number');
							arrMinTemp24h = fillArray2(arrMinTemp24h, 7, 'number');

							arrWind12h = fillArray3(arrWind12h, 4, 'number');
							arrWind24h = fillArray3(arrWind24h, 7, 'number');

							var arrWWA12h = fillArray3(arrWWA12h, 4, '');
							var arrWWA24h = fillArray3(arrWWA24h, 7, '');

							// Collect Data From Station for inserting and displaying Today's Weather condition
							var lastupdated = getStrNodeValues(dataFromStation.getElementsByTagName("observation_time"));
							var location = getStrNodeValues(dataFromStation.getElementsByTagName("location"));
							var imgsrcdir = getStrNodeValues(dataFromStation.getElementsByTagName("icon_url_base"));
							var imgsrcfile = getStrNodeValues(dataFromStation.getElementsByTagName("icon_url_name"));
							var imgsrc = imgsrcdir + imgsrcfile;
							if (imgsrc == "") {
								imgsrc = getStrNodeValues(dataFromNDFD.getElementsByTagName("conditions-icon")[0].getElementsByTagName("icon-link"));
								if (imgsrc == "") {
									imgsrc = "Image not available";
								}
							}

							var currTemp = (getIntNodeValues(dataFromStation.getElementsByTagName("temp_f")));
							var weather = getStrNodeValues(dataFromStation.getElementsByTagName("weather"));
							var windstr = getStrNodeValues(dataFromStation.getElementsByTagName("wind_string"));
							var wind = windstr.substring(0, windstr.indexOf("("));
							// *********************

							for ( var i = 0; i < 7; i++) {

								if (i == 0) {
									var rh = getIntNodeValues(dataFromStation.getElementsByTagName("relative_humidity"));
									if (rh == 0) {
										rh = arrHumidity24h[0][1];
									}
									if (imgsrc == 'Image not available')
										imgsrc = arrIcon24h[0][1];
									try {
										tx.executeSql("insert into ndfdData (ForecastDate, FavoritesCityRowId, TabItem, LastUpdated, CurrTemp, MinTemp, MaxTemp, PoP, Rain, RelativeHumidity, Snow, WeatherStatus, WeatherIcon, Wind, WWA, hazardTextURL)"
												+ " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",[arrIcon24h[0][0], currentCity[0], 'Today', lastupdated, currTemp, arrMinTemp24h[0][1], arrMaxTemp24h[0][1], arrPoP24h[0][1], arrRain24h[0][1], rh, arrSnow24h[0][1], weather, changeWeatherIcon(imgsrc), wind, arrWWA24h[0][1], arrWWA24h[0][2] ], null, sqlFail);
									} catch (ex) {
									}
								}
								if (i < 4) {
									try {
										tx.executeSql("insert into ndfdData (ForecastDate, FavoritesCityRowId, TabItem, LastUpdated, CurrTemp, MinTemp, MaxTemp, PoP, Rain, RelativeHumidity, Snow, WeatherStatus, WeatherIcon, Wind, WWA, hazardTextURL)"
												+ " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ", [arrIcon12h[i][0], currentCity[0], 'ShortTerm', lastupdated, 0, arrMinTemp24h[i][1], arrMaxTemp24h[i][1], arrPoP12h[i][1], arrRain12h[i][1], arrHumidity12h[i][1], arrSnow12h[i][1], arrIcon12h[i][2], changeWeatherIcon(arrIcon12h[i][1]), arrWind12h[i][1] + 'mph ' + getWindDirection(arrWind12h[i][2]), arrWWA12h[i][1], arrWWA12h[i][2] ], null, sqlFail);
									} catch (ex) {
									}
								}
								try {
									// This is temporary solution for 7th day minimum temp.
									if (isNaN(arrMinTemp24h[i][1])) {
										arrMinTemp24h[i][1] = null;
									}
									if (isNaN(arrMaxTemp24h[i][1])) {
										arrMaxTemp24h[i][1] = null;
									}
									tx.executeSql("insert into ndfdData (ForecastDate, FavoritesCityRowId, TabItem, LastUpdated, CurrTemp, MinTemp, MaxTemp, PoP, Rain, RelativeHumidity, Snow, WeatherStatus, WeatherIcon, Wind, WWA, hazardTextURL)"
											+ " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",[arrIcon24h[i][0], currentCity[0], '7Days', lastupdated, 0, arrMinTemp24h[i][1], arrMaxTemp24h[i][1], arrPoP24h[i][1], '', '', '', arrIcon24h[i][2], changeWeatherIcon(arrIcon24h[i][1]), arrWind24h[i][1] + 'mph ' + getWindDirection(arrWind24h[i][2]), arrWWA24h[i][1], arrWWA24h[i][2] ], null, sqlFail);
								} catch (ex) {
								}
							}

						} // for i

						if (!isBackground) {
							displayDataFromDB(tx);
						} else
							isDOMUpdated = true;

						tx.executeSql("SELECT FavoritesCity.RowId, FavoritesCity.CityName, ndfdData.WeatherIcon, ndfdData.MinTemp, ndfdData.MaxTemp, ndfdData.WWA, ndfdData.hazardTextURL FROM FavoritesCity, ndfdData where ndfdData.FavoritesCityRowId = FavoritesCity.RowId and FavoritesCity.LastVisited = 1 and ndfdData.TabItem='Today';", null,
								function (tx,results) {
							if (results.rows.length > 0) {
								var row = results.rows.item(0);
								var citytext = row.CityName;
								if (citytext != 'My Location')
									citytext = citytext.substring(0, citytext.indexOf(',') + 4);

								citytext = citytext + ' ' + (prefUnitOfTemp == 'F' ? (row.MaxTemp + ' F') : (f2c(row.MaxTemp) + ' C')) + ' / ' + (prefUnitOfTemp == 'F' ? (row.MinTemp + ' F') : (f2c(row.MinTemp) + ' C'));
								changeAppIcon(row.WeatherIcon, citytext);
								if (prefAlertOnSevereWeather == 1) {
									if (row.WWA != "" && row.WWA != null) {
										if (showSevereWeatherDialog) {
											showSevereWeatherDialog = false;
											alert("[Weather] : [" + row.CityName + "] having " + row.WWA);
										}
									}
								}
							}
						}, sqlFail);
					}, sqlFail);
				}, txFail);
	} catch (ex) {
	}
}

//******************************************************************************************************************

//******************************************************************************************************************
//User's Action related Functions 
//******************************************************************************************************************

/*
 * Add a Row in specified table, and insert values in respective columns 
 * Called in Settings Tab, when user adds favorites city 
 */
function addRow(/*string*/cityName, /*integer*/dbRowNumber, /*string*/ tempString, /*string*/imagePath) {
	try {
		var node = cityTemplate.cloneNode(true);

		// Set the city name and current weather text.
		var spans = node.getElementsByTagName("span");
		spans[0].innerHTML = cityName;
		if (tempString)
			spans[1].innerHTML = "Current Weather: " + tempString;

		// Set the weather icon.
		if (imagePath)
			node.getElementsByTagName("img")[0].src = imagePath;

		// Set the attributes (e.g. id).
		node.id = "delete" + dbRowNumber;
		node.rowId = dbRowNumber;
		node.cityName = cityName;

		// Add the node to the table.
		cityParent.appendChild(node);
	} catch (ex) {
		errMessage = errMessage + "\n addRow() : " + ex;
	}
}

/*
 * We are tracking this method for "onclick" event of city, which is listed in Manage Locations Screen
 * Since we are not aware how to select an option in touch device, when we tries to select the device then it throws click event on touch device
 * And we dont have any other way to delete the selected city other than Menu Item (Menu->Delete City , in manage locations screen), 
 * Since we need to delete the city from Menu Item (Menu->Delete City , in manage locations screen), we can tract the selected city in non-touch device,
 * But we dont have any other choice for touch device, so that we are popping up a popup and asking user's response.
 */
function navigateToCity(/*HTML Element*/selection) {
	try {
		if (selectedLocation != selection) {
			setSelectedIndex(selection);
			return;
		} else {
			db.transaction( function (tx) {
				getDefaultCityByRowId(tx, selection.rowId);
			}, txFail, function() {
				db.transaction( function (tx) {
					displayDataFromDB(tx);
				}, txFail, function() {
					activateTodayTab();			//Activate Today's Tab
					createMainMenu();			// Create menu items
				});
			});
		}
	} catch (ex) {
		errMessage = errMessage + "\n navigateToCity() : " + ex;
	}
}

//******************************************************************************************************************

//******************************************************************************************************************
//Run Application in Background related Functions 
//******************************************************************************************************************

blackberry.app.event.onBackground(handleBackground);
blackberry.app.event.onForeground(handleForeground);

function changeRefreshRate() {
	clearInterval(interval);
	interval = setInterval(collectDataInBackground, timeBetweenUpdates());
}

function handleBackground() {
	isBackground = true;
	isDOMUpdated = false;
}

function handleForeground() {
	isBackground = false;
	if (isDOMUpdated)
		db.transaction( function (tx) {displayDataFromDB(tx);}, txFail);
}

/* *** *** *** *** *** APPLICATION-SPECIFIC FUNCTIONS *** *** *** *** *** */

/*
 * Determines how long to wait before starting the next update.
 * (This function will be called when this page loads).
 * 
 * Returns - The time to wait (in milliseconds).
 *  
 */
function timeUntilNextUpdate() {
	return 10000;
}

/*
 * Determines the standard interval between updates.
 * (This will be called after the first update).
 * 
 * Returns - the time between updates (in milliseconds).
 */
function timeBetweenUpdates() {
	//	return (1000 * 60 * prefRefreshRate) ;
	return (1000 * 60 * 60 * prefRefreshRate);
}

//******************************************************************************************************************

function setPercent(gauge, percent) {
	var percentValue = percent / 100;
	var gaugeWidth = percentValue * gauge.parentNode.clientWidth;
	gauge.style.width = gaugeWidth + 'px';
}

function showErrorsToDev() {
	if (isDebugMode) {
		if (errMessage.length > 0) {
			alert(errMessage);
			errMessage = "";		// clear message once shown to prevent repeat showings
		}
	}
}

//******************************************************************************************************************
//From Tim's UI Examples
//******************************************************************************************************************
function ddlDoSelect(id) {
	resetImages();
	var button = document.getElementById(id);
	button.style.backgroundPosition = 'bottom right';
	button.firstChild.style.backgroundPosition = 'bottom left';
}

function evaluateYesNo(id) {
	var element = document.getElementById(id);
	if (element.src.indexOf('/yes') > -1)
		return true;
	else
		return false;
}

function doYesNoClick(id) {
	try {
		isViewDirty = true;
		resetImages();

		element = document.getElementById(id);
		if (element.src.indexOf('images/yes') > -1) {
			element.src = 'images/noSel.png';
		} else if (element.src.indexOf('images/no') > -1) {
			if (id == 'UseMyLocation') {
				if (blackberry.system.hasCapability("location.gps"))
					element.src = 'images/yesSel.png';
				else
					alert('Your phone does not support GPS.');
			} else {
				element.src = 'images/yesSel.png';
			}
		}
	} catch (ex) {
		errMessage = errMessage + "\n doYesNoClick() : " + ex;
	}
}

function doYesNoSelect(id) {
	try {
		if (blackberry.focus) {
		    if (blackberry.focus.getFocus() != id)
			return;
	}
		resetImages();

		element = document.getElementById(id);
		if (element.src.indexOf('/yes.png') > -1) {
			element.src = 'images/yesSel.png';
		} else if (element.src.indexOf('/no.png') > -1) {
			element.src = 'images/noSel.png';
		}
	} catch (ex) {
		errMessage = errMessage + "\n doYesNoSelect() : " + ex;
	}
}

function doYesNoUnSelect(element) {
	if (element.src.indexOf('images/yes') > -1)
		element.src = 'images/yes.png';
	else if (element.src.indexOf('images/no') > -1)
		element.src = 'images/no.png';
}

function resetImages() {
	var ddlRefreshRate = document.getElementById('refreshRate');
	ddlRefreshRate.style.backgroundPosition = 'top right';
	ddlRefreshRate.firstChild.style.backgroundPosition = 'top left';
	var saveButton = document.getElementById('btnSave');
	saveButton.style.backgroundPosition = 'top right';
	saveButton.firstChild.style.backgroundPosition = 'top left';
	doYesNoUnSelect(document.getElementById('severeweather'));
	doYesNoUnSelect(document.getElementById('UseMyLocation'));
}

//******************************************************************************************************************

function parseStringIntoValidXML(xmlString) {
	xmlString = xmlString.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
	return xmlString;
}

function selectButton(/*HTMLElement*/span) {
	var button = span.getElementsByTagName("input")[0];
	button.checked = true;
	selectedMeasureUnit = button.value;
	isViewDirty = true;
	if (blackberry.focus) {
		blackberry.focus.setFocus(selectedMeasureUnit);
	}
}
