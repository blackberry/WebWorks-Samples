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
//Pre-load our images for hover effects
image3 = new Image();
image3.src =  'images/settings/no.png';
image4 = new Image();
image4.src = 'images/settings/noSel.png';
image5 = new Image();
image5.src = 'images/settings/off.png';
image6 = new Image();
image6.src = 'images/settings/offSel.png';
image7 = new Image();
image7.src = 'images/settings/on.png';
image8 = new Image();
image8.src =  'images/settings/onSel.png';	
image9 = new Image();
image9.src =  'images/settings/yes.png';
image10 = new Image();
image10.src =  'images/settings/yesSel.png';

var dirty = false;
var isProfileLoaded = false;
var promptPanel = null;
var mainPanel = null;
var buttonsPanel = null;

/*
 * Override the back button, since the default takes us back a page, which will
 * just send us back here if there are no feeds enabled. 
 */
blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, handleBack);
function handleBack() {

	try {
		if (dirty) {
			if (confirm ("Are you sure you wish to continue without saving information?"))
			{
				selectCancel();
				return;
			}
			return;
		}
		else {
			keyInvoker.inject.escapeKey();
		}
	} catch (e) {alert(e);}

}

/* 
 * Callback function for handling database errors
 */
function handleDatabaseError(e){
	alert("Database Error: " + e.message);
}

/*
 * Callback function for handling a successful save
 */
function handleSuccessfulSave(){
	dirty = false;
	keyInvoker.inject.escapeKey();
}

/*
 * Initialize the page contents.
 */
function initManageSettingsScreen() {
	if (blackberry.ui.menu.getMenuItems().length > 0) {
		blackberry.ui.menu.clearMenuItems();
	}

	blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 0x44001, "Save", selectSave));
	blackberry.ui.menu.addMenuItem(new blackberry.ui.menu.MenuItem(false, 0x44002, "Cancel", selectCancel));

	// Load the current settings from the database.
	getProfile();
}

/*
 * Correctly highlight only the button with the current focus
 */
function doSelect(nameButton) {
	resetAllImages();

	var button = document.getElementById(nameButton);
	switch(nameButton)
	{
	case 'btnCancel':
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = '-10px -39px';
		break;
	case 'btnSave':
	case 'btnDownload':
	case 'btnRefresh':
	case 'promptSave':
	case 'promptDiscard':
	case 'promptCancel':
		button.style.backgroundPosition = 'bottom right';
		button.firstChild.style.backgroundPosition = 'bottom left';
		break;
	}//end switch
}

/*
 * Convert the current the control's image to a boolean
 */
function evaluateYesNo(id) {
	var element = document.getElementById(id);
	if (element.src.indexOf('/yes') > -1)
		return true;
	else if (element.src.indexOf('/on') > -1)
		return true;
	else
		return false;
}

/*
 * swap the images according to users input
 */
function doYesNoClick(id) {
	resetAllImages();
	var element = document.getElementById(id);
	if (element.src.indexOf('images/settings/yes') > -1)
		element.src = 'images/settings/noSel.png';
	else if (element.src.indexOf('images/settings/on') > -1)
		element.src = 'images/settings/offSel.png';
	else if (element.src.indexOf('images/settings/no') > -1)
		element.src = 'images/settings/yesSel.png';
	else if (element.src.indexOf('images/settings/off') > -1)
		element.src = 'images/settings/onSel.png';
	// Only flip the 'dirty' switch if the profile has already been loaded
	if (isProfileLoaded) {
		dirty = true;
	}
}

/*
 * handle losing the focus
 */
function doYesNoUnselect(element) {
	if (element.src.indexOf('images/settings/yes') > -1)
		element.src = 'images/settings/yes.png';
	else if (element.src.indexOf('images/settings/on') > -1)
		element.src = 'images/settings/on.png';
	else if (element.src.indexOf('images/settings/off') > -1)
		element.src = 'images/settings/off.png';
	else if (element.src.indexOf('images/settings/no') > -1)
		element.src = 'images/settings/no.png';
}

/*
 * handle getting the focus
 */
function doYesNoSelect(id) {
	if (blackberry.focus.getFocus() != id)
		return;
	resetAllImages();

	var element = document.getElementById(id);
	if (element.src.indexOf('/yes.png') > -1)
		element.src = 'images/settings/yesSel.png';
	else if (element.src.indexOf('/on.png') > -1)
		element.src = 'images/settings/onSel.png';
	else if (element.src.indexOf('/off.png') > -1)
		element.src = 'images/settings/offSel.png';
	else if (element.src.indexOf('/no.png') > -1)
		element.src = 'images/settings/noSel.png';
}

/*
 * reset all images on the form to unfocused
 */
function resetAllImages() {
//	var btnDownload = document.getElementById('btnDownload');
//	btnDownload.style.backgroundPosition = 'top right';
//	btnDownload.firstChild.style.backgroundPosition = 'top left';

	var btnRefresh = document.getElementById('btnRefresh');
	btnRefresh.style.backgroundPosition = 'top right';
	btnRefresh.firstChild.style.backgroundPosition = 'top left';

	doYesNoUnselect(document.getElementById('alertNew'));

	var button = document.getElementById('btnSave');
	button.style.backgroundPosition = 'top right';
	button.firstChild.style.backgroundPosition = 'top left'; 

	var button = document.getElementById('btnCancel');
	button.style.backgroundPosition = 'top right';
	button.firstChild.style.backgroundPosition = '-10px 0px';
}

