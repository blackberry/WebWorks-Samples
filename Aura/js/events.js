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
/*global $, RopeHandler, weatherForecast*/

/*
 * Variables related to touch events.
 */
var TouchPosition = {"none":0, "left":1, "right":2};
var TouchType = {"none":0, "tap":1, "hold":2};
var touchStatus = null;
var mouseDown = false;
var lastX = 0;
var lastY = 0;
var startClick = {x:0, y:0, t:null};

/*
 * Variables related to touch gestures. 
 */
var moveTrace = [];
var moveTraceItem = function(x, y, t) {
	this.x = x;
	this.y = y;
	this.t = t;
};
var directionX = 0; //Swiping, 0: left, 1:right
var directionY = 0; //Swiping, 0: up,   1:down
var swMinVerticalDistance = 120;
var swMinHorizontalDistance = 120;
var swMaxVerticalDistance = 75;
var swMaxHorizontalDistance = 90;
var swMinTime = 100;
var swMaxTime = 900;

/*
 * Variables related to our display Objects. 
 */
var timeSign = null;
var daySign = null;
var RotatingElement = function(id) {
	this.domId = id;
	this.domElement = document.getElementById(id);
	this.startDegree = -80;
	this.currentDegree = -80;
	this.maxDegree = 80;
	this.steps = 12;
};
var sun = null;
var moon = null;
var rope = [];
var bg_night = null;
var bg_day = null;
var bg_dawn = null;
var bg_late_dawn = null;
var bg_dusk = null;
var bg_early_dusk = null;

/*
 * Variables related to displaying Objects.
 * 
 * d and n refer to the rotation (in degrees) to display the sun and moon; respectively.
 */
//Index: 0  1   2   3	4	  5	   6	7	 8	  9   10   11   12   13   14   15   16   17   18   19   20   21   22  23
var d = [0, 0,  0,  0, -80, -80, -63, -52, -41, -30, -19,  -9,   0,   9,  19,  30,  41,  52,  63,  80,  80,   0,   0,  0];
var n = [0, 9, 19, 30,  41,  52,  63,  80,  80, -80, -80, -80, -80, -80, -80, -80, -80, -80, -63, -52, -41, -30, -19, -9];
var dockIsActive = false;
var standard_transition = '-webkit-transition:all 0.6s linear;';
var lastActiveDayState = null;
var activeDayState = null;
var rainCloudsVisible = false;
var normalCloudsVisible = false;
var snowCloudsVisible = false;
var thunderCloudsVisible = false;
var starsVisible = false;

/*
 * Variables related to date/time.
 */
var days = null;
var currentDay = 0;
var currentHour = 0;

/*
 * Miscellaneous variables.
 */
var weather = ['fine', 'cloudy', 'rainy', 'thundery'];

/**
 * Generates a random number between 0 and max.
 * 
 * @param max The maximum random number to generate.
 * 
 * @returns A random number between 0 and max.
 */
function randomNumber(max) {
	return Math.floor(Math.random() * (max + 1));
}

/**
 * Stores information about our touch, stored in touchStatus.
 * 
 * @param pos The position of the touch.
 * @param t The type of touch (i.e. 'none', 'tap', or 'hold'.)
 * 
 * @returns {touchObject} An Object containing information about our touch.
 */
function touchObject(pos, t){
	this.position = pos;
	this.type = t;
}

/**
 * Rotates the specified element to a certain rotation and animation.
 * 
 * @param element The element to rotate.
 * @param degrees The degree rotation.
 * @param animate true or false; whether we should animate.
 */
function rotateTo(element, degrees, animate) {
	var styleValue = '-webkit-transition: none; -webkit-transform: rotate('+ degrees+'deg);';
	if(animate) {
		styleValue = standard_transition+ '-webkit-transform: rotate('+ degrees+'deg);';
	}
	element.domElement.setAttribute('style', styleValue);
	element.currentDegree = degrees;
}

/**
 * Ensure that the sun and moon are not visible at specific hours of the day.
 */
