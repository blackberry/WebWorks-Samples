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

function generate()
{
	try
	{
		var dt = new Date();
		var s = "<p>" + dt.toString() + "<br/><br/>";
		for (var i=0;i<10;i++) {
			s += Math.random() + "<br/>";
		}
		s += "</p><hr/>";
		document.getElementById("numbers").innerHTML += s;
	} 
	catch(e) {
		debug.log("generate", e, debug.exception);
	}
}
