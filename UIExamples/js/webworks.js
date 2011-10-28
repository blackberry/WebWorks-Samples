/*
* Copyright 2010-2011 Research In Motion Limited.
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
ww = {
	doLoad: function() {
		// Apply our styling
		var root = document.body;
		ww.roundPanel.apply(root.querySelectorAll('[x-ww-type=round-panel]'));
		ww.textArrowList.apply(root.querySelectorAll('[x-ww-type=text-arrow-list]'));	
		ww.imageList.apply(root.querySelectorAll('[x-ww-type=image-list]'));	
		ww.tallList.apply(root.querySelectorAll('[x-ww-type=tall-list]'));
		ww.inboxList.apply(root.querySelectorAll('[x-ww-type=inbox-list]'));
		ww.bbmBubble.apply(root.querySelectorAll('[x-ww-type=bbm-bubble]'));
		ww.pillButtons.apply(root.querySelectorAll('[x-ww-type=pill-buttons]'));
		ww.labelControlRow.apply(root.querySelectorAll('[x-ww-type=label-control-row]'));
		
		// perform device specific formatting
		if (ww.device.isBB5()) {
			document.body.style.height = screen.height - 27 + 'px';
		}
		else if (ww.device.isBB6()) {
			document.body.style.height = screen.height - 17 + 'px';
		}
	},
	
	// Contains all device information
	device: {
		// Determine if this browser is BB5
		isBB5: function() {
			return navigator.appVersion.indexOf('5.0.0') >= 0;
		},
		
		// Determine if this browser is BB6
		isBB6: function() {
			return navigator.appVersion.indexOf('6.0.0') >= 0;
		},
		
		// Determine if this browser is BB7
		isBB7: function() {
			return navigator.appVersion.indexOf('7.0.0') >= 0;
		},
		
		// Determines if this device supports touch
		isTouch: function() {
			return true;
		}
		
	},
		
	roundPanel: {
		apply: function(elements) {
			// Apply our transforms to all the panels
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-round-panel');
				//outerElement.style.overflow = 'hidden';
				if (outerElement.hasChildNodes()) {
					var innerElements = new Array();
					// Grab the internal contents so that we can add them
					// back to the massaged version of this div
					var innerCount = outerElement.childNodes.length;
					for (var j = 0; j < innerCount; j++) {
						innerElements.push(outerElement.childNodes[j]);
					}	
					for (var j = innerCount - 1; j >= 0; j--) {
						outerElement.removeChild(outerElement.childNodes[j]);
					}
					// Create our new <div>'s
					var placeholder = document.createElement('div');
					placeholder.setAttribute('class','ww-round-panel-top-left');
					outerElement.appendChild(placeholder);
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','ww-round-panel-top-right');
					outerElement.appendChild(placeholder);
					var insidePanel = document.createElement('div');
					insidePanel.setAttribute('class','ww-round-panel-inside');
					outerElement.appendChild(insidePanel);
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','ww-round-panel-bottom-left');
					outerElement.appendChild(placeholder);
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','ww-round-panel-bottom-right');
					outerElement.appendChild(placeholder);
					// Add our previous children back to the insidePanel
					for (var j = 0; j < innerElements.length; j++) {
						insidePanel.appendChild(innerElements[j]); 
					}
				}
			}
		}
	},
	
	/* Object that contains all the logic for a Text Arrow List */
	textArrowList: {
		
		// Apply our transforms to all arrow lists passed in
		apply: function(elements) {
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-text-arrow-list');
				// Gather our inner items
				var items = outerElement.querySelectorAll('[x-ww-type=item]');
				for (var j = 0; j < items.length; j++) {
					var innerChildNode = items[j];
					innerChildNode.setAttribute('class','ww-text-arrow-list-item');
					innerChildNode.setAttribute('x-blackberry-focusable','true');
					var text = innerChildNode.innerHTML;
					
					innerChildNode.innerHTML = '<span class="ww-text-arrow-list-item-value">'+ text + '</span>' +
											'<img class="ww-arrow-list-arrow" src="images/arrow.png"/>';
					
					// Create our separator <div>
					if (j < items.length - 1) {
						var placeholder = document.createElement('div');
						placeholder.setAttribute('class','ww-arrow-list-separator');
						outerElement.insertBefore(placeholder,innerChildNode.nextSibling);
					}				
				}			
			}	
		}
	},
	
	labelControlRow: {
		// Apply our transforms to all label control rows
		apply: function(elements) {
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-label-control-row');
				// Gather our inner items
				var items = outerElement.querySelectorAll('input');
				if (items.length == 1) {
					var label = document.createElement('div');
					label.setAttribute('class', 'label');
					label.innerHTML = outerElement.getAttribute('x-ww-label');
					outerElement.insertBefore(label, items[0]);
				
				  //<div class="label">Title:</div>
				}
			}	
		}
	},
	
	/* Object that contains all the logic for Pill Buttons*/
	pillButtons: {
		
		// Apply our transforms to all pill buttons passed in
		apply: function(elements) {
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-pill-buttons');
				// Gather our inner items
				var items = outerElement.querySelectorAll('[x-ww-type=pill-button]');
				for (var j = 0; j < items.length; j++) {
					var innerChildNode = items[j];
					innerChildNode.setAttribute('x-blackberry-focusable','true');
					var text = innerChildNode.innerHTML;
					innerChildNode.innerHTML = '<span>' + text + '</span>';
					
					if (j == 0) {
						innerChildNode.setAttribute('class','buttonLeft');
					}
					else if (j == items.length -1) {
						innerChildNode.setAttribute('class','buttonRight');
					}
					else {
						innerChildNode.setAttribute('class','buttonMiddle');
					}
					
					// See if the item is marked as selected
					if (innerChildNode.hasAttribute('x-ww-selected') && innerChildNode.getAttribute('x-ww-selected').toLowerCase() == 'true') {
						ww.pillButtons.selectButton(innerChildNode);
					}
					
					// Change the selected state when a user presses the button
					innerChildNode.onmousedown = function() {
						ww.pillButtons.selectButton(this);
						var buttons = this.parentNode.querySelectorAll('[x-ww-type=pill-button]');
						for (var i = 0; i < buttons.length; i++) {
							var button = buttons[i];
							if (button != this) {
								ww.pillButtons.deSelectButton(button);
							}
						}
					}
				}			
			}	
		},
		
		// Reset the button back to its un-selected state
		deSelectButton: function(button) {
			var cssClass = button.getAttribute('class');
			if (cssClass == 'buttonLeft') {
				button.style.backgroundPosition = 'top right';
				button.firstChild.style.backgroundPosition = 'top left'; 
			}
			else if (cssClass == 'buttonRight') {
				button.style.backgroundPosition = 'top right';
				button.firstChild.style.backgroundPosition = '-10px 0px';
			}
			else if (cssClass == 'buttonMiddle') {
				button.style.backgroundPosition = 'top right';
				button.firstChild.style.backgroundPosition = '-10px 0px';
			}
		},
		
		// Highlight the button
		selectButton: function(button) {
			var cssClass = button.getAttribute('class');
			if (cssClass == 'buttonLeft') {
				button.style.backgroundPosition = 'bottom right';
				button.firstChild.style.backgroundPosition = 'bottom left';
			}
			else if (cssClass == 'buttonRight') {
				button.style.backgroundPosition = 'bottom right';
				button.firstChild.style.backgroundPosition = '-10px -39px';
			}
			else if (cssClass == 'buttonMiddle') {
				button.style.backgroundPosition = 'bottom right';
				button.firstChild.style.backgroundPosition = '-10px -39px';
			}
		}
	},
	
	imageList: {
		apply: function(elements) {
			// Apply our transforms to all Dark Image Lists
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-image-list-dark');
				// Gather our inner items
				var items = outerElement.querySelectorAll('[x-ww-type=item], [x-ww-type=header]');
				for (var j = 0; j < items.length; j++) {
					var innerChildNode = items[j];
					if (innerChildNode.hasAttribute('x-ww-type')) {
						var type = innerChildNode.getAttribute('x-ww-type').toLowerCase();
						
						if (type == 'header') {
							innerChildNode.setAttribute('class', 'header');
							innerChildNode.setAttribute('x-blackberry-focusable','true');
						}
						else if (type == 'item') {
							var description = innerChildNode.innerHTML;
							innerChildNode.setAttribute('class', 'ww-image-list-dark-item');
							innerChildNode.setAttribute('x-blackberry-focusable','true');
							innerChildNode.innerHTML = '<img src="'+ innerChildNode.getAttribute('x-ww-img') +'" />\n'+
											'<div class="details">\n'+
											'	<span class="title">' + innerChildNode.getAttribute('x-ww-title') + '</span>\n'+
											'	<div class="description">' + description + '</div>\n'+
											'</div>\n';
							innerChildNode.removeAttribute('x-ww-img');
							innerChildNode.removeAttribute('x-ww-title');
						
						}
					}				
				}			
			}	
		}
	},
	
	tallList: {
		// Apply our transforms to all Tall Lists
		apply: function(elements) {
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-tall-list');
				
				// Gather our inner items
				var items = outerElement.querySelectorAll('[x-ww-type=item]');
				for (var j = 0; j < items.length; j++) {
					var innerChildNode = items[j];
					if (innerChildNode.hasAttribute('x-ww-type')) {
						var type = innerChildNode.getAttribute('x-ww-type').toLowerCase();
						
						if (type == 'item') {
							var description = innerChildNode.innerHTML;
							innerChildNode.setAttribute('class', 'ww-tall-list-item');
							innerChildNode.setAttribute('x-blackberry-focusable','true');
							innerChildNode.innerHTML = '<img src="'+ innerChildNode.getAttribute('x-ww-img') +'" />\n'+
											'<div class="details">\n'+
											'	<span class="title">' + innerChildNode.getAttribute('x-ww-title') + '</span>\n'+
											'	<span class="description">' + description + '</span>\n'+
											'   <div class="time">' + innerChildNode.getAttribute('x-ww-time')+ '</div>\n'+
											'</div>\n';
											
							innerChildNode.removeAttribute('x-ww-img');
							innerChildNode.removeAttribute('x-ww-title');
							innerChildNode.removeAttribute('x-ww-time');
						
						}
					}				
				}		
			}	
		}
	},
	
	inboxList: {
		// Apply our transforms to all Inbox lists
		apply: function(elements) {
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				outerElement.setAttribute('class','ww-inbox-list');
				// Gather our inner items
				var items = outerElement.querySelectorAll('[x-ww-type=item], [x-ww-type=header]');
				for (var j = 0; j < items.length; j++) {
					var innerChildNode = items[j];
					if (innerChildNode.hasAttribute('x-ww-type')) {
						var type = innerChildNode.getAttribute('x-ww-type').toLowerCase();
						
						if (type == 'header') {
							var description = innerChildNode.innerHTML;
							innerChildNode.setAttribute('class', 'ww-inbox-list-header');
							innerChildNode.setAttribute('x-blackberry-focusable','true');
							innerChildNode.innerHTML = '<p>'+ description +'</p>';
						}
						else if (type == 'item') {
							var description = innerChildNode.innerHTML;
							var title = innerChildNode.getAttribute('x-ww-title');
							if (innerChildNode.hasAttribute('x-ww-accent') && innerChildNode.getAttribute('x-ww-accent').toLowerCase() == 'true') {
								title = '<b>' + title + '</b>';
							}
							innerChildNode.setAttribute('class', 'ww-inbox-list-item');
							innerChildNode.setAttribute('x-blackberry-focusable','true');
							innerChildNode.innerHTML = '<img src="'+ innerChildNode.getAttribute('x-ww-img') +'" />\n'+
											'<div class="title">'+ title +'</div>\n'+
											'<div class="time">' + innerChildNode.getAttribute('x-ww-time') + '</div>\n'+
											'<div class="description">' + description + '</div>\n';
							innerChildNode.removeAttribute('x-ww-img');
							innerChildNode.removeAttribute('x-ww-title');					
						}
					}				
				}			
			}	
		}
	},
	
	
	bbmBubble: {
		// Apply our transforms to all BBM Bubbles
		apply: function(elements) {
			for (var i = 0; i < elements.length; i++) {
				var outerElement = elements[i];
				
				if (outerElement.hasAttribute('x-ww-style')) {
					var style = outerElement.getAttribute('x-ww-style').toLowerCase();
					if (style == 'left')
						outerElement.setAttribute('class','ww-bbm-bubble-left');
					else
						outerElement.setAttribute('class','ww-bbm-bubble-right');
						
					var innerElements = outerElement.querySelectorAll('[x-ww-type=item]');
					for (var j = 0; j > innerElements.length; j++) {
						outerElement.removeChild(innerElements[j]);
					}
					
					// Create our new <div>'s
					var placeholder = document.createElement('div');
					placeholder.setAttribute('class','top-left');
					outerElement.appendChild(placeholder);
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','top-right');
					outerElement.appendChild(placeholder);
					
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','inside');
					outerElement.appendChild(placeholder);
					
					
					var insidePanel = document.createElement('div');
					insidePanel.setAttribute('class','nogap');
					placeholder.appendChild(insidePanel);
					
					
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','bottom-left');
					outerElement.appendChild(placeholder);
					placeholder = document.createElement('div');
					placeholder.setAttribute('class','bottom-right');
					outerElement.appendChild(placeholder);
					// Add our previous children back to the insidePanel
					for (var j = 0; j < innerElements.length; j++) {
						var innerChildNode = innerElements[j];
						var description = innerChildNode.innerHTML;
						innerChildNode.innerHTML = '<img src="'+ innerChildNode.getAttribute('x-ww-img') +'" />\n' +
								'<div class="details">'+ description +'</div>\n';
						insidePanel.appendChild(innerChildNode); 
					}
					
				}
			}	
		}
		
	},
	
	
	foo: function(text) {
		alert(text);
	}
}


if (navigator.appVersion.indexOf('Ripple') >= 0) {
	setTimeout("ww.doLoad()", 20);	

} else {
	addEventListener("DOMContentLoaded", ww.doLoad, false);
}






