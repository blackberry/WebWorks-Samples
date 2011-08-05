/* Copyright 2010-2011 Research In Motion Limited.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//Variables/methods defined elsewhere.
/*global $, createWeatherForecast, getForecastAverage*/

/**
 * Initializes our dock based on our generated weather forecasts.
 */
$(document).ready(function() {
	//Initialize weather forecast.
	createWeatherForecast();
	var arr = getForecastAverage();

	//Translate weather type data to CSS.
	for(var j = 0; j < arr.length; ++j){

		$("#day" + j + "temp").html(arr[j][0]+"&deg;");
		$("#day" + j + "name").html(arr[j][2]);
		
		switch(arr[j][1]){
			case 'cloudy':
				$("#day" + j + "bg").addClass("panel-weather-type-cloudy");
				break;
			case 'rainy':
				$("#day" + j + "bg").addClass("panel-weather-type-rainy");
				break;
			case 'thundery':
				$("#day" + j + "bg").addClass("panel-weather-type-thunder");
				break;
			case 'fine':
				$("#day" + j + "bg").addClass("panel-weather-type-sunny");
				break;
		}
	}
});