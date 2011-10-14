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
var canvas_header_height = 30;
var panel_size;
var lastX = -1;
var lastY = -1;
var startTime = null;
var activeColor = "#00F";
var brushSize = 2;
var numButtonsInPanel = 11;

var page_header_height = 0;

	
const colorArray = [
	"RED", "PURPLE", "BLUE", "YELLOW", "GREEN", "ORANGE", "BLACK", "WHITE"
];

function changeColor(index) {
	activeColor = colorArray[index];
	displayHeader("Drawing color is now "+colorArray[index]);
}

function drawPanel() {
	//narrower brush button
	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.arc(panel_size/2, canvas_header_height+panel_size/2-2, panel_size/10, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.fill();
	
	//wider brush button
	ctx.beginPath();
	ctx.arc(panel_size*3/2, canvas_header_height+panel_size/2-2, panel_size/3, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.fill();
	
	//eight color buttons
	for (var i=0; i<colorArray.length; i++) {
		ctx.fillStyle = colorArray[i];
		ctx.fillRect((i+2)*panel_size+3, canvas_header_height, panel_size-6, panel_size-6);
	}
	
	//clear button
	ctx.beginPath();
	ctx.arc(panel_size*(numButtonsInPanel-0.5), canvas_header_height+panel_size/2-2, panel_size/3, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.stroke();
	
	for (var i=0; i<numButtonsInPanel; i++) {
		ctx.strokeRect(i*panel_size+3, canvas_header_height, panel_size-6, panel_size-6);
	}
}

//Display a title at the top of the canvas, indicating the type of event that occurred as well as the current screen coordinates:
function displayHeader(msg) 
{
    ctx.clearRect(0, 0, canvas.width, canvas_header_height);

    var font = '15pt Arial';
    var fontpadding = 3;
    if (window.blackberry != null) {
        font = '8pt Arial';
    }
    ctx.fillStyle = '#000';
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillText(msg, fontpadding, fontpadding);
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

function drawWithEvent(x, y, eventName) {
	if (withinPanelBound(y)) {
		lastX = -1;
		lastY = -1;
		return;
	}
	if (x || y) {
		//Initialize cursor position if it hasn't been already:
		if ((lastX == -1) || lastY == -1) {
			lastX = x;
			lastY = y - canvas_header_height;
		}
		displayHeader(eventName + " at " + x + ", " + (y - canvas_header_height));
		drawPen(x, y - canvas_header_height);
		lastX = x;
		lastY = y - canvas_header_height;
	}
}

function withinPanelBound(y) {
	return ((y > (page_header_height + canvas_header_height)) && (y < (page_header_height + canvas_header_height + panel_size + brushSize)));
}

function clearCanvas() {
	//clear the drawing section of the canvas, but not its header or tools panel:
    ctx.clearRect(0, canvas_header_height + panel_size, canvas.width, canvas.height - canvas_header_height);
    displayHeader("Canvas cleared");
}

function selectEvent(x, y) {
	if (!withinPanelBound(y)){
		return;
	}
	
	var eventIndex = parseInt(x/panel_size);
	
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
	}
}

function showEventDescription(x, y) {
	if (!withinPanelBound(y)){
		return;
	}
	
	var eventIndex = parseInt(x/panel_size);
	var text = "";
	switch(eventIndex){
		case 0:
			text = "Narrower brush";
			break;
		case 1:
			text = "Wider brush";
			break;
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			text = "Change drawing color to "+colorArray[eventIndex-2];
			break;
		case 10:
			text = "Clear canvas";
	}
	
	displayHeader(text);
}

function doMouseUp(event) 
{
	var x = event.clientX;
	var y = event.clientY;
	if (y >  page_header_height + canvas_header_height)
	{
		drawWithEvent(x, y, "Pointer");
	}
}
//When the cursor is moved via the trackpad, draw a line segment from the last known coordinates to the current cursor position
//Unless the cursor is in the panel, in which case show the function of the current button
function doMouseMove(event) {
	var x = event.clientX;
	var y = event.clientY;
	if (y >  page_header_height + canvas_header_height)
	{
		showEventDescription(x, y);
		drawWithEvent(x, y, "Pointer");
	}
}
function doMouseDown(event) 
{
	var x = event.clientX;
	var y = event.clientY;
	if (y >  page_header_height + canvas_header_height)
	{
		selectEvent(x, y);
	}
}


//When screen is touched, save the (x,y) coordinates into lastX and lastY variables
function doTouchStart(event) 
{
//    event.preventDefault();


    var touchEvent = event.changedTouches[0];
	var x = touchEvent.pageX;
	var y = touchEvent.pageY;
	
    if (x || y) {
        if (withinPanelBound(y)) {
			showEventDescription(x, y);
		} 
		else {
			if (touchEvent.pageY >  page_header_height + canvas_header_height)
			{
				//Initialize the starting position:
				lastX = touchEvent.pageX;
				lastY = touchEvent.pageY;
				return true;
			}
			else {
			return false;
			}
		}
    }
}
//Similar to the mousemove event, draw a line segment when touchmove event occurs
function doTouchMove(event) 
{
    event.preventDefault();
    var touchEvent = event.changedTouches[0];
	var x = touchEvent.pageX;
	var y = touchEvent.pageY;
	
	if (y >  page_header_height + canvas_header_height)
	{
		drawWithEvent(x, y, "TouchMove");
	}
}

//Capture the touchend event and display header message; Clear the screen if the user has double-tapped the canvas
function doTouchEnd(event) 
{
//    event.preventDefault();


    var touchEvent = event.changedTouches[0];

	if (withinPanelBound(touchEvent.pageY)) 
	{
		selectEvent(touchEvent.pageX, touchEvent.pageY);
	} 
	else 
	{
		if (touchEvent.pageX || touchEvent.pageY) 
		{
			if (touchEvent.pageY >  page_header_height + canvas_header_height)
			{
				displayHeader("TouchEnd at " + touchEvent.pageX + ", " + touchEvent.pageY);
			}
		}

		//If user double-taps the screen in less than 250 milliseconds, clear the canvas
		var end = new Date();
		var duration = end - startTime;
		if (duration < 250) 
		{
		//
		// Feature removed based on user feedback (people don't like the double-tap-clear)
		//
		//	clearCanvas();
		//
		}
		startTime = new Date();
	}
}
//Capture the touchcancel event and display header message
function doTouchCancel(event) 
{
    event.preventDefault();
    var touchEvent = event.changedTouches[0];
    if (touchEvent.pageX || touchEvent.pageY) {
        displayHeader("TouchCancel at " + touchEvent.pageX + ", " + touchEvent.pageY);
    }
}


function widerBrush() 
{
    if (brushSize < 30) 
	{
        brushSize = brushSize + 1;
        displayHeader("Brush widened to " + brushSize);
    }
}
function narrowBrush() 
{
    if (brushSize > 1) 
	{
        brushSize = brushSize - 1;
        displayHeader("Brush narrowed to " + brushSize);
    }
}


function doPageLoad() 
{
	//
	// Use 'addEventListener' as a best practice (many-to-one) instead of {ELEMENT}.on{EVENT} (one-to-one)
	//
	//Q: Should we change the following to canvas.addEventListener ... ?
	//
	document.addEventListener("touchstart",  doTouchStart,  false);
	document.addEventListener("touchmove",   doTouchMove,   false);
	document.addEventListener("touchend",    doTouchEnd,    false);
	document.addEventListener("touchcancel", doTouchCancel, false);

	document.addEventListener("mousedown",   doMouseDown, false);
	document.addEventListener("mousemove",   doMouseMove, false);
	document.addEventListener("mouseup",     doMouseUp,   false);

    if (window.blackberry != null) 
	{
		//Give BlackBerry browser some extra height to adj
        canvas_header_height = 20;
    }

	
	var pageHeader = document.getElementById("pageHeader");
	if (pageHeader)
	{
		page_header_height = pageHeader.offsetTop + pageHeader.clientHeight;
	}
	
	//Create a canvas that is as wide as the current screen and as high as the screen minus the page header & footer:
    canvas = document.createElement('canvas');
    canvas.height = window.innerHeight - page_header_height;
    canvas.width = window.outerWidth;
	canvas.style.background = "white"
    document.getElementById('canvas').appendChild(canvas);

    ctx = canvas.getContext("2d");
    displayHeader("Touch the screen or move pointer to begin.");
	
	panel_size = Math.round(canvas.width/numButtonsInPanel/1.5,0);
    drawPanel();
}

window.removeEventListener("load",  createPageFooter, false);
window.addEventListener("load", doPageLoad, false);

