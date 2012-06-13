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

//Global variables
var lower_range = 2, upper_range = -1, loopSize = 5, workerArray = [], numComplete = 0, dtStart, dtEnd;


/**
 * Calculates whether a give number is prime:
 */
function isPrime(num) {
	var root, primeFound, i;
	
	root = Math.floor(Math.sqrt(num));
	primeFound = true;

	for (i = 2; i <= root; i = i + 1) {
		if ((num % i) === 0) {
			primeFound = false;
			break;
		}
	}
	return (primeFound === true);
}

/**
 * This method will perform multiple iterations of calculating the number of prime numbers within a given range.
 * The user will see the UI freeze while this processing is occuring, and will not be able to interact with the page.
 */
function runMainThread() {
	var ele, dtStart, i, found, j, dtEnd;
	
	ele = document.getElementById("outputNormal");
	ele.innerHTML = "<h3>Using Main Thread:</h3>";
	
	dtStart = new Date();
	for (i = 1; i <= loopSize; i = i + 1) {
		found = 0;
		for (j = lower_range; j <= upper_range; j = j + 1) {
			if (j <= 3) {
				found += 1;
			}
			else {		
				if (isPrime(j))
				{
					found += 1;
				}
			}
		}
		ele.innerHTML += "<div>#" + i + " found: " + found + "</div>";
	}
	dtEnd = new Date();
	ele.innerHTML += "<p>Duration: " + (dtEnd.getTime() - dtStart.getTime()) + " (ms)</p>";
}

/**
 * object sent to a worker via the postMessage method from the main thread.
 */
function MainMessage(workerid, lower_range, upper_range)  {
	this.workerid = workerid;
	this.lower_range = lower_range;
	this.upper_range = upper_range;
}
		
/**
 * Removes completed worker processes from memory.  Browsers impose a max limit to the number of active workers.  
 *  By terminating them once completed, you can ensure there are no conflicts with exceeding the max limit.
 * 
 */
function cleanupWorkers() {
	var i;

	for (i = 1; i <= loopSize; i = i + 1)
	{
		workerArray[i].terminate();
	}
}

function onWorkerMessage(event) {
	var ele = document.getElementById("outputWorker");

	ele.innerHTML += "<div>#" + event.data.workerid + " found: " + event.data.found + "</div>";
	numComplete += 1;
	if (numComplete === loopSize) {
		dtEnd = new Date();
		ele.innerHTML += "<p>Duration: " + (dtEnd.getTime() - dtStart.getTime()) + " (ms)</p>";
		cleanupWorkers();
	}
}

/**
 * This method will use multiple Worker pools to calcuate the number of prime numbers found within a range.
 * The user will see asyncronous updates of the results on the page.
 */
function runWorkers()
{
	try
	{
		var ele, i, message;
		
		ele = document.getElementById("outputWorker");
		ele.innerHTML = "<h3>Using Workers:</h3>";

		numComplete = 0;
		dtStart = new Date();
		
		for (i = 1; i <= loopSize; i = i + 1)
		{
			/*
			* Using workers involves three steps:
			* 1) Creating a Worker object
			* 2) Defining a callback method invoked when the Worker calls its postMessage() method
			* 3) sending data to the worker from the main thread using the postMessage() method.
			*/
			
			//The following worker path works for Tablet OS, but not for Smartphone:
			//
			workerArray[i] = new Worker("../../js/html5/the_worker.js");		//need to use the path from where the code is being executed
			// workerArray[i].onmessage = function(event) {
				// ele.innerHTML += "<div>#" + event.data.workerid + " found: " + event.data.found + "</div>";
				// numComplete += 1;
				// if (numComplete === loopSize) {
					// dtEnd = new Date();
					// ele.innerHTML += "<p>Duration: " + (dtEnd.getTime() - dtStart.getTime()) + " (ms)</p>";
					// cleanupWorkers();
				// }
			// };
			workerArray[i].onmessage = onWorkerMessage;
			message = new MainMessage(i, lower_range, upper_range);
			workerArray[i].postMessage(message);
		}
	}
	catch(e) {
		debug.log("runWorkers", e, debug.exception);
	}
}

/**
 *  Called when a user clicks on one of the 'Begin' buttons:
 */
function calculate(useWorkers) {
	var value = document.getElementById("txtUpper").value;
	upper_range = parseInt(value, 10);
	
	if (useWorkers) {
		runWorkers();
	}
	else {
		document.getElementById("comments").innerHTML = "Processing using main (event/UI) thread.  This application will appear 'frozen' until the processing has completed since the main thread is occupied.";
		runMainThread();
	}
}
