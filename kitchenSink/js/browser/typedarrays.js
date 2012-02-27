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
 
function isNotSupported(id) {
	document.getElementById(id.toLowerCase()).innerHTML = id + " is not supported by this application.";
}
function runArrayTest(id) {
	var arr;
	var arrCopy;
	var size = 10000000;	//100M

	var sb, i, l, start, val = 0;

	try {

		//First - create the desired array type:
		switch(id.toLowerCase()) {
			case "float32array":
				if ((typeof Float32Array) === "undefined") {
					isNotSupported(id);
					return false;
				}
				arr = new Float32Array(size);
				arrCopy = new Float32Array(arr.length);
				break;
			case "int8array":
				if ((typeof Int8Array) === "undefined") {
					isNotSupported(id);
					return false;
				}
				arr = new Int8Array(size);
				arrCopy = new Int8Array(arr.length);
				break;
			case "uint8array":
				if ((typeof Uint8Array) === "undefined") {
					isNotSupported(id);
					return false;
				}
				arr = new Uint8Array(size);
				arrCopy = new Uint8Array(arr.length);
				break;
			case "array":
				if ((typeof Array) === "undefined") {
					isNotSupported(id);
					return false;
				}
				arr = new Array(size);
				arrCopy = new Array(arr.length);
				break;
			default:
				alert("Unknown array type: " + id);
		}
		
		//Run the performance tests:
		sb = new StringBuilder("Results (ms) for " + id + " size " + size + " :");
		sb.append("<ul>");
		
		start = new Date();
		for(i = 0, l = arr.length; i < l; i = i + 1)
		{
			arr[i] = 0.1234567890123456;	//update ever index in the array
		}
		sb.append("<li>Write: " + ( + new Date() - start ) + "</li>");
		
		
		start = new Date();
		for(i = 0, l = arr.length; i < l; i = i + 1)
		{
			val = arr[i];		//read from every index in the array
		}
		sb.append("<li>Read: " + ( +new Date() - start ) + "</li>");

		
		
		start = new Date();
		for(i = 0, l = arr.length; i < l; i = i + 1)
		{
			arrCopy[i] = arr[i];
		}
		sb.append("<li>Loop Copy: " + ( + new Date() - start ) + "</li>");

		sb.append("</ul>");
		document.getElementById(id.toLowerCase()).innerHTML = sb.toString();
	
	} 
	catch (e)
	{
		debug.log("runArrayTest", e, debug.exception);
	}
}

function doPageLoad(event) {
	runArrayTest("Float32Array");
	runArrayTest("Int8Array");
	runArrayTest("Uint8Array");
	runArrayTest("Array");
}

window.addEventListener("load", doPageLoad, false);