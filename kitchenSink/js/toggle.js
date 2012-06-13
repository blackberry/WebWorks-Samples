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
 var ROOT = (window.blackberry === undefined) ? (window.location.origin + "/kitchenSink/") : "/";
 
 
 function expandSection(parentId, targetId) {
	var targetEle, parentEle, minusIcon, icon;

	targetEle = document.getElementById(targetId);
	parentEle = document.getElementById(parentId);

	if (targetEle && parentEle) {
		//Collapse the section:
		targetEle.style.display = '';

		//Remove the old 'expand' icon:
		minusIcon = parentEle.getElementsByTagName("img")[0];
		parentEle.removeChild(minusIcon);

		//Add the new 'collapse' icon:
		icon = new Image();
		icon.src = ROOT + "img/minimize.png";
		icon.addEventListener("click", function (e) { collapseSection(parentId, targetId); }, false);
		parentEle.appendChild(icon);
	}
}

function collapseSection(parentId, targetId) {
	var targetEle, parentEle, minusIcon, icon;

	targetEle = document.getElementById(targetId);
	parentEle = document.getElementById(parentId);

	if (targetEle && parentEle) {
		//Collapse the section:
		targetEle.style.display = 'none';

		//Remove the old 'collapse' icon:
		minusIcon = parentEle.getElementsByTagName("img")[0];
		parentEle.removeChild(minusIcon);

		//Add the new 'expand' icon:
		icon = new Image();
		icon.src = ROOT + "img/maximize.png";
		icon.addEventListener("click", function (e) { expandSection(parentId, targetId); }, false);
		parentEle.appendChild(icon);
	}
}
