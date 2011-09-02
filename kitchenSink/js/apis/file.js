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

 function formatAsHTML(path, items)
 {
	var sb = new StringBuilder();

	sb.append("<p>The following resources are found within the following shared directory:</p>");
	sb.append("<p><b>" + path + "</b></p>");
	
	if (items.length === 0)
	{
		sb.append("<i>None</i>");
	}
	else {
		sb.append("<ul>");
		for (var i = 0; i < items.length; i++)
		{
			sb.append("<li><a href='" + path + "/" + items[i] + "'>" + items[i] + "</a></li>");
		}
		sb.append("</ul>");
	}
	
	return sb.toString();
 }
 
function displayPhotos(id)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.io === undefined) || (blackberry.io.file === undefined))
		{
			appendContent("photoDetails", "<p><i><b>blackberry.io.file</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			debug.log("displayPhotos", "blackberry.io.file object is undefined.", debug.error);
			return false;
		}

		var Dir = blackberry.io.dir;
		
		var path = "";		
		if (isBlackBerryPlayBook())
		{
			path = Dir.appDirs.shared.camera.path;
		}
		else if (isBlackBerrySmartphone())
		{
			path = "file:///store/home/user/pictures";
		}
		
		var items = Dir.listFiles(path);
		
		setContent(id, formatAsHTML(path, items));

	}
	catch(e) {
		debug.log("displayPhotos", e, debug.exception);
	}
}


function displayMusic(id)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.io === undefined) || (blackberry.io.file === undefined))
		{
			appendContent("musicDetails", "<p><i><b>blackberry.io.file</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			debug.log("displayMusic", "blackberry.io.file object is undefined.", debug.error);
			return false;
		}
		
		var Dir = blackberry.io.dir;
		
		var path = "";		
		if (isBlackBerryPlayBook())
		{
			path = Dir.appDirs.shared.music.path;
		}
		else if (isBlackBerrySmartphone())
		{
			path = "file:///store/home/user/music";
		}
				
		var items = Dir.listFiles(path);
		
		setContent(id, formatAsHTML(path, items));

	}
	catch(e) {
		debug.log("displayMusic", e, debug.exception);
	}
}


function displayVideos(id)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.io === undefined) || (blackberry.io.file === undefined))
		{
			appendContent("videoDetails", "<p><i><b>blackberry.io.file</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			debug.log("displayVideos", "blackberry.io.file object is undefined.", debug.error);
			return false;
		}

		var Dir = blackberry.io.dir;
		
		var path = "";		
		if (isBlackBerryPlayBook())
		{
			path = Dir.appDirs.shared.videos.path;
		}
		else if (isBlackBerrySmartphone())
		{
			path = "file:///store/home/user/videos";
		}
		var items = Dir.listFiles(path);
		
		setContent(id, formatAsHTML(path, items));
		
	}
	catch(e) {
		debug.log("displayVideos", e, debug.exception);
	}
}


function displayFiles()
{
	try
	{
		debug.log("displayFiles", "in displayFiles", debug.info);
		
		displayPhotos("photoDetails");
		displayMusic("musicDetails");
		displayVideos("videoDetails");

	}
	catch(e) {
		debug.log("displayFiles", e, debug.exception);
	}
}


function doPageLoad()
{
	try 
	{
		debug.log("doPageLoad", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.io === undefined) || (blackberry.io.dir === undefined))
		{
			debug.log("doPageLoad", "blackberry.io.file object is undefined.", debug.error);
			prependContent("photoDetails", "<p><i><b>blackberry.io.file</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			prependContent("musicDetails", "<p><i><b>blackberry.io.file</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			prependContent("videoDetails", "<p><i><b>blackberry.io.file</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
			return false;
		}

		displayFiles();
	}
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);