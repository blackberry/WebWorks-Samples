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

/**
 * object sent to the main thread from this worker via the postMessage method.
 */
function WorkerMessage(workerid, found) 
{
	this.workerid = workerid;
	this.found = found;
}

/**
 * Calculates whether a give number is prime:
 */
function isPrime(num)
{
	var root = Math.floor(Math.sqrt(num));
	var primeFound = true;

	for (var i = 2; i <= root; i++)
	{
		if ((num % i) === 0)
		{
			primeFound = false;
			break;
		}
	}
	return (primeFound === true);
}

/**
 * This method is called when this worker receives a message from the main thread.
 * @param message - object send to this worker via a postMessage method called from the main thread.
 */
function handleOnMessage(message)
{
	var lower_range    = message.data.lower_range;
	var upper_range    = message.data.upper_range;
	var workerid = message.data.workerid;
	
	var found = 0;
	for (var j = lower_range; j <= upper_range; j++)
	{
		if (j <= 3) 
		{
			found += 1;
		}
		else {		
			if (isPrime(j))
			{
				found += 1;
			}
		}
	}
	//Once this worker has finished its processing, send a message back to the main thread:
	//Note: this message is a different type than was received during the onmessage event
	var message = new WorkerMessage(workerid, found);
	postMessage(message);
}

/**
 * Configure the onmessage event.  Define which method should be called when this worker process receives a message from the main thread.
 */
onmessage = handleOnMessage;