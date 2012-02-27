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
var output;
function doOnLoad(theFile) {
	return function (e) {
						//e = ProgressEvent object
						//e.target = FileReader object
					
						output = "";
						if (theFile.type.match('image.*')) {
							// Render thumbnail.
							output += " <img src='" + e.target.result + "' class='thumbnail'/>";
						}
						else if (theFile.type.match('text.*')) {
							output += " <textarea disabled cols='50' rows='3'>" + e.target.result + "</textarea>";
						}
						else if (theFile.type.match('audio.*')) {
							output += " <audio controls width='100' height='50'><source src='" + e.target.result + "'/>Your browser does not support the <code>Audio</code> element</audio>";
						}
						else if (theFile.type.match('video.*')) {
							output += " <video controls src='" + e.target.result + "' class='thumbnail'>Your browser does not support the <code>Video</code> element</video>";
						}

						var tr = document.createElement('tr');
						tr.innerHTML = "<h3>Upload Preview:</h3>" + output;
						document.getElementById('uploadPreview').appendChild(tr);
				
					};
}

			

function handleFileSelect(evt) {
	try {
		var reader, files, size, i, f;
	
		debug.load("handleFileSelect", "start", debug.info);
		reader = new FileReader();
		files = evt.target.files; 
		size = files.length;
		
		debug.log("handleFileSelect", "in handleFileSelect # files selected : " + size, debug.info);
		
		for (i = 0; i < size; i = i + 1) {
			debug.log("handleFileSelect", "in handleFileSelect parsing file index " + i, debug.info);
			f = files[i];
			reader.onload = doOnLoad;

			if ((f.type.match('image.*')) || (f.type.match('audio.*')) || (f.type.match('video.*'))) {
				debug.log("handleFileSelect", "in handleFileSelect calling reader.readAsDataURL for type " + f.type, debug.info);
				// Read in the media file as a data URL.
				reader.readAsDataURL(f);
			}
			else if (f.type.match('text.*')) {
				debug.log("handleFileSelect", "in handleFileSelect calling reader.readAsText for type " + f.type, debug.info);
				// Read in the text file as plain text.
				reader.readAsText(f);
			}
		}
	
		debug.log("handleFileSelect", "end handleFileSelect", debug.info);
	}
	catch (e) {
		debug.log("handleFileSelect", e, debug.exception);
	}
}

function doPageLoad() {
	try {
		//The following event is not firing	from WebWorks applications on Tablet OS:
		document.getElementById('txtFile').addEventListener('change', handleFileSelect, false);
	}
	catch (e) {
		debug.log("doPageLoad", e, debug.exception);
	}
}

window.addEventListener("load", doPageLoad, false);
