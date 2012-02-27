function displayFileImage() {
	try {
		var input, theImg, img, path;
		
		
		input = document.getElementById("txtFile");
		theImg = document.getElementById("theImage");
		
		
		if (input && theImg) {
			img = new Image();
			path = "";
				
			if (isBlackBerryPlayBook()) {
				path = "file:///accounts/1000/shared/camera";
			}
			else if (isBlackBerrySmartphone()) {
				path = "file:///store/home/user/pictures";
			}
			
			img.src = path + "/" + input.value;
			img.width = Math.round(screen.width / 3);
			
			if (theImg.hasChildNodes()) {
				theImg.removeChild(theImg.firstChild);
			}
			theImg.appendChild(img);
		}
	} 
	catch(e) {
		debug.log("displayFileImage", e, debug.exception);
	}
}

function doPageLoad() {
	try {
		var filePath = document.getElementById("filePath");
		if (filePath) {
			if (isBlackBerrySmartphone()) {
				filePath.innerHTML = "file:///store/home/user/videos/";
			}
			else if (isBlackBerryPlayBook()) {
				filePath.innerHTML = "file:///accounts/1000/shared/camera/";
			}
		}
	} 
	catch(e) {
		debug.log("displayFileImage", e, debug.exception);
	}
}


window.addEventListener("load", doPageLoad, false);