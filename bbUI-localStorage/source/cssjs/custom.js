
//These are scripts that will not have an effect unless they are run AFTER the subpage is fully loaded into the dom (because they perform an action on a specific item in the subpage). The function onLoadFunctions has to be inserted into ondomready: line in the index.html.
function onLoadFunctions() {
//if the Id element myPic1 exists, set it's source to the localStorage value for pic1Icon and the source for myPic2 to pic2Icon- this is used to set an image using localStorage.
if (document.getElementById('myPic1') != null) {
document.getElementById('myPic1').src = localStorage.getItem('pic1Icon');
document.getElementById('myPic2').src = localStorage.getItem('pic2Icon');
document.getElementById('myPic3').src = localStorage.getItem('pic3Icon');}

//if the Id element deldiv exists, check to see if the localStorage key delStorage exists. The localStorage key is used to determine what message is shown.
if (document.getElementById('deldiv') != null) {
	if (localStorage.getItem('delStorage') == null) {
		document.getElementById('deldiv').innerHTML = 'delStorage is not set.';}
	else if (localStorage.getItem('delStorage') != null) {
		document.getElementById("deldiv").innerHTML = localStorage.getItem('delStorage');} 
	}
		
//if the Id element myFrame exists, set it's source to the localStorage value for iframesrc - this is used to set an iframe source using localStorage.
if (document.getElementById('myFrame') != null) {
document.getElementById("myFrame").src = localStorage.getItem('iframesrc');}

//if the Id element secretqdiv exists, set it's source to the localStorage value for secretq - this is used for the Forgot Password screen.
if (document.getElementById('secretqdiv') != null) {
document.getElementById("secretqdiv").innerHTML = localStorage.getItem('secretq');}
}

//the Welcome function - determines whether the welcome tutorial or the main app is opened.
function welcome() {
if (localStorage.getItem('welcome') === null) {
 bb.pushScreen('welcome.html', 'welcome');}
else
bb.pushScreen('menu.html', 'menu');
}

//the function for the redirect option, allowing a single button to redirect to different pages depending on what is set in localStorage.
function redirect() {
if (localStorage.getItem('redirect') === null) {
 bb.pushScreen('redirect/one.html', 'one');}
else if (localStorage.getItem('redirect') === 'something') {
 bb.pushScreen('redirect/three.html', 'three');}
else
bb.pushScreen('redirect/two.html', 'two');
}

//functions for entering a password, setting a password, redirecting or denying access to the password setup screen, setting the secret question and answer, and reseting the password
function passprotect() {
if (localStorage.getItem('password') === null) {
alert('No password set. You will be redirected to options to set one up.');
bb.pushScreen('password/setpassword.html','setmypass');}
else if (localStorage.getItem('password') == mypass.value) {bb.pushScreen('password/success.html','success')}
else {alert('You entered the wrong password. Please try again.')}
}
function setpass() {
if (setpass1.value == setpass2.value) {
localStorage.setItem('password',setpass1.value)}
}
function setpassscreen() {
if (localStorage.getItem('password') === null) {bb.pushScreen('password/setpassword.html','setmypass')}
else {alert('You have already set your Password.');}
}
function setsecret() {
localStorage.setItem('secretq',secretquestion.value);
localStorage.setItem('secreta',secretanswer.value);
}
function resetpass() {
if (localStorage.getItem('secreta') == secretanswer2.value) {
localStorage.removeItem('password');alert('Password Reset');}
else {alert('Wrong Secret Answer');}
}


//About Section functions and launchers
function launchGit() { 
var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
remote.addParam("appType", "https://github.com/blackberry/bbUI.js");
remote.makeAsyncCall();
}
function launchOSBB() { 
var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
remote.addParam("appType", "http://www.opensourcebb.com");
remote.makeAsyncCall();
}
function launchOSBBx() { 
var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
remote.addParam("appType", "http://x.opensourcebb.com");
remote.makeAsyncCall();
}
function appWorld() {	
var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
remote.addParam("appType", "appworld://vendor/4735");
remote.makeAsyncCall();	
}
function launchCompose() { 
var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
remote.addParam("appType", "mailto:Support@SCrApps.org");
remote.makeAsyncCall();
}