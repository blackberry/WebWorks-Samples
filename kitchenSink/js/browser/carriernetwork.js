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
	try
	{	
		var sb = new StringBuilder();

		if ((window.navigator === undefined) || (window.navigator.device === undefined) || (window.navigator.device.network === undefined))
		{
			sb.append("<i>The <b>navigator.device.network</b> object is undefined (Likely cause is not supported by this Web engine).</i>");
			setContent("carrierInfo", sb.toString());
			return false;
		}
		
		
		if (navigator.device.network.HomeCarrier)
		{
			sb.append("<p><b>Home Carrier</b>: " +  navigator.device.network.HomeCarrier + "</p>");
		} 
		else {
			sb.append("<p><i>The <b>navigator.device.network.HomeCarrier</b> object is undefined (Likely cause is not supported by this Web engine).</i></p>");
		}
		
		if (navigator.device.network.CurrentCarrier)
		{
			sb.append("<p><b>Current Carrier</b>: " +  navigator.device.network.CurrentCarrier + "</p>");
		} 
		else {
			sb.append("<p><i>The <b>navigator.device.network.HomeCarrier</b> object is undefined (Likely cause is not supported by this Web engine).</i></p>");
		}
	
		setContent("carrierInfo", sb.toString());
		
	} 
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}
		
window.addEventListener("load", doPageLoad, false);