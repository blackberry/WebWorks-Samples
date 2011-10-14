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

var gesture = {
	targetElement : null,
	eventInProgress : false,
	firstX : 0,
	firstY : 0,
	lastX : 0,
	lastY : 0,
	start : null,
	end : null,
	onhorizontalswipe : null,
	onverticalswipe : null
}
	
//The user must define a target page 
gesture.setTargetElement = function( targetElement )
{
	this.targetElement = targetElement;
	
	// Event handlers for mouse interaction
	this.targetElement.onmousedown = function(e) {
		doOnStart(event.clientX, event.clientY, "onmousedown");
	}
	this.targetElement.onmousemove = function(event) {
		doOnMove(event.clientX, event.clientY, "onmousemove");
	}
	this.targetElement.onmouseup = function(event) {
		doOnEnd(event.clientX, event.clientY, "onmouseup");
	}
	
	// Event handlers for touch screen interaction
	this.targetElement.ontouchstart = function(event) {
		event.preventDefault();
		var touchEvent = event.changedTouches[0];
		doOnStart(touchEvent.pageX, touchEvent.pageY, "ontouchstart");
	}
	this.targetElement.ontouchmove = function(event) {
		event.preventDefault();
		var touchEvent = event.changedTouches[0];
		doOnMove(touchEvent.pageX, touchEvent.pageY, "ontouchmove");
	}
	this.targetElement.ontouchend = function(event) {
		event.preventDefault();
		var touchEvent = event.changedTouches[0];
		doOnEnd(touchEvent.pageX, touchEvent.pageY, "ontouchend");
	}
}

//The user must define a method to be called when a given gesture occurs
gesture.setHorizontalHandler = function( callback )
{
	this.onhorizontalswipe = callback;
}
gesture.setVerticalHandler = function( callback )
{
	this.onverticalswipe = callback;
}


var gestureData = function(direction, distance, duration)
{
	this.direction = direction;
	this.distance = distance;
	this.duration = duration;
}

/**
doOnStart - handler for both mousedown and touchstart events. 
	1) Record the starting position of the swipe.
*/
function doOnStart(x,y,eventname)
{
	if (typeof gesture === "object") 
	{
		debug.log("doOnStart", eventname + ": (x, y) = " + x + ", " + y, debug.info);
		gesture.eventInProgress = true;
		gesture.start = new Date();
		gesture.firstX = x;
		gesture.firstY = y;
		gesture.lastX = x;
		gesture.lastY = y;		
	}
}
/**
doOnMove - handler for both mousemove and touchmove events:
	1) Record the current position of an active swipe.
*/
function doOnMove(x,y,eventname)
{
	if ((typeof gesture === "object")  && (gesture.eventInProgress))
	{
		debug.log("doOnMove", eventname + ": (x, y) = " + x + ", " + y, debug.info);
		gesture.lastX = x;
		gesture.lastY = y;			
	}
}
/**
doOnEnd - handler for both mouseup and touchend events:
	1) Caculate the change in X position and the change in Y position.
	2) Determine if swipe direction is horizontal or vertical.
	3) Determine if swipe distance exceeds a minimum threshold.
*/
function doOnEnd(x,y,eventname)
{
	//Tune these values to your liking. This represents an appropriate minimum distance a swipe must travel before the event is determined to have occured.
	var thresholdX = screen.width * 0.03;	//3% of screen height/width is a good start
	var thresholdY = screen.height * 0.03;

	if (typeof gesture === "object") 
	{
		debug.log("doOnEnd", eventname + ": (x, y) = " + x + ", " + y, debug.info);
		gesture.eventInProgress = false;
		gesture.end = new Date();
		var duration = gesture.end.getTime() - gesture.start.getTime();
		debug.log("doOnEnd", eventname + ": (duration) = " + duration, debug.info);
		var dX = gesture.lastX - gesture.firstX;
		var dY = gesture.lastY - gesture.firstY;
		debug.log("doOnEnd", eventname + ": (dX, dY) = " + dX + ", " + dY, debug.info);

		if (Math.abs(dX) > Math.abs(dY)) 
		{
			// If the change in the start/end X coordinates is greater than the change in start/end Y coordinates, this is a horizontal swipe
			if (Math.abs(dX) > thresholdX)
			{
				//An actual horizontal swipe occurs when the change in start/end X coordinates is greater than a minimum threshold
				debug.log("doOnEnd", eventname + " :" + (dX > 0 ? "Right" : "Left") + " horizontal swipe detected", debug.info);
				
				if (gesture.onhorizontalswipe === null) { return false; }
				var e = new gestureData((dX > 0 ? 1 : -1), dX, duration);
				gesture.onhorizontalswipe(e);
				
			}			
		} 
		else {
			// If the change in the start/end Y coordinates is greater than the change in start/end X coordinates, this is a vertical swipe
			if (Math.abs(dY) > thresholdY)
			{
				//An actual vertical swipe occurs when the change in start/end Y coordinates is greater than a minimum threshold
				debug.log("doOnEnd", eventname + " :" + (dY > 0 ? "Down" : "Up") + " vertical swipe detected", debug.info);
				
				if (gesture.onverticalswipe === null) { return false; }
				var e = {};
				var e = new gestureData((dY > 0 ? 1 : -1), dY, duration);
				gesture.onverticalswipe(e);				
			}
		}
	}
}




/* 
 *	Supporting Horizontal & Vertical Swipe gestures in BlackBerry 6 or Tablet OS browser:
 *
 *	1) Include reference to "swipeevents.js" JavaScript library.
 *
 *  2) Define the target element to listen for swipe events using the setTargetElement method
 *
 *	3) Define local callback functions raised when vertical & horizontal swipe events occur
 *		These functions can have the following signature: function(e) { ... }
 *		The single parameter e has the following properties: direction, distance, duration
 */


function horizontalHandler(e)
{
	var msg = (e.direction > 0 ? "Right" : "Left") + " (" + e.distance + " pixels in " + e.duration + " ms)";
	document.getElementById("swipearea").innerHTML = msg;
}
function verticalHandler(e)
{
	var msg = (e.direction > 0 ? "Down" : "Up") + " (" + e.distance + " pixels in " + e.duration + " ms)";
	document.getElementById("swipearea").innerHTML = msg;
}

function doPageLoad()
{
	//gesture object is created when you include the JS file
	//will use 'document' by default

	var ele = document.getElementById("swipearea");
	gesture.setTargetElement(ele);

	gesture.setHorizontalHandler(horizontalHandler);
	gesture.setVerticalHandler(verticalHandler);
	
	
}

window.addEventListener("load",         doPageLoad,   false);


function doTouch(e)
{
	/* block page scrolling so as not to interfere with the swipe gestures */
	e.preventDefault();
}
//document.addEventListener("touchstart", doTouch,  false);
document.addEventListener("touchmove",  doTouch,  false);
//document.addEventListener("touchend",   doTouch,  false);
