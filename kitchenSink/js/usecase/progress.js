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

var currentProgress = 0;
var progressInterval = null;

var activityInterval = null;
var activityDuration = 0;

/* Display a dialog with a count-down timer.  Gives user an estimated time to complete an action. */
function hideActivityIndicator()
{
	document.getElementById("activityIndicator").className = "hide";
}
function displayCurrentActivity()
{
	var ele = document.getElementById("activityIndicator");
	if (ele)
	{
		ele.className = "activity";
		ele.innerHTML = "Loading: " + Math.round(activityDuration,0) + " seconds remaining ...";
	}
}
function updateActivityIndicator()
{
	activityDuration = activityDuration - 1;
	displayCurrentActivity();
	if (activityDuration <= 0)
	{
		window.clearInterval(activityInterval);
		hideActivityIndicator();
	}
}
function beginActivityIndicator()
{
	activityDuration = parseInt(document.getElementById("txtDuration").value);
	displayCurrentActivity();
	activityInterval = window.setInterval(updateActivityIndicator, 1000);
}




/* Display a meter bar that increments by 1/10 every 100ms */
function updateProgress()
{
	currentProgress += 10;
	document.getElementById("level").style.width = currentProgress + "%";
	if (currentProgress >= 100)
	{
		window.clearInterval(progressInterval);
		currentProgress = 0;
	}
}
function showProgress()
{
	progressInterval = window.setInterval(updateProgress, 100);
}

function doPageLoad()
{
	document.getElementById("level").style.width = currentProgress + "%";
}
window.addEventListener("load", doPageLoad, false);