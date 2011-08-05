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
/*global DateObj, WeatherForecastObj, WeatherHourObj*/

/**
 * Variables related to the predicted weather, location we are at, and days of the week; respectively.
 */
var weatherForecast	= null;
var dayNames		= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Creates a static 4-day weather forecast from today's date.
 */
function createWeatherForecast() {
	var todaysDate = (new Date());
	var dayCounter = todaysDate.getDay();
	
	weatherForecast = new WeatherForecastObj(["Spain", "Barcelona"], todaysDate);
	for(var i = 0; i < 4; ++i) {
		weatherForecast.dates[i] = new DateObj(dayNames[dayCounter % dayNames.length],todaysDate.getDate()+i);
		++dayCounter;

		switch(i) {
			case 0:
				weatherForecast.dates[i].weatherHour[0] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[1] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[2] = new WeatherHourObj(8,'rainy');
				weatherForecast.dates[i].weatherHour[3] = new WeatherHourObj(7,'rainy');
				weatherForecast.dates[i].weatherHour[4] = new WeatherHourObj(7,'cloudy');
				weatherForecast.dates[i].weatherHour[5] = new WeatherHourObj(7,'cloudy');
				weatherForecast.dates[i].weatherHour[6] = new WeatherHourObj(9,'rainy');
				weatherForecast.dates[i].weatherHour[7] = new WeatherHourObj(9,'fine');
				weatherForecast.dates[i].weatherHour[8] = new WeatherHourObj(10,'rainy');
				weatherForecast.dates[i].weatherHour[9] = new WeatherHourObj(10,'rainy');
				weatherForecast.dates[i].weatherHour[10] = new WeatherHourObj(10,'thundery');
				weatherForecast.dates[i].weatherHour[11] = new WeatherHourObj(12,'thundery');
				weatherForecast.dates[i].weatherHour[12] = new WeatherHourObj(12,'cloudy');
				weatherForecast.dates[i].weatherHour[13] = new WeatherHourObj(13,'cloudy');
				weatherForecast.dates[i].weatherHour[14] = new WeatherHourObj(14,'rainy');
				weatherForecast.dates[i].weatherHour[15] = new WeatherHourObj(15,'rainy');
				weatherForecast.dates[i].weatherHour[16] = new WeatherHourObj(17,'thundery');
				weatherForecast.dates[i].weatherHour[17] = new WeatherHourObj(14,'thundery');
				weatherForecast.dates[i].weatherHour[18] = new WeatherHourObj(12,'fine');
				weatherForecast.dates[i].weatherHour[19] = new WeatherHourObj(12,'rainy');
				weatherForecast.dates[i].weatherHour[20] = new WeatherHourObj(10,'cloudy');
				weatherForecast.dates[i].weatherHour[21] = new WeatherHourObj(10,'cloudy');
				weatherForecast.dates[i].weatherHour[22] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[23] = new WeatherHourObj(6,'rainy');
				break;
			case 1:
				weatherForecast.dates[i].weatherHour[0] = new WeatherHourObj(8,'cloudy');
				weatherForecast.dates[i].weatherHour[1] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[2] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[3] = new WeatherHourObj(7,'rainy');
				weatherForecast.dates[i].weatherHour[4] = new WeatherHourObj(7,'cloudy');
				weatherForecast.dates[i].weatherHour[5] = new WeatherHourObj(7,'fine');
				weatherForecast.dates[i].weatherHour[6] = new WeatherHourObj(9,'rainy');
				weatherForecast.dates[i].weatherHour[7] = new WeatherHourObj(9,'cloudy');
				weatherForecast.dates[i].weatherHour[8] = new WeatherHourObj(10,'rainy');
				weatherForecast.dates[i].weatherHour[9] = new WeatherHourObj(10,'cloudy');
				weatherForecast.dates[i].weatherHour[10] = new WeatherHourObj(10,'rainy');
				weatherForecast.dates[i].weatherHour[11] = new WeatherHourObj(12,'rainy');
				weatherForecast.dates[i].weatherHour[12] = new WeatherHourObj(12,'thundery');
				weatherForecast.dates[i].weatherHour[13] = new WeatherHourObj(13,'rainy');
				weatherForecast.dates[i].weatherHour[14] = new WeatherHourObj(14,'cloudy');
				weatherForecast.dates[i].weatherHour[15] = new WeatherHourObj(15,'fine');
				weatherForecast.dates[i].weatherHour[16] = new WeatherHourObj(17,'rainy');
				weatherForecast.dates[i].weatherHour[17] = new WeatherHourObj(14,'thundery');
				weatherForecast.dates[i].weatherHour[18] = new WeatherHourObj(12,'rainy');
				weatherForecast.dates[i].weatherHour[19] = new WeatherHourObj(12,'fine');
				weatherForecast.dates[i].weatherHour[20] = new WeatherHourObj(10,'rainy');
				weatherForecast.dates[i].weatherHour[21] = new WeatherHourObj(10,'fine');
				weatherForecast.dates[i].weatherHour[22] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[23] = new WeatherHourObj(6,'cloudy');
				break;
			case 2:
				weatherForecast.dates[i].weatherHour[0] = new WeatherHourObj(18,'fine');
				weatherForecast.dates[i].weatherHour[1] = new WeatherHourObj(18,'cloudy');
				weatherForecast.dates[i].weatherHour[2] = new WeatherHourObj(18,'fine');
				weatherForecast.dates[i].weatherHour[3] = new WeatherHourObj(17,'fine');
				weatherForecast.dates[i].weatherHour[4] = new WeatherHourObj(17,'cloudy');
				weatherForecast.dates[i].weatherHour[5] = new WeatherHourObj(17,'rainy');
				weatherForecast.dates[i].weatherHour[6] = new WeatherHourObj(19,'rainy');
				weatherForecast.dates[i].weatherHour[7] = new WeatherHourObj(19,'thundery');
				weatherForecast.dates[i].weatherHour[8] = new WeatherHourObj(20,'cloudy');
				weatherForecast.dates[i].weatherHour[9] = new WeatherHourObj(20,'rainy');
				weatherForecast.dates[i].weatherHour[10] = new WeatherHourObj(20,'cloudy');
				weatherForecast.dates[i].weatherHour[11] = new WeatherHourObj(22,'rainy');
				weatherForecast.dates[i].weatherHour[12] = new WeatherHourObj(22,'rainy');
				weatherForecast.dates[i].weatherHour[13] = new WeatherHourObj(23,'thundery');
				weatherForecast.dates[i].weatherHour[14] = new WeatherHourObj(24,'cloudy');
				weatherForecast.dates[i].weatherHour[15] = new WeatherHourObj(25,'fine');
				weatherForecast.dates[i].weatherHour[16] = new WeatherHourObj(27,'thundery');
				weatherForecast.dates[i].weatherHour[17] = new WeatherHourObj(24,'cloudy');
				weatherForecast.dates[i].weatherHour[18] = new WeatherHourObj(22,'cloudy');
				weatherForecast.dates[i].weatherHour[19] = new WeatherHourObj(22,'rainy');
				weatherForecast.dates[i].weatherHour[20] = new WeatherHourObj(20,'fine');
				weatherForecast.dates[i].weatherHour[21] = new WeatherHourObj(20,'cloudy');
				weatherForecast.dates[i].weatherHour[22] = new WeatherHourObj(18,'fine');
				weatherForecast.dates[i].weatherHour[23] = new WeatherHourObj(16,'fine');
				break;
			case 3:
				weatherForecast.dates[i].weatherHour[0] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[1] = new WeatherHourObj(8,'cloudy');
				weatherForecast.dates[i].weatherHour[2] = new WeatherHourObj(8,'fine');
				weatherForecast.dates[i].weatherHour[3] = new WeatherHourObj(7,'fine');
				weatherForecast.dates[i].weatherHour[4] = new WeatherHourObj(7,'thundery');
				weatherForecast.dates[i].weatherHour[5] = new WeatherHourObj(7,'fine');
				weatherForecast.dates[i].weatherHour[6] = new WeatherHourObj(9,'cloudy');
				weatherForecast.dates[i].weatherHour[7] = new WeatherHourObj(9,'rainy');
				weatherForecast.dates[i].weatherHour[8] = new WeatherHourObj(11,'cloudy');
				weatherForecast.dates[i].weatherHour[9] = new WeatherHourObj(11,'thundery');
				weatherForecast.dates[i].weatherHour[10] = new WeatherHourObj(12,'thundery');
				weatherForecast.dates[i].weatherHour[11] = new WeatherHourObj(13,'rainy');
				weatherForecast.dates[i].weatherHour[12] = new WeatherHourObj(14,'thundery');
				weatherForecast.dates[i].weatherHour[13] = new WeatherHourObj(15,'rainy');
				weatherForecast.dates[i].weatherHour[14] = new WeatherHourObj(16,'cloudy');
				weatherForecast.dates[i].weatherHour[15] = new WeatherHourObj(15,'fine');
				weatherForecast.dates[i].weatherHour[16] = new WeatherHourObj(17,'rainy');
				weatherForecast.dates[i].weatherHour[17] = new WeatherHourObj(14,'fine');
				weatherForecast.dates[i].weatherHour[18] = new WeatherHourObj(12,'rainy');
				weatherForecast.dates[i].weatherHour[19] = new WeatherHourObj(12,'cloudy');
				weatherForecast.dates[i].weatherHour[20] = new WeatherHourObj(10,'rainy');
				weatherForecast.dates[i].weatherHour[21] = new WeatherHourObj(10,'fine');
				weatherForecast.dates[i].weatherHour[22] = new WeatherHourObj(8,'rainy');
				weatherForecast.dates[i].weatherHour[23] = new WeatherHourObj(6,'fine');
				break;
		}
	}
}

