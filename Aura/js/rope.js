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
/*global window*/

/**
 * This Object maintains the Ropes we have created and performs their animation.
 * 
 * @param opt Should contain fps (our desired framerate) and timeStep (the distance to move our Rope per time unit.)
 * 
 * @returns {RopeHandler} The Object used to control our Ropes.
 */
function RopeHandler(opt) {

	/**
	 * Variables related to the display of our Ropes.
	 */
	var timerUpdate = 1 / opt.fps * 1000;
	var timeStep = opt.timeStep;

	/**
	 * Variables related to the initialization of our Ropes.
	 */
	var ropes			= [];
	var numRopes		= 0;
	var NUM_POINTS		= 4;
	var MAX_ANCHOR_MOVE	= 5;

	//Type to keep track of (X,Y) coordinates.
	function Vector(x, y) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Variables to keep track of our mouse position, environment 'gravity', and Object acceleration; respectively.
	 */
	var mousePos	= new Vector(0, 0);
	var gravity		= new Vector(0, 9.8);
	var acc			= new Vector(0, 0);

	/**
	 * Add a listener to keep track of movement through touch.
	 */
	document.getElementById("my_path").addEventListener("touchmove", function(e) {
			e.preventDefault();
			mousePos.x = e.touches[0].pageX;
			mousePos.y = e.touches[0].pageY;
	}, true);

	/**
	 * Add a listener to keep track of movement through mouse movement.
	 */
	document.getElementById("my_path").addEventListener("mousemove", function(e) {
			e.preventDefault();
			mousePos.x = e.pageX;
			mousePos.y = e.pageY;
	}, true);

	/**
	 * Add a listener to keep track of movement caused by physical device movement.
	 */
	window.addEventListener("devicemotion", function(event) {
		acc.x = event.accelerationIncludingGravity.x;
		acc.y = -event.accelerationIncludingGravity.y;
	}, true);
	
	/**
	 * An Object to be attached to a Rope.
	 */
	function Attachment(name, elem, x, y) {
		this.element	= elem;
		this.id			= name;
		this.offsetX	= x;
		this.offsetY	= y;
	}
	
	/**
	 * Describes the animation parameters for our Ropes.
	 */
	function Animation() {
		this.startTime	= 0;
		this.length		= 0;
		this.fromValue	= 0;
		this.toValue	= 0;
		this.running	= 0;
	}
	
	/**
	 * A Rope.
	 */
	function Rope() {
		this.element			= null;
		this.anchorX			= 0;
		this.anchorY			= 0;
		this.oldAnchorX			= 0;
		this.oldAnchorY			= 0;
		this.numPoints			= 0;
		this.segmentLen			= 0;
		this.points				= [];
		this.animate			= 0;
		this.upAnim				= new Animation();
		this.pulledUp			= true;
		this.length				= 0;
		this.attachTo			= null;
		this.attachedElement	= null;
		this.attachedRopes		= [];
		this.numRopesAttached	= 0;
		this.updateOnce			= 0;
		this.angleOffs			= 0;
		this.slave				= false;
	}
	
	/**
	 * Performs a movement update for all of our Ropes.
	 */
	function update(timestep) {
		var i			= 0;
		var j			= 0;
		var slave		= 0;
		var attached	= 0;
	
		for(var r = 0; r < numRopes; ++r) {
			if (ropes[r].animate) {
				//Collect accelerations.
				for(i = 0; i < NUM_POINTS; ++i) {
					ropes[r].points[i].a.x = gravity.x;
					ropes[r].points[i].a.y = gravity.y;
				}
				
				//Limit anchor motion to make animations less crazy.
				var dx = ropes[r].anchorX - ropes[r].oldAnchorX;
				var dy = ropes[r].anchorY - ropes[r].oldAnchorY;
				if(!ropes[r].slave) {
					dy += document.getElementById("dock").offsetTop + document.getElementById("dock").offsetHeight - 45;
				}

				var len = Math.sqrt(dx*dx + dy*dy);
				if (len > MAX_ANCHOR_MOVE) {
					dx = dx * ((len - MAX_ANCHOR_MOVE) / len);
					dy = dy * ((len - MAX_ANCHOR_MOVE) / len);
		
					for(i = 0; i < NUM_POINTS; ++i) {
						ropes[r].points[i].pos.x += dx;
						ropes[r].points[i].pos.y += dy;
						ropes[r].points[i].oldPos.x += dx;
						ropes[r].points[i].oldPos.y += dy;
					}

					for(attached = 0; attached < ropes[r].numRopesAttached; ++attached) {
						slave = ropes[r].attachedRopes[attached].rope;
						if(slave instanceof Rope) {
							for(i = 0; i < NUM_POINTS; ++i) {
								slave.points[i].pos.x += dx;
								slave.points[i].pos.y += dy;
								slave.points[i].oldPos.x += dx;
								slave.points[i].oldPos.y += dy;
							}
						}
					}
				}

				//Step each point.
				for(i = 1; i < NUM_POINTS; ++i) {
					var tempX	= ropes[r].points[i].pos.x;
					var tempY	= ropes[r].points[i].pos.y;
					var x		= ropes[r].points[i].pos.x;
					var y		= ropes[r].points[i].pos.y;
					var oldX	= ropes[r].points[i].oldPos.x;
					var oldY	= ropes[r].points[i].oldPos.y;
					var ax		= ropes[r].points[i].a.x;
					var ay		= ropes[r].points[i].a.y;

					ropes[r].points[i].pos.x = 1.99*x - 0.99*oldX + ax * timestep * timestep;
					ropes[r].points[i].pos.y = 1.99*y - 0.99*oldY + ay * timestep * timestep;
					ropes[r].points[i].oldPos.x = tempX;
					ropes[r].points[i].oldPos.y = tempY;
				}
			
				//Handle constraints.
				for(i = 1; i < NUM_POINTS; ++i) {
					dx = ropes[r].points[i].pos.x - ropes[r].points[i - 1].pos.x;
					dy = ropes[r].points[i].pos.y - ropes[r].points[i - 1].pos.y;
					
					len = Math.sqrt(dx*dx + dy*dy);
					if(Math.abs(len - ropes[r].points[i].length) > 0.0001) {
						var diff = (len - ropes[r].points[i].length) / len;
						ropes[r].points[i - 1].pos.x += dx * 0.5 * diff;
						ropes[r].points[i - 1].pos.y += dy * 0.5 * diff;
						ropes[r].points[i].pos.x -= dx * 0.5 * diff;
						ropes[r].points[i].pos.y -= dy * 0.5 * diff;
					}

					ropes[r].points[0].pos.x = ropes[r].anchorX;
					ropes[r].points[0].pos.y = ropes[r].anchorY;
					if(!ropes[r].slave) {
						ropes[r].points[0].pos.y += document.getElementById("dock").offsetTop + document.getElementById("dock").offsetHeight - 45;
					}
				}

				//Update attached slave ropes.
				for(attached = 0; attached < ropes[r].numRopesAttached; ++attached) {
					slave = ropes[r].attachedRopes[attached].rope;
					if(slave instanceof Rope) {
						dx = ropes[r].points[ropes[r].numPoints - 2].pos.x - ropes[r].points[ropes[r].numPoints - 1].pos.x;
						dy = ropes[r].points[ropes[r].numPoints - 2].pos.y - ropes[r].points[ropes[r].numPoints - 1].pos.y;
						var ang = Math.atan2(dy, dx) + Math.PI/2 + (ropes[r].angleOffs * Math.PI / 180);
				
						slave.anchorX = ropes[r].points[ropes[r].numPoints-1].pos.x + Math.cos(ang + ropes[r].attachedRopes[attached].a) * ropes[r].attachedRopes[attached].l;
						slave.anchorY = ropes[r].points[ropes[r].numPoints-1].pos.y + Math.sin(ang + ropes[r].attachedRopes[attached].a) * ropes[r].attachedRopes[attached].l;
						if (!slave.animate) {
							slave.animate = ropes[r].animate;
						}
					}
				}

				if(ropes[r].updateCountDown > 1){
					ropes[r].updateCountDown--;
				}else if(ropes[r].updateCountDown == 1){
					ropes[r].updateCountDown = 0;
					ropes[r].animate = 0;
				}

				ropes[r].oldAnchorX = ropes[r].anchorX;
				ropes[r].oldAnchorY = ropes[r].anchorY;
				if (!ropes[r].slave) {
					ropes[r].oldAnchorY += document.getElementById("dock").offsetTop + document.getElementById("dock").offsetHeight - 45;
				}
			}
		}
	}
	
	/**
	 * Renders our Ropes.
	 */
	function draw() {
		var i = 0;

		for(i = 0; i < numRopes; ++i) {		
			if(ropes[i].upAnim.running) {
				ropes[i].anchorY = ropes[i].upAnim.getVal((new Date()).getTime());
			}

			//Add a light breeze to ropes with clouds.
			if(Math.floor(Math.random() * 101) > 96) {
				if(!ropes[i].slave) {
					var wind = Math.floor(Math.random() * 3) - 1;
					ropes[i].anchorX += wind;
				}
			}
		}

		if(acc.x * acc.x + acc.y * acc.y > 9) {
			var accAngle = Math.atan2(acc.y, acc.x);
			gravity.x = Math.cos(accAngle) * 9.82;
			gravity.y = Math.sin(accAngle) * 9.82;
		} else {
			gravity.x = 0;
			gravity.y = 9.82;
		}
		
		update(timeStep);
		update(timeStep);
		update(timeStep);
		update(timeStep);
		update(timeStep);

		if(numRopes !== 0) {
			for(i = 0; i < numRopes; ++i) {
				var startPos = " M " + ropes[i].points[0].pos.x + " " +ropes[i].points[0].pos.y;	
			 
				var curves="";
			
				for(var k = 1; k < NUM_POINTS - 2; ++k) {
					if(k == NUM_POINTS - 3) {
						if(i === 0) {
							curves += " S " + ropes[i].points[k].pos.x + " " + ropes[i].points[k].pos.y + " " + ropes[i].points[k + 2].pos.x + " " + ropes[i].points[k + 2].pos.y;
						} else {
							curves += " L " + ropes[i].points[k + 2].pos.x + " " + ropes[i].points[k + 2].pos.y;
						}
					} else {
					 curves += " S " + ropes[i].points[k].pos.x + " " + ropes[i].points[k].pos.y + " " + ropes[i].points[k + 1].pos.x + " " + ropes[i].points[k + 1].pos.y;
					}
				}
	
				ropes[i].element.setAttribute("d", startPos + curves);
					
				if(ropes[i].attachedElement instanceof Attachment){
					// Draw "cloud"
					var dx = ropes[i].points[ropes[i].numPoints - 2].pos.x - ropes[i].points[ropes[i].numPoints - 1].pos.x;
					var dy = ropes[i].points[ropes[i].numPoints - 2].pos.y - ropes[i].points[ropes[i].numPoints - 1].pos.y;
					var a = Math.atan2(dy, dx) + Math.PI/2;
					var b = a * 180 / Math.PI + ropes[i].angleOffs;
					
					var translateX = ropes[i].points[ropes[i].numPoints-1].pos.x - ropes[i].attachedElement.offsetX;
					var translateY = ropes[i].points[ropes[i].numPoints-1].pos.y - ropes[i].attachedElement.offsetY;
					
				
					if (ropes[i].attachedElement.element.nodeName.toUpperCase() == "IMAGE") {
						ropes[i].attachedElement.element.setAttribute("transform", "translate("+translateX+" "+ translateY+ ") rotate("+b+" "+ropes[i].attachedElement.offsetX+" " +ropes[i].attachedElement.offsetY +") ");
					} 
					else if (ropes[i].attachedElement.element.nodeName.toUpperCase() == "DIV") {
						ropes[i].attachedElement.element.style.webkitTransformOrigin = ropes[i].attachedElement.offsetX+" " +ropes[i].attachedElement.offsetY ;
						ropes[i].attachedElement.element.style.webkitTransform = "translate3d("+translateX+"px, "+ translateY+ "px, 0px) rotate3d(0,0,1,"+b+"deg)";
					}
				}
			}
			
			setTimeout(function() {
				setTimeout(draw, 15);
			}, 1);
		}
	}

	/**
	 * The main timer which will re-draw every timerUpdate interval.
	 */
	var mainTimer = setTimeout(draw, timerUpdate);

	/**
	 * Describes a Point; current position, old position, acceleration, length.
	 */
	function Point() {
		this.pos	= new Vector(0, 0);
		this.oldPos	= new Vector(0, 0);
		this.a		= new Vector(0, 0);
		this.length	= 0;
	}

	/**
	 * Describes an Rope attached to an Object.
	 */
	function RopeAttachment(rope, x, y) {
		this.rope = rope;
		this.a = Math.atan2(y, x);
		this.l = Math.sqrt(x*x + y*y);
	}

	/**
	 * Configures values for an animation. Used in conjuction with raising and lowering Objects/Ropes.
	 */
	Animation.prototype.init = function(startTime, length, fromValue, toValue) {
		this.startTime = startTime;
		this.length = length;
		this.fromValue = fromValue;
		this.toValue = toValue;
		this.running = 1;
	};

	/**
	 * Returns the amount of time we have animated for.
	 */
	Animation.prototype.getVal = function(timeNow) {
		if (timeNow <= this.startTime) {
			return this.fromValue;
		} else if(timeNow > this.startTime + this.length) {
			this.running = 0;
			return this.toValue;
		} else {
			return this.fromValue + (this.toValue - this.fromValue) * ((timeNow - this.startTime) / this.length);
		}
	};
 
	/**
	 * Attaches an Object to a specific location.
	 */
	Rope.prototype.attachElement = function(elemID, args) {
		var elem = document.getElementById(elemID);
		
		if(!args) {
			args = {"offsetX": elem.offsetWidth/2, "offsetY": elem.offsetHeight / 2};
		} else {
			args.offsetX = isNaN(args.offsetX) ? elem.offsetWidth/2: args.offsetX;
			args.offsetY = isNaN(args.offsetY) ? elem.offsetHeight/2: args.offsetY;		
		}
		
		this.attachedElement = new Attachment(elemID, elem, args.offsetX, args.offsetY);
	};
	
	/**
	 * Attaches a Rope to a specific location.
	 */
	Rope.prototype.attachRope = function(rope, offX, offY) {
		this.attachedRopes[this.numRopesAttached] = new RopeAttachment(rope, offX, offY);
		++this.numRopesAttached;
		rope.slave = true;
	};

	/**
	 * Drops our Ropes down.
	 */
	Rope.prototype.fallDown = function() {
		var date = new Date();
		this.animate = 1;
		this.pulledUp = false;
		
		for(var i = 0; i < NUM_POINTS; ++i) {
			this.points[i].oldPos.x = this.points[i].pos.x;
			this.points[i].oldPos.y = this.points[i].pos.y;
		}	
		
		var push = Math.random() * 6 - 3;
		this.points[2].pos.x += push;
		this.points[3].pos.x += push;
		this.upAnim.init(date.getTime(), 600, this.anchorY, 0);
	};
	
	/**
	 * Pulls our Ropes up.
	 */
	Rope.prototype.pullUp = function() {
		this.pulledUp = true;
		var date = new Date();
		this.upAnim.init(date.getTime(), 600, this.anchorY, -450);
	};
	
	/**
	 * Initializes a Rope.
	 */
	function initRope(rope, args) {
		var i = 0;
		var sLen = 0;

		rope.length	= args.length;
		rope.points	= [];
		sLen		= rope.length / (NUM_POINTS - 2);

		for(i = 0; i < NUM_POINTS; ++i) {
			rope.points[i]			= new Point();
			rope.points[i].a.x		= 0;
			rope.points[i].a.y		= 0;
			rope.points[i].pos.x	= rope.anchorX;
			rope.points[i].oldPos.x	= rope.anchorX;
			
			if(i >= NUM_POINTS - 2) {
				rope.points[i].pos.y = rope.anchorY + (NUM_POINTS - 3) * sLen + (i - (NUM_POINTS - 2)) * (sLen / 2);
				rope.points[i].length = sLen / 2;
			} else {
				rope.points[i].pos.y = rope.anchorY + i * sLen;
				rope.points[i].length = sLen;
			}
			rope.points[i].oldPos.y = rope.points[i].pos.y;
		}	
	}
	
	/**
	 * Creates a Rope based on the provided arguments; defaults to args if opt is invalid.
	 */
	this.createRope = function(opt) {
		var args = {"length":100, "width":4, "anchorX":0, "anchorY":0, "animate":1, "color":"brown", "angle":0, "slave":false};
		
		if(opt) {
			args.length		= isNaN(opt.length)			? args.length	: opt.length;
			args.width		= isNaN(opt.width)			? args.width	: opt.width;
			args.anchorX	= isNaN(opt.anchorX)		? args.anchorX	: opt.anchorX;
			args.anchorY	= isNaN(opt.anchorY)		? args.anchorY	: opt.anchorY;
			args.animate	= isNaN(opt.animate)		? args.animate	: opt.animate; 
			args.color		= !opt.color				? args.color	: opt.color;
			args.angle		= isNaN(opt.angle)			? args.angle	: opt.angle; 
			args.slave		= opt.slave != "undefined"	? opt.slave		: args.slave;
		}
		
		var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("fill", "none");
		path.setAttribute("style", "stroke:"+args.color+";stroke-width:"+args.width+";filter:url()");
		path.setAttribute("id", "ropes" + numRopes);
		
		var svgElem = document.getElementById("my_path");
		if(svgElem.hasChildNodes()) {
			svgElem.insertBefore(path, svgElem.firstChild);
		} else {
			document.getElementById("my_path").appendChild(path);
		}	
		
		ropes[numRopes] = new Rope();
		ropes[numRopes].element		= path;	
		ropes[numRopes].numPoints	= NUM_POINTS;
		ropes[numRopes].segmentLen	= opt.length / 3;
		ropes[numRopes].animate		= args.animate;
		ropes[numRopes].id			= "ropes" + numRopes;
		ropes[numRopes].anchorX		= args.anchorX;
		ropes[numRopes].anchorY		= args.anchorY;
		ropes[numRopes].oldAnchorX	= args.anchorX;
		ropes[numRopes].oldAnchorY	= args.anchorY;
		ropes[numRopes].lock		= args.lock;
		ropes[numRopes].length		= args.length; 
		ropes[numRopes].angleOffs	= args.angle;
		ropes[numRopes].slave		= args.slave;
		initRope(ropes[numRopes],args);
		
		if(opt.attachElement) {
			ropes[numRopes].attachElement(opt.attachElement, {"offsetX":opt.attachX, "offsetY":opt.attachY});
		}

		return ropes[++numRopes - 1];
	};
}