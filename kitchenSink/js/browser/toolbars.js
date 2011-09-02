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

function setOrientation()
{
	//TODO: Calculate the 'right' header and footer heights for the current orientation/perspective.
	//	use hardcoded values for now.
	var headerHeight = 50, footerHeight = 50;

	//set the height of the header:
	var header = document.getElementById("header");
	if (header)
	{
		header.style.height = headerHeight + "px";
	}		
	//set the height of the content panel
	var content = document.getElementById("content");
	if (content)
	{
		content.style.height = (window.innerHeight - headerHeight - footerHeight) + "px";
	}
	//set the height of the footer:
	var footer = document.getElementById("footer");
	if (footer)
	{
		footer.style.height = footerHeight + "px";
	}			
}

window.addEventListener("orientationchange", setOrientation, false);
window.addEventListener("load", setOrientation, false);