function checkStatusOfRotatingElement() {
	switch (currentHour) {
		case 0:		case 1:		case 2:		case 3:		case 4:		case 5:
			rotateTo(sun, -80, false);
			break;	
		case 6:		case 7:		case 8:		case 9:		case 10:	case 11:
			rotateTo(moon, 80, false);
			break;
		case 12:	case 13:	case 14:	case 15:	case 16:	case 17:
			rotateTo(moon, -80, false);
			break;
		case 18:	case 19:	case 20:	case 21:	case 22:	case 23:	case 24:
			rotateTo(sun, 80, false);
			break;
	}
}

/**
 * Set the rain clouds to be visible or not. We only update if the state is different than our current state.
 * 
 * @param visible true = visible, false = not visible.
 */
function setRainClouds(visible) {
	var i = 0;
	
	if(rainCloudsVisible && !visible) {
		for(i = 0; i<3; ++i) {
			rope[i*4].pullUp();
		}
		rainCloudsVisible = false;
	} else if(!rainCloudsVisible && visible) {
		for(i = 0; i<3; ++i) {
			rope[i*4].fallDown();
		}
		rainCloudsVisible = true;
	}
}

/**
 * Set the normal clouds to be visible or not. We only update if the state is different than our current state.
 * 
 * @param visible true = visible, false = not visible.
 */
function setNormalClouds(visible) {
	var i = 0;
	
	if(normalCloudsVisible && !visible) {
		for(i = 12; i<16; ++i) {
			rope[i].pullUp();
		}
		normalCloudsVisible = false;
	} else if(!normalCloudsVisible && visible) {
		for(i = 12; i<16; ++i) {
			rope[i].fallDown();
		}
		normalCloudsVisible = true;
	}
}

/**
 * Set the thunder clouds to be visible or not. We only update if the state is different than our current state.
 * 
 * @param visible true = visible, false = not visible.
 */
function setThunderClouds(visible) {
	if(thunderCloudsVisible && !visible) {
		rope[16].pullUp();
		rope[20].pullUp();
		rope[22].pullUp();
		thunderCloudsVisible = false;
	} else if(!thunderCloudsVisible && visible) {
		rope[16].fallDown();
		rope[20].fallDown();
		rope[22].fallDown();
		thunderCloudsVisible = true;
	}
}

/**
 * Set the snow clouds to be visible or not. We only update if the state is different than our current state.
 * 
 * @param visible true = visible, false = not visible.
 */
function setSnowClouds(visible) {
	if(snowCloudsVisible && !visible) {
		rope[26].pullUp();
		rope[30].pullUp();
		rope[34].pullUp();
		snowCloudsVisible = false;
	} else if(!snowCloudsVisible && visible) {
		rope[26].fallDown();
		rope[30].fallDown();
		rope[34].fallDown();
		snowCloudsVisible = true;
	}
}

/**
 * Set the stars to be visible or not. We only update if the state is different than our current state.
 * 
 * @param visible true = visible, false = not visible.
 */
function setStars(visible) {
	var star = 0;
	
	if(starsVisible && !visible) {
		for(star = 38; star < 43; ++star) {
			rope[star].pullUp();
		}
		starsVisible = false;
	} else if(!starsVisible && visible) {
	   for(star = 38; star < 43; ++star) {
			rope[star].fallDown();
	   }
	   starsVisible = true;
	}
}

/**
 * Sets the correct weather flags based on the weather conditions.
 */
function loadWeather() {
	if(days[currentDay].weatherHour[currentHour].type === 'rainy') {
		setRainClouds(true);
		setNormalClouds(false);
		setSnowClouds(false);
		setThunderClouds(false);
		setStars(false);
	} else if(days[currentDay].weatherHour[currentHour].type === 'cloudy') {
		setRainClouds(false);
		setNormalClouds(true);
		setSnowClouds(false);
		setThunderClouds(false);
		setStars(false);
	} else if(days[currentDay].weatherHour[currentHour].type === 'snowy') {
		setRainClouds(false);
		setNormalClouds(false);
		setSnowClouds(true);
		setThunderClouds(false);
		setStars(false);
	} else if(days[currentDay].weatherHour[currentHour].type === 'thundery') {
		setRainClouds(false);
		setNormalClouds(false);
		setSnowClouds(false);
		setThunderClouds(true);
		setStars(false);
	} else if(days[currentDay].weatherHour[currentHour].type === 'fine') {
		setRainClouds(false);
		setNormalClouds(false);
		setSnowClouds(false);
		setThunderClouds(false);
		
		//Only show stars on a fine night.
		if(currentHour < 5 || currentHour > 19) {
			setStars(true);
		} else {
			setStars(false);
		}
	}
}

