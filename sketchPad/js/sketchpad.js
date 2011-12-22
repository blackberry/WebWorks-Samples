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
 
var canvas = null;
var ctx = null;
var header_height = 50;
var panel_size;
var lastX = -1;
var lastY = -1;
var startTime = null;
var activeColor = "#00F";
var brushSize = 2;
var numButtonsInPanel = 11;

var colorArray = [
	"RED", "PURPLE", "BLUE", "YELLOW", "GREEN", "ORANGE", "BLACK", "WHITE"
];

//Display a title at the top of the canvas, indicating the type of event that occurred as well as the current screen coordinates:
function displayHeader(msg) {
	var font, fontpadding;

    ctx.clearRect(0, 0, canvas.width, header_height);

    font = '15pt Arial';
    fontpadding = 10;
    if (window.blackberry !== null) {
        font = '8pt Arial';
        fontpadding = 3;
    }
    ctx.fillStyle = '#000';
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillText(msg, fontpadding, fontpadding);
}

function changeColor(index) {
	activeColor = colorArray[index];
	displayHeader("Drawing color is now "+colorArray[index]);
}

function drawPanel() {
	var i;

	//narrower brush button
	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.arc(panel_size/2, header_height+panel_size/2-2, panel_size/10, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.fill();
	
	//wider brush button
	ctx.beginPath();
	ctx.arc(panel_size*3/2, header_height+panel_size/2-2, panel_size/3, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.fill();
	
	//eight color buttons
	for (i=0; i<colorArray.length; i = i + 1) {
		ctx.fillStyle = colorArray[i];
		ctx.fillRect((i+2)*panel_size+3, header_height, panel_size-6, panel_size-6);
	}
	
	//clear button
	ctx.beginPath();
	ctx.arc(panel_size*(numButtonsInPanel-0.5), header_height+panel_size/2-2, panel_size/3, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.stroke();
	
	for (i=0; i<numButtonsInPanel; i = i + 1) {
		ctx.strokeRect(i*panel_size+3, header_height, panel_size-6, panel_size-6);
	}
}


//Draw a blue line from the last known (x,y) position to the current (x,y) position
function drawPen(x, y) {
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = activeColor;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function withinPanelBound(y) {
	return y < (header_height + panel_size + brushSize);
}

function drawWithEvent(x, y, eventName) {
	if (withinPanelBound(y)) {		
		lastX = -1;
		lastY = -1;
		return;
	}
	if (x || y) {
		//Initialize cursor position if it hasn't been already:
		if ((lastX === -1) || lastY === -1) {
			lastX = x;
			lastY = y;
		}
		displayHeader(eventName+" at " + x + ", " + y);
		drawPen(x, y);
		lastX = x;
		lastY = y;
	}
}

function clearCanvas() {
    ctx.clearRect(0, header_height+panel_size, canvas.width, canvas.height - header_height);
    displayHeader("Canvas cleared");
}


function widerBrush() {
    if (brushSize < 30) {
        brushSize = brushSize + 1;
        displayHeader("Brush widened to " + brushSize);
    }
}
function narrowBrush() {
    if (brushSize > 1) {
        brushSize = brushSize - 1;
        displayHeader("Brush narrowed to " + brushSize);
    }
}

function selectEvent(x, y) {
	if (!withinPanelBound(y)){
		return;
	}
	
	var eventIndex = parseInt(x / panel_size, 10);
	
	switch(eventIndex){
		case 0:
			narrowBrush();
			break;
		case 1:
			widerBrush();
			break;
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			changeColor(eventIndex-2);
			break;
		case 10:
			clearCanvas();
			break;
	}
}

function showEventDescription(x, y) {
	var eventIndex, text;

	if (!withinPanelBound(y)){
		return;
	}
	
	eventIndex = parseInt(x / panel_size, 10);
	text = "";
	switch(eventIndex){
		case 0:
			text = "Narrower brush";
			break;
		case 1:
			text = "Wider brush";
			break;
		case 2-9:
			text = "Change drawing color to "+colorArray[eventIndex-2];
			break;
		case 10:
			text = "Clear canvas";
			break;
	}
	
	displayHeader(text);
}

function doMouseDown(event) 
{
	selectEvent(event.clientX, event.clientY);
}
//When the cursor is moved via the trackpad, draw a line segment from the last known coordinates to the current cursor position
//Unless the cursor is in the panel, in which case show the function of the current button
function doMouseMove(event) 
{
	var x, y;
	
	x = event.clientX;
	y = event.clientY;
	showEventDescription(x, y);
	drawWithEvent(x, y, "Pointer");
}

//When screen is touched, save the (x,y) coordinates into lastX and lastY variables
function doTouchStart(event) 
{
    event.preventDefault();
	
	var touchEvent, x, y;

    touchEvent = event.changedTouches[0];
	x = touchEvent.pageX;
	y = touchEvent.pageY;
	
    if (x || y) {
        if (withinPanelBound(y)) {
			showEventDescription(x, y);
		} else {
			//Initialize the starting position:
			lastX = touchEvent.pageX;
			lastY = touchEvent.pageY;
		}
    }
}

//Similar to the mousemove event, draw a line segment when touchmove event occurs
function doTouchMove(event) 
{
    event.preventDefault();

	var touchEvent, x, y;

    touchEvent = event.changedTouches[0];
	x = touchEvent.pageX;
	y = touchEvent.pageY;
	
	drawWithEvent(x, y, "TouchMove");
}

function doMouseUp(event) 
{
	drawWithEvent(event.clientX, event.clientY, "Pointer");
}

//Capture the touchend event and display header message; Clear the screen if the user has double-tapped the canvas
function doTouchEnd(event) 
{
    event.preventDefault();

	var touchEvent, end, duration;
	
    touchEvent = event.changedTouches[0];
	
	if (withinPanelBound(touchEvent.pageY)) {
		selectEvent(touchEvent.pageX, touchEvent.pageY);
	} else {
		if (touchEvent.pageX || touchEvent.pageY) {
			displayHeader("TouchEnd at " + touchEvent.pageX + ", " + touchEvent.pageY);
		}

		//If user double-taps the screen in less than 250 milliseconds, clear the canvas
		end = new Date();
		duration = end - startTime;
		/*
		if (duration < 250) {
			clearCanvas();			// Some users have complained about this clear feature - comment it out for now.
		}
		*/
		startTime = new Date();
	}
}

function doTouchCancel(event) 
{
    event.preventDefault();
	
    var touchEvent = event.changedTouches[0];
    if (touchEvent.pageX || touchEvent.pageY) {
        displayHeader("TouchCancel at " + touchEvent.pageX + ", " + touchEvent.pageY);
    }
}




function doPageLoad() 
{
	document.addEventListener("touchstart",  doTouchStart,  false);
	document.addEventListener("touchmove",   doTouchMove,   false);
	document.addEventListener("touchend",    doTouchEnd,    false);
	document.addEventListener("touchcancel", doTouchCancel, false);

	document.addEventListener("mousedown",   doMouseDown,    false);
	document.addEventListener("mousemove",   doMouseMove,    false);
	document.addEventListener("mouseup",     doMouseUp,      false);

	
    if (window.blackberry !== null) {
        header_height = 20;
    }

	//Create a canvas that covers the entire screen:
    canvas = document.createElement('canvas');
    canvas.height = window.outerHeight;		//screen.availHeight;
    canvas.width = window.outerWidth;		//screen.availWidth;
    document.getElementById('canvas').appendChild(canvas);
    ctx = canvas.getContext("2d");
	
    displayHeader("Touch the screen or move pointer to begin (Double tap screen to clear)");
	panel_size = canvas.width/numButtonsInPanel;
    drawPanel();
}

window.addEventListener("load", doPageLoad, false);