//Gets the current weather (requires date and angle).
function getCurrentWeather(d, a){
	
	//Angle to time calculation.
	var convertAngleToHour	= Math.ceil(Math.abs(a) / 15) - 1;
	
	//Map input day and angle to weather Data.
	var currentTemperature	= weatherForecast.dates[d].weatherHour[convertAngleToHour].temperature;
	var currentWeatherTyp	= weatherForecast.dates[d].weatherHour[d].type;
	
	return [currentTemperature, currentWeatherTyp];
}

/**
 * Returns the mode for an array of values. 
 */
function mode(array) {
	
    if(array.length === 0) {
        return null;
    }
    
    var modeMap		= [];
    var maxEl		= array[0];
    var maxCount	= 1;
    
    for(var i = 0; i < array.length; ++i) {
        var el = array[i];
        
        // '==' required as '===' will not evaluate properly.
        if(modeMap[el] == null) {
            modeMap[el] = 1;
        } else {
            ++modeMap[el];
        }
        
        if(modeMap[el] > maxCount) {
			maxEl = el;
            maxCount = modeMap[el];
        }
    }
    
    return maxEl;
}

/**
 * Returns the average temperature for a day's forecast; used when displaying daily information in the dock.
 */
function getForecastAverage() {
	var forecastArray = [];
	
	for(var j = 0; j < 4; ++j) {
		var averageday = [];
		var tempA = 0;
		var weatherTypeArray = [];
		
		for(var i = 0; i < 24; ++i) {
			tempA = tempA + weatherForecast.dates[j].weatherHour[i].temperature;
			weatherTypeArray[i] = weatherForecast.dates[j].weatherHour[i].type;
		}
		
		//Adding day average temp and weather type.
		averageday[0] = Math.round(tempA / 24);
		averageday[1] = mode(weatherTypeArray);
		averageday[2] = weatherForecast.dates[j].day;
		forecastArray[j] = averageday;
	}
	return forecastArray;
}