/**
 * After the transition for weather hour movement ends, we call this method to validate
 * our rotating element and load the necessary weather.
 */
function afterEffect() {
	checkStatusOfRotatingElement();
	loadWeather();
}

/**
 * Changes the background to match our hour of day.
 * 
 * @param targetElement The desired background.
 */
function changeState(targetElement) {
	if(activeDayState !== targetElement) {
		if(activeDayState !== null) {
			activeDayState.style.zIndex = -1;
		}
		
		if(lastActiveDayState !== null) {
			lastActiveDayState.style.webkitAnimationName = '';
			lastActiveDayState.style.display = 'none';
		}
		
		targetElement.style.zIndex = 0;
		targetElement.style.display = '';
		targetElement.style.webkitAnimationName = 'fade_in';
		lastActiveDayState = activeDayState;
		activeDayState = targetElement;
	}
}

/**
 * Ensures our background image is up to date based on the time of day.
 */
function checkDayState() {
	if(currentHour <= 3) {
		changeState(bg_night);
	} else if(currentHour <= 6) {
		changeState(bg_dawn);
	} else if(currentHour <= 9) {
		changeState(bg_late_dawn);
	} else if(currentHour <= 15) {
		changeState(bg_day);
	} else if(currentHour <= 18) {
		changeState(bg_early_dusk);
	} else if(currentHour <= 21) {
		changeState(bg_dusk);
	} else {
		changeState(bg_night);
	}
}

/**
 * Call to skew shadows.
 *
 * @param degree The rotation of the sun; we take the negative for the rotation of the shadow.
 * @param direction The direction our 'light' object is traveling.
 */
function skewShadow(degree, direction) {
	var newDegree = -degree; //We want the shadow rotation to be the negative of our light source's rotation.
	var xcomp = direction ? newDegree + 5 : newDegree - 5; //New X coordinate for the shadow to offset the effect of skewing on the base of our shadow.
	if((degree > -79) && (degree < 80)) {
		document.getElementById("cityshadow").setAttribute('style', standard_transition+'-webkit-transform: skew('+newDegree+'deg) translate3d('+xcomp+'px,0,0)');
	}
}

/**
 * Call to rotate the sun or moon element.
 *
 * @param element The element to rotate.
 * @param rotateDirection 0 = left, 1 = right. Used for skewing the shadow.
 */
function rotate(element, rotateDirection) {
	var chosenCycle = null;
	if(element === sun) {
		if (currentHour >= 20 || currentHour < 5) {
			return false;
		} else {
			chosenCycle = d;
		}
	} else if(element === moon) {
		if(currentHour < 17 && currentHour > 7) {
			return false;
		} else {
			chosenCycle = n;
		}
	}

	//Update our rotated element.
	element.domElement.setAttribute('style', standard_transition+'-webkit-transform: rotate('+chosenCycle[currentHour]+'deg) translateZ(0)');
	element.currentDegree = chosenCycle[currentHour];
	
	//Update our background and sign Objects.
	checkDayState();
	timeSign.innerHTML = currentHour;
	daySign.innerHTML = days[currentDay].day;
	
	//Shadow is brighter during the day than at night.
	if((currentHour < 19) && (currentHour > 6)) {
		$('#cityshadow').removeClass("cityshadowhide");
		$('#cityshadow').addClass("cityshadowshow");
	} else {
		$('#cityshadow').removeClass("cityshadowshow");
		$('#cityshadow').addClass("cityshadowhide");
	}
	
	//Update the temperature and shadows.
	document.getElementById('data').innerHTML = days[currentDay].weatherHour[currentHour].temperature+'&deg;';
	skewShadow(element.currentDegree, rotateDirection);
}

