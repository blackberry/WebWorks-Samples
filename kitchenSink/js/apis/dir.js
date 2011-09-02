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

function displaySharedFolders()
{
	try
	{
		debug.log("displaySharedFolders", "in displaySharedFolders", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.io === undefined) || (blackberry.io.dir === undefined))
		{
			debug.log("displaySharedFolders", "blackberry.io.dir object is undefined.", debug.error);
			return false;
		}

		debug.log("displaySharedFolders", "displaySharedFolders: retrieving dirs.", debug.info);

		var Dir = blackberry.io.dir;

		var parent = "";		
		if (isBlackBerryPlayBook())
		{
			parent = Dir.getParentDirectory(Dir.appDirs.shared.camera.path)
		}
		else if (isBlackBerrySmartphone())
		{
			parent = "file:///store/home/user";
		}
		var folders = Dir.listDirectories(parent);


		
		var sb = new StringBuilder();
		sb.append("<p>The following directories are found within the default shared folder.  Actual path <b>" + parent + "</b></p>");
		sb.append("<ul>");
		for (var i = 0; i < folders.length; i++)
		{
			sb.append("<li>" + folders[i] + "</li>");
		}
		sb.append("</ul>");
		appendContent("folderDetails", sb.toString());
	}
	catch(e) {
		debug.log("displaySharedFolders", e, debug.exception);
	}
}


function doPageLoad()
{
	try 
	{
		debug.log("doPageLoad", "Start", debug.info);
		
		if ((window.blackberry === undefined) || (blackberry.io === undefined) || (blackberry.io.dir === undefined))
		{
			debug.log("doPageLoad", "blackberry.io.dir object is undefined.", debug.error);
			prependContent("folderDetails", "<p><i><b>blackberry.io.dir</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
		}
		else {
			displaySharedFolders();
		}
	}
	catch(e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);