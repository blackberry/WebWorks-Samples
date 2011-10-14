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
 *	Work in progress: Currently getting "failed to load resource" when loading Video and Audio files from the shared Tablet OS folder (I think there is a max file size allowed).
 */
function handleFileSelect(evt) 
{
	var blnFileReaderSupported = false;

	try 
	{
		//
		// NOTE: On Tablet OS it is required to enable the 'access_shared' permission if you wish to read files from the shared location (otherwise you get a runtime error).
		//
		debug.log("handleFileSelect", "start handleFileSelect");
		var reader = new FileReader();
		blnFileReaderSupported = true;
		var files = evt.target.files; 
		var size = files.length;
		
		debug.log("handleFileSelect", "in handleFileSelect # files selected : " + size, debug.info);
		
		for (var i = 0; i < size; i++) 
		{
			debug.log("handleFileSelect", "in handleFileSelect parsing file index " + i, debug.info);
			var f = files[i];
			reader.onload = (function(theFile) 
			{
				debug.log("handleFileSelect", "start reader.onload", debug.info);
				return function(e) 
				{
					//e = ProgressEvent object
					//e.target = FileReader object
				
					debug.log("handleFileSelect", "start function(e)", debug.info);
				
					var output = "";
					output += "	<td>" + theFile.name + "</td>";			//also theFile.fileName
					output += "  <td>" + theFile.size + "</td>";		//also theFile.fileSize
					output += "	 <td>" + (theFile.type || "n/a") + "</td>";
					
					debug.log("handleFileSelect", "reading file " + theFile.name + " (" + theFile.size + ") " + theFile.type, debug.info);

					if (theFile.type.match('image.*')) {
						// Render thumbnail.
						output += "	 <td><img src='" + e.target.result + "' class='thumbnail'/></td>";
					}
					else if (theFile.type.match('text.*')) 
					{
						output += "	 <td><textarea disabled cols='50' rows='3'>" + e.target.result + "</textarea></td>";
					}
					else if (theFile.type.match('audio.*')) {
						output += "<td>";
						output += "	 <audio controls='controls'><source src='" + e.target.result + "'/>Your browser does not support the <code>Audio</code> element</audio>";
						output += "	 <audio controls='controls'><source src='file://" + e.target.result + "'/>Your browser does not support the <code>Audio</code> element</audio>";
						output += "</td>";
					}
					else if (theFile.type.match('video.*')) {
						//output += "	 <td> <video controls class='thumb'><source src='" + e.target.result + "'/>Your browser does not support the <code>Video</code> element</video></td>";								
						output += "<td>";
						output += "<video controls class='thumbnail'><source src='" + e.target.result + "'/>Your browser does not support the <code>Video</code> element</video>";
						output += "<video controls class='thumbnail'><source src='file://" + e.target.result + "'/>Your browser does not support the <code>Video</code> element</video>";
						output += "</td>";
					}
					else {
						output += "	 <td></td>";
					}
					
					//Include the date if it is supported?
					if (theFile.lastModifiedDate)
					{
						output += "  <td>" + theFile.lastModifiedDate.toLocaleDateString() + "</td>";
					} 
					else {
						debug.log("handleFileSelect", "theFile.lastModifiedDate is not supported on this platform", debug.info);
					}

					var tr = document.createElement('tr');
					tr.innerHTML = output;
					document.getElementById('output').appendChild(tr);
			
				};
			})(f);

			if ((f.type.match('image.*')) || (f.type.match('audio.*')) || (f.type.match('video.*'))) 
			{
				debug.log("handleFileSelect", "in handleFileSelect calling reader.readAsDataURL for type " + f.type, debug.info);
				// Read in the media file as a data URL.
				reader.readAsDataURL(f);
			}
			else if (f.type.match('text.*')) 
			{
				debug.log("handleFileSelect", "in handleFileSelect calling reader.readAsText for type " + f.type, debug.info);
				// Read in the text file as plain text.
				reader.readAsText(f);
			}
		}
	
		debug.log("handleFileSelect", "Complete", debug.info);
	}
	catch (e) {
		debug.log("handleFileSelect", e, debug.exception);
		if (!blnFileReaderSupported)
		{
			appendContent("errors", "<p>The <b>FileReader</b> API is not supported.</p>");
		}
	}
}
		
function doPageLoad()
{
	try 
	{
	
		var ele = document.getElementById('txtFile');
		if (ele)
		{
			ele.addEventListener("change", handleFileSelect, false);
		}
	}
	catch (e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}


window.addEventListener("load", doPageLoad, false);