/**
 * Moves one weather hour in the specified direction.
 * 
 * @param direction 0 = backwards; 1 = forwards.
 */
function updateGraphics(direction) {
	if(sun) {
		sun.domElement.addEventListener("webkitTransitionEnd", afterEffect(), true);
		rotate(moon, direction);
		rotate(sun, direction);
	}
}

/**
 * Adjusts our current time by the amount specified (negative values indicate moving backwards.)
 * Adjusts our current day if the lower 0-hour limit or upper 23-hour limit are exceeded.
 * 
 * @param hourAmount
 */
function incrementTime(hourAmount) {
	currentHour += hourAmount;
	if(currentHour < 0) {
		--currentDay;
		if (currentDay < 0) {
			currentDay = days.length -1;
		}
		currentHour += 24;
	} else if(currentHour > 23) {
		++currentDay;
		if (currentDay > 3) {
			currentDay = 0;
		}
		currentHour -= 24;
	}
}

/**
 * Validates our background and displayed elements after a change in the day's hour.
 */
function jumpCallback() {
	checkDayState();
	checkStatusOfRotatingElement();
}

/**
 * Navigates to a specific day, from the current day, based on the provided direction.
 * We will end at noon (or 1:00PM if our hour is currently an odd hour.)
 * 
 * @param targetDay The day we will end on.
 * @param direction The direction to traverse to the day. 0 = backwards; 1 = forwards.
 */
function startMotion(targetDay, direction) {
	//Clear weather.
	setRainClouds(false);
	setNormalClouds(false);
	setSnowClouds(false);
	setThunderClouds(false);
	setStars(false);
	
	//Repeat the following every 300ms.
	var intervalX = setInterval(function() {
		
		//Adjust our target hour if we are on an odd-hour schedule.
		var targetHour = 12;		
		if(currentHour % 2 == 1) {
			targetHour = 13;
		}

		//We have reached our target day/hour.
		if((currentHour == targetHour) && (currentDay == targetDay)) {
			clearInterval(intervalX);
			loadWeather();
			return false;
		}

		//Adjust our time by 2 hours every cycle.
		if(direction == 1) {
			incrementTime(2);
		} else {
			incrementTime(-2);
		}
		
		//Adjust our displayed elements based on their movement.
		sun.domElement.style.webkitTransitionTimingFunction = 'linear';
		moon.domElement.style.webkitTransitionTimingFunction = 'linear';
		moon.domElement.style.webkitAnimationDuration = '0.3s';
		sun.domElement.addEventListener('webkitTransitionEnd', jumpCallback(), true);
		rotate(sun, 1);
		rotate(moon, 1);
	}, 300);
}

/**
 * Hides the dock if it is visible.
 */
function dockUp() {
	if(dockIsActive) {
		$('#dock').animate({marginTop: "-=200"}, {duration: 200, easing: 'easeInExpo'});
		document.getElementById('vignette').setAttribute("class", "vignetteanimatehide");
		dockIsActive = false;
	}
}

/**
 * Triggered when onmousedown or ontouchstart are called.
 */
function checkTouchStart(x) {
	if(!dockIsActive){
		//Dock is not visible.
		var clickable = 1024 / 4;
		if(x < clickable) {
			//User clicked left 25% of the screen.
			touchStatus = new touchObject(TouchPosition.left, TouchType.tap);
		} else if (x > (1024-clickable)) {
			//User clicked right 25% of the screen.
			touchStatus = new touchObject(TouchPosition.right, TouchType.tap);
		}
	} else {
		//Dock is visible.
		if(startClick.y < 185) {
			//We have clicked within the dock; we will check hard-coded position values to see whether one of
			//our day-buttons were clicked. If so, we will move to that day.

			var targetDay = currentDay;
			if((startClick.x > 37) && (startClick.x < 235)) {
				targetDay = 0;
			} else if((startClick.x > 288) && (startClick.x < 486)) {
				targetDay = 1;
			} else if((startClick.x > 542) && (startClick.x < 738)) {
				targetDay = 2;
			} else if((startClick.x > 793) && (startClick.x < 989)) {
				targetDay = 3;
			}

			if(targetDay != currentDay) {
				$(".panel-item").removeClass("panel-active");
				$("#active" + targetDay + "bg").addClass("panel-active");
				dockUp();
				startMotion(targetDay, (targetDay < currentDay) ? 0 : 1);
			}
		}
	}

}

