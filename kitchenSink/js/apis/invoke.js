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

function openJava(module)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.JavaArguments === undefined))
		{
			alert("blackberry.invoke.JavaArguments object is not supported by this application.");
			debug.log("openJava", "blackberry.invoke.JavaArguments object is undefined.", debug.error);
			return false;
		}

		var args = new blackberry.invoke.JavaArguments(module);
		blackberry.invoke.invoke(blackberry.invoke.APP_JAVA, args);
	} 
	catch(e) {
		debug.log("openJava", e, debug.exception);
	}
}

function openMessage(email)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.MessageArguments === undefined))
		{
			alert("blackberry.invoke.MessageArguments object is not supported by this application.");
			debug.log("openMessage", "blackberry.invoke.MessageArguments object is undefined.", debug.error);
			return false;
		}

		var args;
		if (email)
		{
			//Create a new email:
			args = new blackberry.invoke.MessageArguments(email, 'hello', 'world');
			args.view = blackberry.invoke.MessageArguments.VIEW_NEW;
			blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES, args);
		}
		else {
			//Open Inbox:
			args = new blackberry.invoke.MessageArguments();
			args.view = blackberry.invoke.MessageArguments.VIEW_DEFAULT;
			blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES, args);
		}

	} 
	catch(e) {
		debug.log("openMessage", e, debug.exception);
	}
}

function openMemo()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.MemoArguments === undefined))
		{
			alert("blackberry.invoke.MemoArguments object is not supported by this application.");
			debug.log("openMemo", "blackberry.invoke.MemoArguments object is undefined.", debug.error);
			return false;
		}

		var memo = new blackberry.pim.Memo();
		memo.title = 'To do list';
		memo.note = 'Step 1 : make to do list.';
		var args = new blackberry.invoke.MemoArguments(memo);
		args.view = blackberry.invoke.MemoArguments.VIEW_NEW;
		blackberry.invoke.invoke(blackberry.invoke.APP_MEMOPAD, args);

	} 
	catch(e) {
		debug.log("openMemo", e, debug.exception);
	}
}
function openTask()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.TaskArguments === undefined))
		{
			alert("blackberry.invoke.TastArguments object is not supported by this application.");
			debug.log("openTask", "blackberry.invoke.TaskArguments object is undefined.", debug.error);
			return false;
		}

		var task= new blackberry.pim.Task();
		task.summary = 'Pick up milk';

		var args = new blackberry.invoke.TaskArguments(task);
		args.view = blackberry.invoke.TaskArguments.VIEW_NEW;
		blackberry.invoke.invoke(blackberry.invoke.APP_TASKS, args); 
		
	} 
	catch(e) {
		debug.log("openTask", e, debug.exception);
	}
}

function openAddressBook()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.AddressBookArguments === undefined))
		{
			alert("blackberry.invoke.AddressBookArguments object is not supported by this application.");
			debug.log("openAddressBook", "blackberry.invoke.AddressBookArguments object is undefined.", debug.error);
			return false;
		}
		
		var contact = new blackberry.pim.Contact();
		contact.firstName = 'John';
		contact.lastName = 'Doe';

		var args = new blackberry.invoke.AddressBookArguments(contact);
		args.view = blackberry.invoke.AddressBookArguments.VIEW_NEW;
		blackberry.invoke.invoke(blackberry.invoke.APP_ADDRESSBOOK, args); 
	} 
	catch(e) {
		debug.log("openAddressBook", e, debug.exception);
	}
}
  
function openCalendar()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.CalendarArguments === undefined))
		{
			alert("blackberry.invoke.CalendarArguments object is not supported by this application.");
			debug.log("openCalendar", "blackberry.invoke.CalendarArguments object is undefined.", debug.error);
			return false;
		}
		
		var appt = new blackberry.pim.Appointment();
		appt.summary = 'Get Together For lunch';

		var args = new blackberry.invoke.CalendarArguments(appt);
		args.view = blackberry.invoke.CalendarArguments.VIEW_NEW;
		blackberry.invoke.invoke(blackberry.invoke.APP_CALENDAR, args);
	}
	catch(e) {
		debug.log("openCalendar", e, debug.exception);
	}
}

