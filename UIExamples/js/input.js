/*Copyright (c) 2010 Research In Motion Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Pre-load our images for hover effects
image3 = new Image();
image3.src =  'images/input/no.png';
image4 = new Image();
image4.src = 'images/input/noSel.png';
image5 = new Image();
image5.src = 'images/input/off.png';
image6 = new Image();
image6.src = 'images/input/offSel.png';
image7 = new Image();
image7.src = 'images/input/on.png';
image8 = new Image();
image8.src =  'images/input/onSel.png';	
image9 = new Image();
image9.src =  'images/input/yes.png';
image10 = new Image();
image10.src =  'images/input/yesSel.png';

var cityIndex = 2;


addEventListener('load',doInputLoad,false);

function doInputLoad() {
    var element = document.getElementById('edit1');
    element.style.width = screen.width - element.offsetLeft - 30 + 'px';
    element = document.getElementById('edit2');
    element.style.width = screen.width - element.offsetLeft - 30 + 'px';
}

function doSelect() {
    resetImages();
    var button = document.getElementById('button');
    button.style.backgroundPosition = 'bottom right';
    button.firstChild.style.backgroundPosition = 'bottom left';
}

function evaluateYesNo(id) {
    var element = document.getElementById(id);
    if (element.src.indexOf('/yes') > -1)
        return true;	
    else if (element.src.indexOf('/on') > -1)
        return true;	
    else
        return false;		    
}

function doYesNoClick(id) {
    resetImages();  
    var element = document.getElementById(id);
    if (element.src.indexOf('images/input/yes') > -1)
        element.src = 'images/input/noSel.png';	
    else if (element.src.indexOf('images/input/on') > -1)
        element.src = 'images/input/offSel.png';	
    else if (element.src.indexOf('images/input/no') > -1)
        element.src = 'images/input/yesSel.png';	
    else if (element.src.indexOf('images/input/off') > -1)
        element.src = 'images/input/onSel.png';	    
}

function doYesNoSelect(id) {
    if (blackberry.focus.getFocus() != id) 
        return;
    resetImages();

    var element = document.getElementById(id);
    if (element.src.indexOf('/yes.png') > -1)
        element.src = 'images/input/yesSel.png';	
    else if (element.src.indexOf('/on.png') > -1)
        element.src = 'images/input/onSel.png';	
    else if (element.src.indexOf('/off.png') > -1)
        element.src = 'images/input/offSel.png';
    else if (element.src.indexOf('/no.png') > -1)
        element.src = 'images/input/noSel.png';
}

function doYesNoUnSelect(element) {
    if (element.src.indexOf('images/input/yes') > -1)
        element.src = 'images/input/yes.png';	
    else if (element.src.indexOf('images/input/on') > -1)
        element.src = 'images/input/on.png';	 
    else if (element.src.indexOf('images/input/off') > -1)
        element.src = 'images/input/off.png';
    else if (element.src.indexOf('images/input/no') > -1)
        element.src = 'images/input/no.png';	 	 
}


function resetImages() {
    var button = document.getElementById('button');
    button.style.backgroundPosition = 'top right';
    button.firstChild.style.backgroundPosition = 'top left';
    doYesNoUnSelect(document.getElementById('a'));
    doYesNoUnSelect(document.getElementById('b'));
    doYesNoUnSelect(document.getElementById('c'));
    doYesNoUnSelect(document.getElementById('d'));
}

function openSpinner() {
    doSelect();
    /*
        sample.ui.spinner
        ==================================
        static readwrite property String title; // Title on top of screen
        static readwrite property Number rowHeight; // Height of each row to display
        static readwrite property Number visibleRows; // Number of rows to display
        
        static Number open(items : String[], defaultIndexSelected : Number); // Returns the index of the selected item
        
    */

    // Configure our spinner
    sample.ui.spinner.title = "Choose A City:";
    if (screen.height < 480){
        sample.ui.spinner.rowHeight = 60;
        sample.ui.spinner.visibleRows = 3;
    }
    else {
        sample.ui.spinner.rowHeight = 75;
        sample.ui.spinner.visibleRows = 4;
    }
    // Create the items in the order in which to display them
    var items = new Array("Barcelona", "Beijing", "Brasilia", "Melbourne", "Moscow", "New York", "Paris" );
    // Open the spin dialog
    var cityIndex = sample.ui.spinner.open(items, 2);

    if (cityIndex != undefined)
        document.getElementById('button').firstChild.innerHTML = items[cityIndex];
}