/*
 * set the download options setting
 */
function setDownloadSettings(intAsk){
	var currentSelection = "";
	currentSelection = document.getElementById("lblDownload").innerHTML;
	var oldChoice = convertDownloadTextToIndex(currentSelection);
	var optionList = ["Headers Only", "All Content"];
	var indexChoice = 0;

	if (typeof(intAsk) != "undefined") {
		indexChoice = intAsk;
	} else {//TODO: remove dialog
//		indexChoice = blackberry.ui.dialog.customAsk("Select a download option:", optionList, oldChoice);
	}
	if (optionList[indexChoice] != currentSelection)
	{
		document.getElementById("lblDownload").innerHTML = optionList[indexChoice];
		// Only flip the 'dirty' switch if the profile has already been loaded
		// and the user selected a different option
		if (isProfileLoaded && indexChoice != oldChoice) {
			dirty = true;
		}
	}
}

/*
 * set the refresh every setting
 */
function setRefreshSettings(intAsk){	
	document.getElementById("lblRefresh").innerHTML = intAsk + ' hours';
}

/*
 * handle the cancel button's click event
 */
function selectCancel() {
	resetAllImages();
	dirty = false;
	keyInvoker.inject.escapeKey();
}

/*
 * handle the save button's click event
 */
function selectSave() {
	resetAllImages();
	try{
		if (dirty)
		{
			var selectedButton = 'btnSave';
			doSelect(selectedButton);
//			var downloadType = convertDownloadTextToIndex(document.getElementById("lblDownload").innerHTML);
			var refreshRate = convertRefreshTextToHours(document.getElementById("lblRefresh").innerHTML);
			var myAlert = evaluateYesNo("alertNew");
			setProfile({refreshRate: refreshRate, alert: myAlert});
		}
	}//end try
	catch(e){
		alert("error: " + e);
	}
}

function convertDownloadTextToIndex(strLabel) {
	switch (strLabel) {
	case "Headers Only":
		return 0;
	case "All Content":
		return 1;
	default:
		return -1;
	}
}

function convertRefreshTextToHours(strLabel) {
	switch (strLabel) {
	case "2 hours":
		return 2;
	case "6 hours":
		return 6;
	case "12 hours":
		return 12;
	case "24 hours":
		return 24;
	default:
		return -1;
	}
}

/*
 * Gets the current Profile settings.
 * 
 * Returns: A Profile object (with the following attributes):
 *		downloadType - int.  0 = headers only; 1 = full content.
 *		refreshRate - int.  Number of hours between refreshes.
 *		alert - boolean.  True means the user wants to be notified whenever there is new content.
 *		dirty - boolean.  This is true if this is an unsaved, profile update.
 */
function getProfile()
{
	//setDownloadSettings(profile.downloadType);
	setRefreshSettings(userRefreshRate);
	var element = document.getElementById("alertNew");
	if (sendAlerts) {
		element.src = 'images/settings/yes.png';
	} else {
		element.src = 'images/settings/no.png';
	}
	dirty = false;
	isProfileLoaded = true;
}

/*
 * Sets all of the Profile options.
 *
 * args: Object - The arguments object which should contain the following attributes:
// *		downloadType: int - The new value for the download type.
 *		refreshRate: int - The new value for the refresh rate.
 *		alert: boolean - The new value for the alert flag. 
 */
function setProfile(/*Object*/ args) {	
	try {
		db.transaction(function(tx){
			tx.executeSql("UPDATE Profile SET refreshRate=?, alert=?", [args.refreshRate, args.alert ? 1:0], null, function(tx, error){alert(error.message);});
		}, function(error){alert(error.message);}, handleSuccessfulSave);
	}catch(e){alert(e);}
}


/*
 * Generate a popup for asking user's response on Refresh Rate option
 * (Menu->Settings->Refresh Rate)
 */
function openRefreshRateDialog() {
	var selectedValue = 0,
        elementText,
        arrRefreshRates = [],
        rowHeight,
        visibleRows,
        options;
    
    try {
		doSelect('btnRefresh');		
		
        dirty = true;

		elementText = document.getElementById("lblRefresh").innerHTML;
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

		// Configure our spinner
		arrRefreshRates[0] = "2 hours";
		arrRefreshRates[1] = "6 hours";
		arrRefreshRates[2] = "12 hours";
		arrRefreshRates[3] = "24 hours";

        if (screen.height < 480) {
            rowHeight = 60;
            visibleRows = 3;
        } else {
            rowHeight = 75;
            visibleRows = 4;
        }
        
        options = {
            'title' : "Select a refresh interval :",
            'rowHeight': rowHeight,
            'visibleRows': visibleRows,
            'selectedIndex': selectedValue,
            'items' : arrRefreshRates
        };
    
        // Open the spin dialog
        blackberry.ui.Spinner.open(options,
            function (refreshRateChoice) {
                if (refreshRateChoice != undefined) {
                    document.getElementById("lblRefresh").innerHTML = arrRefreshRates[refreshRateChoice];
                } else {
                    document.getElementById("lblRefresh").innerHTML = arrRefreshRates[selectedValue];
                }
            }
        );
		
	} catch (ex) {
		errMessage = errMessage + "\n openRefreshRateDialog() : " + ex;
	}
}