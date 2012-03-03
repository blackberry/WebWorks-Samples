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

function recurseObject(obj)  {
	var msg = "<ol>", i, objType, objValue;
	
	try  {
		// Go through all the properties of the passed-in object
		
			for (i in obj) {
				if (i) {
					objType = (typeof obj[i]);
					objValue = " = " + obj[i];
					if ((objType === "object") || (objType === "function")) {
						objValue = "";
					}

					msg += "<li>";
					msg += i + objValue + " [" + objType + "]";
					if (typeof obj[i] === "object") {
						msg += recurseObject(obj[i]);
					} else {
						msg += "</li>";
					}
				}
			}
	} 
	catch (e) {
		debug.log("recurseObject", e, debug.exception);
	}
   msg += "</ol>";
   return msg;
}

function displayObjects() {
	try {
		var ele, objName, obj;
		
		ele = document.getElementById("txtObject");
		if (ele) {
			objName = ele.value;
			obj = eval(objName);
			document.getElementById("dynProp").innerHTML = "<ol><li>" + obj + " [object]" + recurseObject(obj) + "</li></ol>";
		}
	} 
	catch (e) {
		debug.log("displayObjects", e, debug.exception);
	}
}
