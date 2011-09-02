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

function doOnLoad()
{
	buildSpinner({ x : 100, y : 100, size : 50, degrees : 20 });
}
window.addEventListener("load", doOnLoad, false);


function buildSpinner(data) {
  
  var canvas = document.createElement('canvas');
  canvas.height = 200;
  canvas.width = 200;
  document.getElementById("theSpinner").appendChild(canvas);
  var ctx = canvas.getContext("2d"),
	i = 0, degrees = data.degrees, loops = 0, degreesList = [];
	
  for (i = 0; i < degrees; i++) {
	degreesList.push(i);
  }
  
  // reset
  i = 0;
  
  // so I can kill it later
  window.canvasTimer = setInterval(draw, 2000/degrees);  

  function reset() {
	ctx.clearRect(0,0,200,200); // clear canvas
	
	var left = degreesList.slice(0, 1);
	var right = degreesList.slice(1, degreesList.length);
	degreesList = right.concat(left);
  }
  
  function draw() {
	var c, s, e;

	var d = 0;

	if (i == 0) {
	  reset();
	}

	ctx.save();

	d = degreesList[i];
	c = Math.floor(255/degrees*i);
	ctx.strokeStyle = 'rgb(' + c + ', ' + c + ', ' + c + ')';
	ctx.lineWidth = data.size;
	ctx.beginPath();
	s = Math.floor(360/degrees*(d));
	e = Math.floor(360/degrees*(d+1)) - 1;

	ctx.arc(data.x, data.y, data.size, (Math.PI/180)*s, (Math.PI/180)*e, false);
	ctx.stroke();

	ctx.restore();

	i++;
	if (i >= degrees) {
	  i = 0;
	}
  }  
}