function openPhone()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.PhoneArguments === undefined))
		{
			alert("blackberry.invoke.PhoneArguments object is not supported by this application.");
			debug.log("openPhone", "blackberry.invoke.PhoneArguments object is undefined.", debug.error);
			return false;
		}
		
		var args = new blackberry.invoke.PhoneArguments('555-555-5555', true);
		args.view = blackberry.invoke.PhoneArguments.VIEW_CALL;     

		blackberry.invoke.invoke(blackberry.invoke.APP_PHONE, args); 
	}
	catch(e) {
		debug.log("openPhone", e, debug.exception);
	}
}


    
function openMaps()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.MapsArguments === undefined))
		{
			alert("blackberry.invoke.MapsArguments object is not supported by this application.");
			debug.log("openMaps", "blackberry.invoke.MapsArguments object is undefined.", debug.error);
			return false;
		}
		
		var args = new blackberry.invoke.MapsArguments(43.26, -80.30);
		blackberry.invoke.invoke(blackberry.invoke.APP_MAPS, null);
	} 
	catch(e) {
		debug.log("openMaps", e, debug.exception);
	}
}
function openMusic()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined))
		{
			alert("blackberry.invoke object is not supported by this application.");
			debug.log("openMusic", "blackberry.invoke object is undefined.", debug.error);
			return false;
		}
		
		if (blackberry.invoke.APP_MUSIC === undefined)
		{
			alert("blackberry.invoke.APP_MUSIC property is not supported by this application.");
			debug.log("openMusic", "blackberry.invoke.APP_MUSIC property is undefined.", debug.error);
			return false;
		}
		
		blackberry.invoke.invoke(blackberry.invoke.APP_MUSIC, null);
	} 
	catch(e) {
		debug.log("openMusic", e, debug.exception);
	}
}
function openVideos()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined))
		{
			alert("blackberry.invoke object is not supported by this application.");
			debug.log("openVideos", "blackberry.invoke object is undefined.", debug.error);
			return false;
		}
		
		if (blackberry.invoke.APP_VIDEOS === undefined)
		{
			alert("blackberry.invoke.APP_VIDEOS property is not supported by this application.");
			debug.log("openMusic", "blackberry.invoke.APP_VIDEOS property is undefined.", debug.error);
			return false;
		}
		
		blackberry.invoke.invoke(blackberry.invoke.APP_VIDEOS, null);
	} 
	catch(e) {
		debug.log("openVideos", e, debug.exception);
	}
}
function openCamera()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.CameraArguments === undefined))
		{
			alert("blackberry.invoke.CameraArguments object is not supported by this application.");
			debug.log("openCamera", "blackberry.invoke.CameraArguments object is undefined.", debug.error);
			return false;
		}
		var args = new blackberry.invoke.CameraArguments();
		args.view = blackberry.invoke.CameraArguments.VIEW_CAMERA;
		blackberry.invoke.invoke(blackberry.invoke.APP_CAMERA, args);
	} 
	catch(e) {
		debug.log("openCamera", e, debug.exception);
	}
}
function openVideoCamera()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.CameraArguments === undefined))
		{
			alert("blackberry.invoke.CameraArguments object is not supported by this application.");
			debug.log("openVideoCamera", "blackberry.invoke.CameraArguments object is undefined.", debug.error);
			return false;
		}
		var args = new blackberry.invoke.CameraArguments();
		args.view = blackberry.invoke.CameraArguments.VIEW_RECORDER;
		blackberry.invoke.invoke(blackberry.invoke.APP_CAMERA, args);
	} 
	catch(e) {
		debug.log("openVideoCamera", e, debug.exception);
	}
}
function openPhotos()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined))
		{
			alert("blackberry.invoke object is not supported by this application.");
			debug.log("openPhotos", "blackberry.invoke object is undefined.", debug.error);
			return false;
		}
		
		if (blackberry.invoke.APP_PHOTOS === undefined)
		{
			alert("blackberry.invoke.APP_PHOTOS property is not supported by this application.");
			debug.log("openMusic", "blackberry.invoke.APP_PHOTOS property is undefined.", debug.error);
			return false;
		}
		
		blackberry.invoke.invoke(blackberry.invoke.APP_PHOTOS, null);
	} 
	catch(e) {
		debug.log("openPhotos", e, debug.exception);
	}
}
function openBrowser(url)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.BrowserArguments === undefined))
		{
			alert("blackberry.invoke.BrowserArguments object is not supported by this application.");
			debug.log("openBrowser", "blackberry.invoke.BrowserArguments object is undefined.", debug.error);
			return false;
		}
		var args = new blackberry.invoke.BrowserArguments(url);
		blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
	} 
	catch(e) {
		debug.log("openBrowser", e, debug.exception);
	}
}
function openAppWorld(id)
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined) || (blackberry.invoke.BrowserArguments === undefined))
		{
			alert("blackberry.invoke.BrowserArguments object is not supported by this application.");
			debug.log("openAppWorld", "blackberry.invoke.BrowserArguments object is undefined.", debug.error);
			return false;
		}
		
		if (blackberry.invoke.APP_APPWORLD !== undefined)
		{
			//PlayBook can launch App world directly, but without being able to pass any arguments
			blackberry.invoke.invoke(blackberry.invoke.APP_APPWORLD, null);
		}
		else {
			var args;
			if (id)
			{
				//Leverage the browser as a content handler App World (target a specific product page):
				args = new blackberry.invoke.BrowserArguments("http://appworld.blackberry.com/webstore/content/" + id);
				blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
			} 
			else {
				args = new blackberry.invoke.BrowserArguments("http://appworld.blackberry.com/webstore");
				blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
			}
		}
	} 
	catch(e) {
		debug.log("openAppWorld", e, debug.exception);
	}	
}

function doPageLoad()
{

	if ((window.blackberry === undefined) || (blackberry.invoke === undefined))
	{
		debug.log("invokeApp", "blackberry.invoke object is undefined.", debug.error);
		prependContent("details", "<p><i><b>blackberry.invoke</b> object not found (likely cause is WebWorks APIs are not supported by this user agent).</i></p>");
	}
}

window.addEventListener("load", doPageLoad, false);