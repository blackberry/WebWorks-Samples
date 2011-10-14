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
 * Force an update of the application cache.  This initiates the 'checking' state to begin the caching process (if necessary).
 * This experience is similar to what happens during a page refresh.
 */
function updateCache()
{
	try 
	{
		//The following invokes the application cache download process.
		//Throws INVALID_STATE_ERR if no appliaction cache exists to update.
		window.applicationCache.update();
	} 
	catch(e) {
		debug.log("updateCache", e.message, debug.exception);
	}
}


/**
 * Status defines the current working state of the application cache.  The state changes 
 * while the user agent (browser) performs actions to chagne the cache.
 */
function getStatus()
{
	try 
	{
		switch (window.applicationCache.status)
		{
			case window.applicationCache.UNCACHED:
				return "UNCACHED";
			case window.applicationCache.IDLE:
				return "IDLE";
			case window.applicationCache.CHECKING:
				return "CHECKING";
			case window.applicationCache.DOWNLOADING:
				return "DOWNLOADING";
			case window.applicationCache.UPDATEREADY:
				return "UPDATEREADY";
			case window.applicationCache.OBSOLETE:
				return "OBSOLETE";
			default:
				return "UNKNOWN STATUS";
		}
	} 
	catch(e) {
		debug.log("getStatus", e.message, debug.exception);
	}
}



/**
 * Application Cache events occur when the user agent (browser) performs actions to check or update items stored in the application cache.
 * The following events can occur in this order:
 *  
 *	checking (start state) --> noupdate (end state)
 *			               --> downloading (intermediate state)
 *							               --> progress    (end state)
 *							               --> cached      (end state)
 *							               --> error       (end state)
 *							               --> updateready (end state)
 *			               --> obsolete (end state)
 *			               --> error    (end state)
 */
 


/**
 * The user agent is checking for an update, or attempting to download the manifest for the first time. This is always the first event in the sequence.
 */
function handleChecking(checking)
{
	prependContent("output", "onchecking: Checking manifest for updates.<br/>");
}

/**
 * The manifest was a 404 or 410 page, so the attempt to cache the application has been aborted.	 Last event in sequence.
 * The manifest hadn't changed, but the page referencing the manifest failed to download properly.
 * A fatal error occurred while fetching the resources listed in the manifest.
 * The manifest changed while the update was being run.
 */
function handleError(err)
{
	prependContent("output", "onerror: Unexpected error occurred<br/>");
}

/**
 * The manifest hadn't changed
 */
function handleNoUpdate(noupdate)
{
	prependContent("output", "onnoupdate: Manifest has not changed.  No update required.<br/>");
}

/**
 * The user agent has found an update and is fetching it, or is downloading the resources listed by the manifest for the first time.
 */
function handleDownloading(downloading)
{
	prependContent("output", "ondownloading: Downloading newer content.<br/>");
}

/**
 * The user agent is downloading resources listed by the manifest.
 */
function handleProgress(progress)
{
	prependContent("output", "onprogress: Downloading content " + progress.loaded + "/" + progress.total + ".<br/>");
}

/**
 * The resources listed in the manifest have been newly redownloaded, and the script can use swapCache() to switch to the new cache.
 */
function handleUpdateReady(updateready)
{
	prependContent("output", "onupdateready: Resources ready to be cached.<br/>");
	//Switch to the most recent application cache, if there is a newer one.
	//If there isn't throw an INVALID_STATE_ERR exception
	window.applicationCache.swapCache();
}

/**
 * The resources listed in the manifest have been downloaded, and the application is now cached.
 */
function handleCached(cached)
{
	prependContent("output", "oncached: Application has been cached.<br/>");
}

/**
 * The manifest was found to have become a 404 or 410 page, so the application cache is being deleted.
 */
function handleObsolete(obsolete)
{
	prependContent("output", "onobsolete: Obsolete manifest detected.  Application cache being removed.<br/>");
}


/**
 * The following two methods toggle the CSS styles of page elements.  Purpose is to see which style definitions are used during offline conditions.
 */
function resetStyles()
{
	var oldStyle = "description";
	document.getElementById("how").className = oldStyle;
	document.getElementById("trouble").className = oldStyle;
	document.getElementById("info").className = oldStyle;
	document.getElementById("remove").className = oldStyle;
}
function changeStyles()
{
	var newStyle = "updatedDescription";
	document.getElementById("how").className = newStyle;
	document.getElementById("trouble").className = newStyle;
	document.getElementById("info").className = newStyle;
	document.getElementById("remove").className = newStyle;
}


/**
 * The Application Cache allows developers to respond to certain events.  Assign call back methods to each of these event handlers:
 */
function initPage()
{
	try 
	{
		window.applicationCache.onchecking    = handleChecking;
		window.applicationCache.onerror       = handleError;
		window.applicationCache.onnoupdate    = handleNoUpdate;
		window.applicationCache.ondownloading = handleDownloading;
		window.applicationCache.onprogress    = handleProgress;
		window.applicationCache.onupdateready = handleUpdateReady;
		window.applicationCache.oncached      = handleCached;
		window.applicationCache.onobsolete    = handleObsolete;
	}
	catch(e) {
		debug.log("initPage", e.message, debug.exception);
	}
}
window.addEventListener("load", initPage, false);