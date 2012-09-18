//This code is a portion of the JavaScript used by RIM in their localStorage Kitchen Sink. Big thanks to RIM and @N_Adam_Stanley for their work!
 function displayStorage() {
	var num, out, i, key, value;
	if (window.localStorage) {
		num = window.localStorage.length;
		if (num > 0) {
			out = "<table width='900px' cellpadding='4px' border='1px'>";
			out += "<tr><td>Key</td><td>Value</td></tr>";
			for (i = 0; i < num; i = i + 1) {
				key = window.localStorage.key(i);
				value = window.localStorage.getItem(key);
				out += "<tr><td>" + key + "</td><td>" + value + "</td></td></tr>";
			}
			out += "</table>";
			setContent("localStorage", out);
		}
	} 
}

function doPageLoad() {
	if (!window.localStorage) {
		prependContent("output", "window.localStorage API not supported<br/>");
		document.getElementById("localRadio").setAttribute("disabled", "true");
	}
	displayStorage();
}

function setContent(id, content) {
	var ele = document.getElementById(id);
	if (ele) {
		ele.innerHTML = content;
	}
}

function show(id) {
	var ele = document.getElementById(id); 
	if (id) {
		ele.style.display = '';
	}
}
function hide(id) {
	var ele = document.getElementById(id);
	if (id) {
		ele.style.display = 'none';
	}
}

window.addEventListener("load", doPageLoad, false);