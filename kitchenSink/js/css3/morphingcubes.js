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

function hasClassName(inElement, inClassName)
{
	var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)');
	return regExp.test(inElement.className);
}

function addClassName(inElement, inClassName)
{
	if (!hasClassName(inElement, inClassName))
		inElement.className = [inElement.className, inClassName].join(' ');
}

function removeClassName(inElement, inClassName)
{
	if (hasClassName(inElement, inClassName)) {
		var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)', 'g');
		var curClasses = inElement.className;
		inElement.className = curClasses.replace(regExp, ' ');
	}
}

function toggleClassName(inElement, inClassName)
{
	if (hasClassName(inElement, inClassName))
		removeClassName(inElement, inClassName);
	else
		addClassName(inElement, inClassName);
}

function toggleShape()
{
  var shape = document.getElementById('shape');
  if (hasClassName(shape, 'ring')) {
	removeClassName(shape, 'ring');
	addClassName(shape, 'cube');
  } else {
	removeClassName(shape, 'cube');
	addClassName(shape, 'ring');
  }
  
  // Move the ring back in Z so it's not so in-your-face.
  var stage = document.getElementById('stage');
  if (hasClassName(shape, 'ring'))
	stage.style.webkitTransform = 'translateZ(-200px)';
  else
	stage.style.webkitTransform = '';
}

function toggleBackfaces()
{
  var backfacesVisible = document.getElementById('backfaces').checked;
  var shape = document.getElementById('shape');
  if (backfacesVisible)
	addClassName(shape, 'backfaces');
  else
	removeClassName(shape, 'backfaces');
}
