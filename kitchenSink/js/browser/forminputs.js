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

function validate() {
	var txt, mtr, pas, prg, msg, ele;
	
	//User has clicked on the 'Submit' button
	txt = document.getElementById("txtText");
	mtr = document.getElementById("mtMeter");
	pas = document.getElementById("txtPassword");
	prg = document.getElementById("prgProgress");
	//...
	msg = "";
	if (txt.value === "") {
		msg += "The text field is blank";
	}
	if (pas.value === "") {
		msg += "The password field is blank";
	}
	// ...
	ele = document.getElementById("output");
	if (msg === "") {
		ele.innerHTML = "No validation errors";
		ele.className = "okay";
	}
	else {
		ele.innerHTML = msg;
		ele.className = "error";
	}
}