/**
 * Triggered when onmouseup or ontouchend is called.
 */
function checkTouchEnd() {
	if(touchStatus && touchStatus.type == TouchType.tap) {
		//A mouse/touch event occurred in the left or right region. It was either a click/tap, or
		//a swipe has timed out and we treat it as a click/tap.
		if (touchStatus.position === TouchPosition.left){
			//Left region: Move back one weather hour.
			incrementTime(-2);
			updateGraphics(0);
		} else if (touchStatus.position === TouchPosition.right){
			//Right region: Move forward one weather hour.
			incrementTime(2);
			updateGraphics(1);
		}
	}
}

/**
 * Shows the dock if it is not visible.
 */
function dockDown() {
	if(!dockIsActive) {
		$(".panel-item").removeClass("panel-active");
		$("#active" + currentDay + "bg").addClass("panel-active");
		$('#dock').animate({marginTop: "+=200"}, {duration: 800, easing: 'easeOutElastic'});
		document.getElementById('vignette').setAttribute("class", "vignetteanimateshow");
		dockIsActive = true;
	}
}

/**
 * Updates the direction of our recorded swipe based on our previously recorded (X,Y) coordinate.
 * 
 * @param x Current X coordinate.
 * @param y Current Y coordinate.
 */
function updateDirection(x, y) {
	directionX = lastX < x ? 1 : 0;
	directionY = lastY < y ? 1 : 0;
}

/**
 * Returns the direction that we've swiped in; or false if no swipe occurred.
 * 
 * @param x The X coordinate of our swipe.
 * @param y The Y coordinate of our swipe.
 * 
 * @returns The direction of our swipe; or false if no swipe occurred.
 */
function swiped(x, y) {
	//Our swipe must occur within the allotted amount of time.
	var secondsDifference = (new Date()).getTime() - startClick.t.getTime();
	if (secondsDifference > swMinTime && secondsDifference < swMaxTime) {
		//Get the horizontal and vertical distances traveled.
		var dx = Math.abs(startClick.x - x);
		var dy = Math.abs(startClick.y - y);
		
		//A swipe must travel a minimum distance on the primary axis (horizontal or vertical) and
		//not deviate too much on the secondary axis.
		if (dx > swMinHorizontalDistance && dy < swMaxVerticalDistance) {
			return directionX;
		} else if (dy > swMinVerticalDistance && dx < swMaxHorizontalDistance) {
			return directionY + 2;
		}
	}
	return false;
}

/**
 * Invoked on a Touch or Mouse event starts to initialize our starting point. 
 * 
 * @param x The X coordinate of our touch/mouse event.
 * @param y The Y coordinate of our touch/mouse event.
 */
function touchStartMouseDown(x,y) {
	startClick.x = x;
	startClick.y = y;
	startClick.t = new Date();
	checkTouchStart(x);
	mouseDown = true;
}

/**
 * Invoked when a Touch or Mouse event finishes.
 * 
 * @param x The X coordinate of our touch/mouse event.
 * @param y The Y coordinate of our touch/mouse event.
 */
function touchEndMouseUp(x,y) {
	var swipe = swiped(x,y);

	if(swipe === 1) {
		incrementTime(-2);
		updateGraphics(0);
	} else if(swipe === 0) {
		incrementTime(2);
		updateGraphics(1);
	} else if(swipe === 2) {
		dockUp();
	} else if(swipe === 3) {
		dockDown();
	} else {
		checkTouchEnd();
		document.getElementById('data').innerHTML = days[currentDay].weatherHour[currentHour].temperature+'&deg;';
	}

	startClick.x = 0;
	startClick.y = 0;
	startClick.t = null;
	mouseDown = false;
	touchStatus = null;
}

/**
 * Once our page is loaded, we will clear our splash screen and display our main application.
 */
