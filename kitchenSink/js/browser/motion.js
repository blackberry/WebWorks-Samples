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

//http://dev.w3.org/geo/api/spec-source-orientation.html
//http://www.mobilexweb.com/samples/ball.html


var ball;

var delay = 5;	//ms
var state = true;

var cw = document.documentElement.clientWidth;
var ch = document.documentElement.clientHeight;

// Position Variables
var x = 0;
var y = 0;

// Acceleration
var ax = 0;
var ay = 0;

// Speed - Velocity
var vx = 0;
var vy = 0;

var vMultiplier = 0.01;

function handleDeviceMotion(event)
{
	// Process event.acceleration, event.accelerationIncludingGravity,
	// and event.rotationRate
	
	ax = event.accelerationIncludingGravity.x;
	ay = event.accelerationIncludingGravity.y;

	
	var motionInfo =  "Acceleration (without gravity) - " + event.acceleration + "<br/>";
	//Implementation that is unable to provide acceleration data without the effect of gravity (probably means lack of a gyroscope)
	//Hence why we report the acceleration with gravity
	
	motionInfo += "Acceleration X value - " + event.accelerationIncludingGravity.x + "<br/>";
	motionInfo += "Acceleration Y value - " + event.accelerationIncludingGravity.y + "<br/>";
	motionInfo += "Acceleration Z value - " + event.accelerationIncludingGravity.z + "<br/>";
	
	//Implementation here should not be able to report values either, as they should depend on a gyroscope
	motionInfo += "Rotation rate - " + event.rotationRate + "<br/>";
	if (event.rotationRate !== null)
	{
		motionInfo += "Rotation rate - " + event.rotationRate.alpha + "<br/>";
		motionInfo += "Rotation rate - " + event.rotationRate.beta + "<br/>";
		motionInfo += "Rotation rate - " + event.rotationRate.gamma;
	}
	setContent("motionInfo", motionInfo);

	//Calculate the velocity and acceleration of the ball and update its position accordingly
	vy = vy + -(ay);
	vx = vx + ax;

	y = parseInt(y + vy * vMultiplier);
	x = parseInt(x + vx * vMultiplier);
	
	if (x < 0) { x = 0; vx = 0; }
	if (y < 0) { y = 0; vy = 0; }
	if (x > cw - 20) { x = cw - 20; vx = 0; }
	if (y > ch - 20) { y = ch - 20; vy = 0; }
	
	ball.style.top  = y + "px";
	ball.style.left = x + "px";
}

function doLoad()
{
	ball = document.getElementById("ball");
	if (ball)
	{
		//Center the ball on the screen as its initial starting point:
		x = (Math.round(window.innerWidth  / 2, 0) - ball.style.width);
		ball.style.left = x + "px";
		
		//y = (Math.round(window.innerHeight / 2, 0) - ball.style.height);
		//ball.style.top  = y + "px";
	}
	
	
	
	//NOTE: DeviceMotion support is not ready yet in Ripple for Tablet OS platform (Oct 5, 2011).
	
	

	if (window.DeviceMotionEvent || window.ondevicemotion)
	{
		//Check to see if the current application supports the devicemotion
		window.addEventListener("devicemotion", handleDeviceMotion, false);
	} 
	else {
		setContent("motionInfo", "<i><b>Device Motion API</b> is not supported by this application.</i>");
		return false;
	}

}

/**
 * Use the addEventListener method instead of "window.onEVENT" to avoid losing existing handlers
 */
window.addEventListener("load", doLoad, false);
