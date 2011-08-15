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

addEventListener('load',doInputLoad,false);

var addressTab = null;
var contactTab = null;
var phoneTab = null;
var selectedButton = 'btnContact';

function doInputLoad() {
    var items = document.getElementsByTagName('input');
    for (var i = 0; i < items.length; i++) {
        var element = items[i];
        element.style.width = screen.width - element.offsetLeft - 50 + 'px';
    }  
    // All the sections are visible to start off with so that the above 
    // size calculations work 
    var width = (screen.width - 20) + 'px';
    addressTab = document.getElementById('address');
    addressTab.style.width = width;
    addressTab.style.display = 'none';
    phoneTab = document.getElementById('phone');
    phoneTab.style.width = width;
    phoneTab.style.display = 'none';
    contactTab = document.getElementById('contact');
    contactTab.style.width = width;
    contactTab.style.display = 'none';
    contactTab.style.display = 'inline';
    // Select our tab
    doSelect('btnContact');
}

function resetImages() {
    doSelect(selectedButton);
}

function doSelect(id) {
 
    var button = document.getElementById(id);
    button.style.backgroundPosition = 'bottom right';
    button.childNodes[1].style.backgroundPosition = 'bottom left';
        
    if (id == 'btnContact') {
        // Reset phone and address
        resetButton('btnAddress');
        resetButton('btnPhone');  
    }
    else if (id == 'btnAddress'){
        // Reset phone and contact
        resetButton('btnPhone');
        resetButton('btnContact');   
    }    
    else if(id == 'btnPhone') {
        // Reset address and contact
        resetButton('btnAddress');
        resetButton('btnContact');
    }    
}

function doHover(id) {
    if (blackberry.focus.getFocus() != id) 
        return;
        
    var button = document.getElementById(id);
    button.style.backgroundPosition = 'bottom right';
    button.childNodes[1].style.backgroundPosition  = 'bottom left';
        
    if (id == 'btnContact') {
        // Reset phone and address
        if (selectedButton != 'btnAddress') resetButton('btnAddress');
        if (selectedButton != 'btnPhone') resetButton('btnPhone');  
    }
    else if (id == 'btnAddress'){
        // Reset phone and contact
        if (selectedButton != 'btnPhone') resetButton('btnPhone');
        if (selectedButton != 'btnContact') resetButton('btnContact');   
    }    
    else if(id == 'btnPhone') {
        // Reset address and contact
        if (selectedButton != 'btnAddress') resetButton('btnAddress');
        if (selectedButton != 'btnContact') resetButton('btnContact');
    }   
}


function resetButton(id) {
    var button = document.getElementById(id);
    button.style.backgroundPosition = 'top right';
    button.childNodes[1].style.backgroundPosition  = 'top left'; 
}

function selectPhone() {
    selectedButton = 'btnPhone';
    doSelect(selectedButton);
    phoneTab.style.display = 'inline';
    addressTab.style.display = 'none';
    contactTab.style.display = 'none';
}

function selectAddress() {
    selectedButton = 'btnAddress';
    doSelect(selectedButton);
    addressTab.style.display = 'inline';
    phoneTab.style.display = 'none';
    contactTab.style.display = 'none';
}

function selectContact() {
    selectedButton = 'btnContact';
    doSelect(selectedButton);
    addressTab.style.display = 'none';
    phoneTab.style.display = 'none';
    contactTab.style.display = 'inline';
}