function initAfterLoading() {
	//Set all backgrounds to be empty then call checkDayState() to set our current state.
	bg_night.style.display = 'none';
	//bg_day.style.display = 'none';
	//bg_early_dusk.style.display = 'none';
	//bg_dusk.style.display = 'none';
	//bg_dawn.style.display = 'none';
	//bg_late_dawn.style.display = 'none';
	
	checkDayState();
	
	setTimeout(function() {
		$("#overlay").css("opacity", "0");
		$("#main").css("-webkit-animation", "fade_in 1s");
		$("#city").css("-webkit-animation", "slide-up 1s");
		$("#data").css("-webkit-animation", "slide-up2 1.2s");
		setTimeout(function() {
			document.getElementById('overlay').style.display = 'none';
		}, 1000);
	}, 100);
}

/**
 * Once our document has loaded, we initialize the majority of our variables.
 */
function whenReady() {
	sun = new RotatingElement('sun');
	moon = new RotatingElement('moon');
	currentHour = (new Date()).getHours();
	
	days = weatherForecast.dates;
	
	bg_night = document.getElementById('night');
	bg_day = document.getElementById('day');
	bg_early_dusk = document.getElementById('early_dusk');
	bg_dusk = document.getElementById('dusk');
	bg_dawn = document.getElementById('dawn');
	bg_late_dawn = document.getElementById('late_dawn');
	document.getElementById('data').innerHTML = days[currentDay].weatherHour[currentHour].temperature+'&deg;';

	sun.currentDegree = d[currentHour];
	moon.currentDegree = n[currentHour];
	rotateTo(sun, sun.currentDegree, true);
	rotateTo(moon, moon.currentDegree, true);
	
	timeSign = document.getElementById('timeString');
	daySign = document.getElementById('dayString');
	timeSign.innerHTML = currentHour;
	daySign.innerHTML = days[currentDay].day;
	
	var ropeHandler = new RopeHandler({"fps":20, "timeStep":1/5});
	rope[0] = ropeHandler.createRope({"length":190, "width":2,"anchorX":220,"anchorY":-460, "lock":false, "color":"#333","attachElement":"rainCloud0", "attachX":98, "attachY":67, "angle":-8});
	rope[1] = ropeHandler.createRope({"length":30, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop0a", "attachX":16, "attachY":9});		
	rope[2] = ropeHandler.createRope({"length":50, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop0b", "attachX":16, "attachY":9});
	rope[3] = ropeHandler.createRope({"length":15, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop0c", "attachX":16, "attachY":9});

	rope[4] = ropeHandler.createRope({"length":120, "width":2,"anchorX":530,"anchorY":-460, "lock":false, "color":"#333","attachElement":"rainCloud1", "attachX":112, "attachY":70, "angle":-5});
	rope[5] = ropeHandler.createRope({"length":30, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop1a", "attachX":16, "attachY":9});		
	rope[6] = ropeHandler.createRope({"length":42, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop1b", "attachX":16, "attachY":9});
	rope[7] = ropeHandler.createRope({"length":30, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop1c", "attachX":16, "attachY":9});

	rope[8] = ropeHandler.createRope({"length":165, "width":2,"anchorX":720,"anchorY":-480, "lock":false, "color":"#333","attachElement":"rainCloud2", "attachX":99, "attachY":61, "angle":17});
	rope[9] = ropeHandler.createRope({"length":33, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop2a", "attachX":16, "attachY":9});		
	rope[10] = ropeHandler.createRope({"length":38, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop2b", "attachX":16, "attachY":9});
	rope[11] = ropeHandler.createRope({"length":15, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"drop2c", "attachX":16, "attachY":9});

	rope[0].attachRope(rope[1], "-43", "33");
	rope[0].attachRope(rope[2], "4", "33");
	rope[0].attachRope(rope[3], "44", "33");

	rope[4].attachRope(rope[5], "-61", "39");
	rope[4].attachRope(rope[6], "3", "39");
	rope[4].attachRope(rope[7], "70", "39");

	rope[8].attachRope(rope[9], "-54", "32");
	rope[8].attachRope(rope[10], "10", "32");
	rope[8].attachRope(rope[11], "62", "32");

	rope[12] = ropeHandler.createRope({"length":165, "width":2,"anchorX":200,"anchorY":-480, "lock":false, "color":"#333","attachElement":"normalCloud0", "attachX":85, "attachY":54, "angle":0});
	rope[13] = ropeHandler.createRope({"length":170, "width":2,"anchorX":340,"anchorY":-460, "lock":false, "color":"#333", "attachElement":"normalCloud1", "attachX":135, "attachY":90, "angle":0});		
	rope[14] = ropeHandler.createRope({"length":110, "width":2,"anchorX":560,"anchorY":-480, "lock":false, "color":"#333", "attachElement":"normalCloud2", "attachX":110, "attachY":69, "angle":0});
	rope[15] = ropeHandler.createRope({"length":165, "width":2,"anchorX":800,"anchorY":-480, "lock":false, "color":"#333", "attachElement":"normalCloud3", "attachX":80, "attachY":44, "angle":-4});

	rope[16] = ropeHandler.createRope({"length":190, "width":2,"anchorX":760,"anchorY":-480, "lock":false, "color":"#333","attachElement":"thunderCloud0", "attachX":98, "attachY":67, "angle":6});
	rope[17] = ropeHandler.createRope({"length":30, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"thunderDrop0a", "attachX":16, "attachY":9});		
	rope[18] = ropeHandler.createRope({"length":40, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"thunderDrop0b", "attachX":16, "attachY":9});
	rope[19] = ropeHandler.createRope({"length":15, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"thunderDrop0c", "attachX":16, "attachY":9});

	rope[20] = ropeHandler.createRope({"length":120, "width":2,"anchorX":495,"anchorY":-480, "lock":false, "color":"#333","attachElement":"thunderCloud1", "attachX":158, "attachY":97, "angle":0});
	rope[21] = ropeHandler.createRope({"length":18, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"flash1a", "attachX":38, "attachY":9});		

	rope[22] = ropeHandler.createRope({"length":165, "width":2,"anchorX":230,"anchorY":-480, "lock":false, "color":"#333","attachElement":"thunderCloud2", "attachX":99, "attachY":61, "angle":10});
	rope[23] = ropeHandler.createRope({"length":33, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"thunderDrop2a", "attachX":16, "attachY":9});		
	rope[24] = ropeHandler.createRope({"length":35, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"thunderDrop2b", "attachX":16, "attachY":9});
	rope[25] = ropeHandler.createRope({"length":40, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"thunderDrop2c", "attachX":16, "attachY":9});

	rope[16].attachRope(rope[17], "-43", "33");
	rope[16].attachRope(rope[18], "4", "33");
	rope[16].attachRope(rope[19], "44", "33");

	rope[20].attachRope(rope[21], "0", "15");

	rope[22].attachRope(rope[23], "-54", "32");
	rope[22].attachRope(rope[24], "10", "32");
	rope[22].attachRope(rope[25], "62", "32");

	rope[26] = ropeHandler.createRope({"length":190, "width":2,"anchorX":250,"anchorY":-460, "lock":false, "color":"#333","attachElement":"snowCloud0", "attachX":100, "attachY":63, "angle":-6});
	rope[27] = ropeHandler.createRope({"length":30, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake0a", "attachX":25, "attachY":9});		
	rope[28] = ropeHandler.createRope({"length":50, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake0b", "attachX":25, "attachY":9});
	rope[29] = ropeHandler.createRope({"length":30, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake0c", "attachX":25, "attachY":9});

	rope[30] = ropeHandler.createRope({"length":170, "width":2,"anchorX":710,"anchorY":-460, "lock":false, "color":"#333","attachElement":"snowCloud1", "attachX":109, "attachY":66, "angle":3});
	rope[31] = ropeHandler.createRope({"length":36, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake1a", "attachX":25, "attachY":9});		
	rope[32] = ropeHandler.createRope({"length":48, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake1b", "attachX":25, "attachY":9});
	rope[33] = ropeHandler.createRope({"length":36, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake1c", "attachX":25, "attachY":9});

	rope[34] = ropeHandler.createRope({"length":145, "width":2,"anchorX":430,"anchorY":-480, "lock":false, "color":"#333","attachElement":"snowCloud2", "attachX":96, "attachY":63, "angle":0});
	rope[35] = ropeHandler.createRope({"length":43, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake2a", "attachX":25, "attachY":9});		
	rope[36] = ropeHandler.createRope({"length":40, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake2b", "attachX":25, "attachY":9});
	rope[37] = ropeHandler.createRope({"length":50, "width":1,"anchorX":100,"anchorY":200, "lock":false, "color":"#333", "attachElement":"snowFlake2c", "attachX":25, "attachY":9});

	rope[26].attachRope(rope[27], "-57", "41");
	rope[26].attachRope(rope[28], "-2", "41");
	rope[26].attachRope(rope[29], "51", "41");

	rope[30].attachRope(rope[31], "-61", "39");
	rope[30].attachRope(rope[32], "3", "39");
	rope[30].attachRope(rope[33], "70", "39");

	rope[34].attachRope(rope[35], "-49", "41");
	rope[34].attachRope(rope[36], "3", "41");
	rope[34].attachRope(rope[37], "60", "41");
	
	rope[38] = ropeHandler.createRope({"length":200, "width":1,"anchorX":300,"anchorY":-460, "lock":false, "color":"#333", "attachElement":"starBig1", "attachX":68, "attachY":62, "angle":10});
	rope[39] = ropeHandler.createRope({"length":100, "width":1,"anchorX":750,"anchorY":-460, "lock":false, "color":"#333", "attachElement":"starBig2", "attachX":68, "attachY":62, "angle":20});
	
	rope[40] = ropeHandler.createRope({"length":100, "width":1,"anchorX":150,"anchorY":-460, "lock":false, "color":"#333", "attachElement":"starSmall1", "attachX":55, "attachY":50, "angle":12});
	rope[41] = ropeHandler.createRope({"length":115, "width":1,"anchorX":550,"anchorY":-460, "lock":false, "color":"#333", "attachElement":"starSmall2", "attachX":55, "attachY":50, "angle":-25});
	rope[42] = ropeHandler.createRope({"length":270, "width":1,"anchorX":850,"anchorY":-460, "lock":false, "color":"#333", "attachElement":"starSmall3", "attachX":55, "attachY":50, "angle":-12});
}

/**
 * Native handler for mouse down event.
 */
document.onmousedown = function(event) {
	event.preventDefault();
	var x = event.clientX;
	var y = event.clientY;
	touchStartMouseDown(x,y);
};

/**
 * Native handler for mouse up event.
 */
document.onmouseup = function(event) {
	event.preventDefault();
	var x = event.clientX;
	var y = event.clientY;
	touchEndMouseUp(x,y);
	moveTrace = [];
} ;

/**
 * Native handler for mouse move event.
 */
document.onmousemove = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var t = new Date();
	updateDirection(x,y);
	if(mouseDown) {
		var mv = new moveTraceItem(x, y, t);
		moveTrace.push(mv);
	}
	lastX = x;
	lastY = y;
};

/**
 * Native handler for touch start event.
 */
document.ontouchstart = function(event) {
	event.preventDefault();
	var touchEvent = event.changedTouches[0];
	var x = touchEvent.pageX;
	var y = touchEvent.pageY;
	touchStartMouseDown(x,y);
};

/**
 * Native handler for touch move event.
 */
document.ontouchmove = function(event) {
	event.preventDefault();
	var touchEvent = event.changedTouches[0];
	var x = touchEvent.pageX;
	var y = touchEvent.pageY;
	var t = new Date();
	updateDirection(x,y);
	lastX = x;
	lastY = y;
};

/**
 * Native handler for touch end event.
 */
document.ontouchend = function(event) {
	event.preventDefault();
	var touchEvent = event.changedTouches[0];
	var x = touchEvent.pageX;
	var y = touchEvent.pageY;
	touchEndMouseUp(x,y);
};

/**
 * Native handler for touch cancel event.
 */
document.ontouchcancel = function(event) {
	event.preventDefault();
};