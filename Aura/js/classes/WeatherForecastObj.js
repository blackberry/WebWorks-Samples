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

/**
 * An Object to keep track of weather conditions for various dates, gathered for a specific location at a specific point in time.
 * 
 * @param geoLocation The location associated with the gathered weather conditions.
 * @param timeStamp The time at which we are gathering the weather conditions.
 * 
 * @returns {WeatherForecastObj} The Object that holds an empty dates Array intended for specific weather conditions.
 */
function WeatherForecastObj(geoLocation, timeStamp) {
	this.geoLocation = geoLocation;
	this.timeStamp = timeStamp;
	this.dates = [];
}