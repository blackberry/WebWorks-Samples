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

function doPageLoad()
{
	var ele = document.getElementById("screenInfo");
	if (ele)
	{
		var screenInfo = "<h3>Current Screen:</h3>";
		screenInfo += "<table cellspacing='5' width='25%'>";
		screenInfo += "<tr><th>screen.availHeight</th><td>" + screen.availHeight  + "</td></tr>";
		screenInfo += "<tr><th>screen.availWidth</th><td>"  + screen.availWidth + "</td></tr>";
		screenInfo += "<tr><th>screen.height</th><td>"      + screen.height + "</td></tr>";
		screenInfo += "<tr><th>screen.width</th><td>"       + screen.width + "</td></tr>";
		screenInfo += "<tr><th>window.innerHeight</th><td>" + window.innerHeight + "</td></tr>";
		screenInfo += "<tr><th>window.innerWidth</th><td>"  + window.innerWidth  + "</td></tr>";
		screenInfo += "<tr><th>screen.colorDepth</th><td>"  + screen.colorDepth + "</td></tr>";
		screenInfo += "<tr><th>screen.pixelDepth</th><td>"  + screen.pixelDepth + "</td></tr>";
		ele.innerHTML = screenInfo;
	}
}

window.addEventListener("load", doPageLoad, false);