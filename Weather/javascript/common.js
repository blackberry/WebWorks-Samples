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
blackberry.app.event.onExit(handleExit);
var isBackground = false;

function handleExit() {
	if(isViewDirty)
	{
		if (confirm ("Are you sure you wish to continue without saving information?"))
		{
			document.getElementById('divSettings').style.display = 'none';
			isViewDirty = false;
			createMainMenu();
			activateTodayTab();
		}
	}
	else if (document.getElementById('divSettings').style.display == 'block')
	{
		document.getElementById('divSettings').style.display = 'none';
		createMainMenu();
		activateTodayTab();
	}
	else if (document.getElementById('divManageLocation').style.display == 'block')
	{
		db.transaction(function (tx) {tx.executeSql("SELECT * FROM FavoritesCity Where CityName != ?;",['My Location'], handleCCount, sqlFail);});

		function handleCCount(tx, results) {
			if ((results.rows.length <= 0) && (prefMyLocation == 0))
			{
				if (confirm ("Are you sure you wish to exit from the application without entering any city / location?"))
				{
					//Change to default App Icon and App Text
					changeAppIcon('sunny.jpg', 'Weather');
					blackberry.app.exit();
				}
				else
				{
					return false;
				}
			}
			if (favoriteCities.length > 1)
			{
				document.getElementById('imgPreviousCity').style.display = 'block';
				document.getElementById('imgNextCity').style.display = 'block';
			}
			else
			{
				document.getElementById('imgPreviousCity').style.display = 'none';
				document.getElementById('imgNextCity').style.display = 'none';
			}
			document.getElementById('divManageLocation').style.display = 'none';
			createMainMenu();
			displayDataFromDB(tx);
			activateTodayTab();
		}
	}
	else if (document.getElementById('divAddLocation').style.display == 'block')
	{
		document.getElementById('divAddLocation').style.display = 'none';
		miManageLocation();
	}
	else
	{
		blackberry.app.requestBackground();
	}
}





