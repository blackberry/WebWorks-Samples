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

 
 //For more info on the Payment API for WebWorks applications see
//	http://www.blackberry.com/developers/docs/webworks/api/blackberry.payment.html
//

//Helper functions
function setContent(id, msg)
{
	var ele = document.getElementById(id);
	if (ele) {
		ele.innerHTML = msg;
	}
}
function appendContent(id, msg)
{
	var ele = document.getElementById(id);
	if (ele) {
		ele.innerHTML = ele.innerHTML + msg;
	}
}
function debug(source, msg)
{
	console.log("DEBUG [" + source + "] " + msg);
}



//The following JSON object will help to organize digital goods used by this application.
var goods = [ 
    { "id" : "99999", "name" : "Pepper", "sku" : "10101010101", "license" : "Consumable",     "purchasedIcon" : "pepper.jpg", "unpurchasedIcon" : "pepper_grey.jpg", "quantity" : 0 }, 
    { "id" : "12345", "name" : "Gems",   "sku" : "Bar",         "license" : "Non-Consumable", "purchasedIcon" : "gems.jpg", "unpurchasedIcon" : "gems_grey.jpg", "quantity" : 0 }, 
    { "id" : "67890", "name" : "Ring",   "sku" : "FooBar",      "license" : "Non-Consumable", "purchasedIcon" : "ring.jpg", "unpurchasedIcon" : "ring_grey.jpg", "quantity" : 0 } 
];


// Translate the 'goods' JSON object into an HTML table and display it on the page:
//
function displayDigitalGoods()
{
	try 
	{
		var isSupported, fragment, tr, tdButton, tdId, tdName, tdLicense, i;
		
		isSupported = true;
		if ((window.blackberry === undefined) || (blackberry.payment === undefined))
		{
			isSupported = false;
			debug("displayDigitalGoods", "blackberry.payment object not supported.");
		} 
		
		if (goods)
		{
			debug("displayDigitalGoods", "displaying " + goods.length + " item(s)");
			fragment = document.createDocumentFragment();
			for (i = 0; i < goods.length; i++)
			{
				tr = document.createElement("tr");

				tdButton = document.createElement("td");
				if (i == (goods.length-1)) { tdButton.className = "bottom";}
				tdButton.innerHTML = "<button onclick=\"makePayment('" + goods[i].id + "')\" " + (isSupported ? "" : "disabled='disabled'") + ">Buy</button>";
				tr.appendChild(tdButton);

				tdId = document.createElement("td");
				if (i == (goods.length-1)) { tdId.className = "bottom";}
				tdId.innerHTML = goods[i].id;
				tr.appendChild(tdId);
				
				tdName = document.createElement("td");
				if (i == (goods.length-1)) { tdName.className = "bottom";}
				tdName.innerHTML = goods[i].name;
				tr.appendChild(tdName);
				
				tdLicense = document.createElement("td");
				if (i == (goods.length-1)) { tdLicense.className = "bottom";}
				tdLicense.innerHTML = goods[i].license;
				tr.appendChild(tdLicense);
				
				fragment.appendChild(tr);
			}
			document.getElementById("digitalGoods").appendChild(fragment);
		}
		
		debug("displayDigitalGoods", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in displayDigitalGoods: " + e);
	}
}


//Display the purchased state of each digital good icon in the inventory region of the page
//
function displayPurchasedInventory()
{
	try 
	{
		var i, sInventory;

		if (goods)
		{
			sInventory = "<table><tr>";
			for (i = 0; i < goods.length; i++)
			{
				if (goods[i].quantity > 0)
				{
					sInventory += "<td class='bottom'><img src='img/" + goods[i].purchasedIcon + "' class='itemImg' alt='" + goods[i].name + " icon'/><br/> " + goods[i].quantity + " purchased</td>";
				}
				else {
					sInventory += "<td class='bottom'><img src='img/" + goods[i].unpurchasedIcon + "' class='itemImg' alt='" + goods[i].name + " icon'/><br/> not purchased</td>";
				}
			}
			sInventory += "</tr></table>";
		}

		
		setContent("inventory", sInventory);
		
		debug("displayInventory", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in displayDigitalGoods: " + e);
	}
}


//Defines the development mode used in the application. 
//THIS MODE SHOULD NOT BE USED IN PRODUCTION CODE. 
//
//Display the current value of the payment service development mode ('undefined' if Payment service is not supported).
//	If development mode is set to true, the application does not contact the Payment Service server for any transactions.
//	If development mode is set to false, purchases and retrievals of existing purchases proceed normally, contacting the Payment Service server as necessary. 
//
function displayDevelopmentMode()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.payment === undefined))
		{
			setContent("lblDevelopmentMode", "<b>Development Mode:</b> <span class='red'>undefined</span>");
			document.getElementById("btnToggleDevMode").disabled = "disabled";
			
			debug("displayDevelopmentMode", "blackberry.payment object not supported.");
			return false;
		}
		setContent("lblDevelopmentMode", "<b>Development Mode:</b> " + (blackberry.payment.developmentMode ? "<span class='on'>On</span>" : "<span class='off'>Off</span>"));
		debug("displayDevelopmentMode", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in displayDevelopmentMode: " + e);
	}
}
//If development mode is set to true, the application does not contact the Payment Service server for any transactions. 
//	For purchases, a simulated purchase screen is displayed, allowing the user to choose the result of the purchase. 
//	For retrieving existing purchases, only simulated successful purchases are returned. 
//	This mode is useful for testing how your application handles the possible results without requiring network connections or currency. 
//If development mode is set to false, purchases and retrievals of existing purchases proceed normally, contacting the Payment Service server as necessary. 
//	This is the default development mode, and applications in production should not modify it. 
//
function toggleDevelopmentMode() 
{
	try
	{
		//check first to see if the payment API exists (if not, this code may be running from a non-supported device, or a desktop browser):
		if ((window.blackberry === undefined) || (blackberry.payment === undefined))
		{
			debug("toggleDevelopmentMode", "blackberry.payment object is not supported");
			return false;
		}
		blackberry.payment.developmentMode = !blackberry.payment.developmentMode;
		displayDevelopmentMode();
		debug("toggleDevelopmentMode", "Complete. Development mode set to " + blackberry.payment.developmentMode);
	}
	catch (e) {
		appendContent("errors", "Error in displayDevelopmentMode: " + e);
	}
}



//Function to be called when a successful call is made to blackberry.payment.getExistingPurchase(). 
//	data: An array of purchases is passed as a parameter in the form below.
//
function onPaymentHistorySuccess(data) 
{	
	try 
	{
		var fragment, tr, tdId, tdGoodId, dt, tdDate, tdSKU, tdLicense, tdMeta, i, table, divCount;
		
		var paymentObjList = JSON.parse(data);
		if (paymentObjList)
		{
			debug("onPaymentHistorySuccess", "displaying " + paymentObjList.length + " result(s)");
						
			divCount = document.createElement("div");
			divCount.innerHTML = "<p><b>" + paymentObjList.length + " result(s)</b></p>";
			document.getElementById("paymentHistory").appendChild(divCount);

			if (paymentObjList.length > 0)
			{
				displayPurchasedInventory();
			
				fragment = document.createDocumentFragment();
				for (i = 0; i < paymentObjList.length; i++)
				{
					tr = document.createElement("tr");
					
					tdId = document.createElement("td");
					tdId.innerHTML = paymentObjList[i].transactionID;
					tr.appendChild(tdId);
					
					tdGoodId = document.createElement("td");
					tdGoodId.innerHTML = paymentObjList[i].digitalGoodID;
					tr.appendChild(tdGoodId);
										
					dt = new Date(paymentObjList[i].date);
					tdDate = document.createElement("td");
					tdDate.innerHTML = dt.toString();
					tr.appendChild(tdDate);
				
					tdSKU = document.createElement("td");
					tdSKU.innerHTML = paymentObjList[i].digitalGoodSKU;
					tr.appendChild(tdSKU);
					
					tdLicense = document.createElement("td");
					tdLicense.innerHTML = paymentObjList[i].licenseKey;
					tr.appendChild(tdLicense);
					
					tdMeta = document.createElement("td");
					tdMeta.innerHTML = paymentObjList[i].metaData;
					tr.appendChild(tdMeta);
					
					fragment.appendChild(tr);
				}
				table = document.createElement("table");
				table.width = "100%";
				var thr = document.createElement("tr");
				
				var thd = document.createElement("th");
				thd.innerHTML = "Transaction Id";
				thr.appendChild(thd);
				thd = document.createElement("th");
				thd.innerHTML = "Digital Good Id";
				thr.appendChild(thd);
				thd = document.createElement("th");
				thd.innerHTML = "Date";
				thr.appendChild(thd);
				thd = document.createElement("th");
				thd.innerHTML = "SKU";
				thr.appendChild(thd);
				thd = document.createElement("th");
				thd.innerHTML = "License Key";
				thr.appendChild(thd);
				thd = document.createElement("th");
				thd.innerHTML = "Meta Data";
				thr.appendChild(thd);
				table.appendChild(thr);
				
				table.appendChild(fragment);
				document.getElementById("paymentHistory").appendChild(table);
			}
		}
		
		debug("onPaymentHistorySuccess", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in onPaymentHistorySuccess: " + e);
	}
}
//Function to be called when an error occurs making a purchase. 
//	error: An error code will be passed in corresponding to the following codes
//
function onPaymentHistoryFailure(error) 
{
	setContent("errors", "onPaymentHistoryFailure: " + error);
}
//Retrieves the previous successful purchases made by the user from within the calling application. 
//	getFromLiveServer: True if the BlackBerry should be allowed to refresh the list of purchases from the Payment Service server. 
//			      False if the current list of cached purchases should be returned immediately.
//
function refreshPaymentHistory(getFromLiveServer) 
{
	try
	{
		//Clear an existing messages and listing
		setContent("errors", "");
		setContent("success", "");
		setContent("paymentHistory", "");
	
		if ((window.blackberry === undefined) || (blackberry.payment === undefined))
		{
			debug("getExistingPurchases", "blackberry.payment object not supported");
			return false;
		}
		
		//Retrieve existing purchases, ensuring that getFromLiveServer is false when connection mode = PaymentSystem.CONNECTION_MODE_LOCAL
		blackberry.payment.getExistingPurchases(getFromLiveServer, onPaymentHistorySuccess, onPaymentHistoryFailure);
		
		debug("getExistingPurchases", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in getExistingPurchases: " + e);
	}
}



function incrementPurchaseCount(goodId)
{
	try
	{
		if (goods)
		{
			for (j = 0; j < goods.length; j++)
			{
				if (goods[j].id === goodId)
				{
					goods[j].quantity += 1;
					break;
				}
			}
		}
		debug("incrementPurchaseCount", "complete");
	} 
	catch (e) {
		setContent("errors", "Error in onPaymentSuccess : " + e);
	}
}

//Function to be called when a successful call is made to blackberry.payment.purchase(). 
//	data: An object representing the payment that was submitted.
//
function onPaymentSuccess(data) 
{
	try
	{
		var paymentObj, getFromLiveServer;
		
		paymentObj = JSON.parse(data);
		if (paymentObj)
		{
			incrementPurchaseCount(paymentObj.digitalGoodID);
		
			var dt = new Date(paymentObj.date);				//TODO: Dates returned from payment service don't appear to be correct.  Why?
			
			setContent("success", "onPaymentSuccess: Transaction " + paymentObj.transactionID + " completed for digital good ID " + paymentObj.digitalGoodID + " (" + dt.toString() + ").");
		}
		getFromLiveServer = blackberry.payment.developmentMode ? false : true;
		refreshPaymentHistory(getFromLiveServer);
		debug("onPaymentSuccess", "complete");
	} 
	catch (e) {
		setContent("errors", "Error in onPaymentSuccess : " + e);
	}
}
//Function to be called when an error occurs making a purchase. 
//	error: An error code will be passed in corresponding to the following codes
//
function onPaymentFailure(error) 
{
	setContent("errors", "onPaymentFailure: " + error);
}
//Initiates the purchase of a digital good. 
//
function makePayment(digitalGoodId)
{
	try
	{
		var paymentObj, j, metaData = "", appName = "";
		
		//clear any previous output messages:
		setContent("errors", "");
		setContent("success", "");
		
		if ((window.blackberry === undefined) || (blackberry.payment === undefined))
		{
			setContent("errors", "Sorry, the <b>blackberry.payment</b> API is not available.");
			debug("makePayment", "blackberry.payment object not supported");
			return false;
		}
		
		for (j = 0; j < goods.length; j++)
		{
			if (goods[j].id === digitalGoodId) 
			{
				debug("makePayment", "sending purchase request for digitalGoodID " + goods[j].id);
				
				//Set an appropriate meta data value:
				if (blackberry.payment.developmentMode)
				{
					metaData = "Development Mode";
				} 
				else {
					if ((window.blackberry !== undefined) && (blackberry.identity !== undefined))
					{
						metaData = "Purchased by PIN " + blackberry.identity.PIN;
					}
				}
				
				//Retrieve application name from config.xml file:
				if ((window.blackberry !== undefined) && (blackberry.app !== undefined))
				{
					appName = blackberry.app.name;
				}
				
				//digitalGoodID   : ID of the digital good being purchased. 
				//digitalGoodSKU  : SKU of the digital good being purchased. 
				//digitalGoodName : Name of the digital good being purchased. 
				//metaData        : Metadata associated with the digital good. Metadata offers the application developer a way to store information about each purchase on the Payment Service server. 
				//purchaseAppName : Name of the application requesting the purchase. 
				//purchaseAppIcon : Icon of the application requesting the purchase.
				//
				paymentObj = {
					"digitalGoodID"   : goods[j].id,
					"digitalGoodSKU"  : goods[j].sku,
					"digitalGoodName" : goods[j].name,
					"metaData"        : metaData,
					"purchaseAppName" : appName,
					"purchaseAppIcon" : null
				};
				blackberry.payment.purchase(paymentObj, onPaymentSuccess, onPaymentFailure);
				
				break;
			}
		}
		
		debug("makePayment", "complete");
	}
	catch (e) {
		appendContent("errors", "Error in makePayment: " + e);
	}
}


//Display application information on the about page.
//
function displayAbout()
{
	try
	{
		if ((window.blackberry === undefined) || (blackberry.app === undefined))
		{
			debug("displayAbout", "blackberry.app object not supported.");
			return false;
		} 
		$('#appname').html(blackberry.app.name);
		$('#appversion').html("<b>Version</b> " + blackberry.app.version);
		$('#appdescription').html(blackberry.app.description);
		$('#appcopyright').html("&copy; " + blackberry.app.copyright + " " + blackberry.app.author + ".");
		$('#applicense').html(blackberry.app.license.replace(/#/gi, "<br/>"));

		debug("displayAbout", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in displayAbout: " + e);
	}
}

//Launch the browser for any external-target hyperlinks
//
function invokeBrowser(url)
{
	try
	{
		var args;
		if ((window.blackberry === undefined) || (blackberry.invoke === undefined))
		{
			debug("invokeBrowser", "blackberry.invoke object not supported.");
			return false;
		} 
		debug("invokeBrowser", "launching browser to " + url);
		args = new blackberry.invoke.BrowserArguments(url);
		blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
		debug("invokeBrowser", "complete");
	} 
	catch (e) {
		appendContent("errors", "Error in invokeBrowser: " + e);
	}
}

function onPageLoad()
{
	if ((window.blackberry === undefined) || (blackberry.payment === undefined))
	{
		setContent("errors", "<b>Error</b>: Sorry, but the <i>blackberry.payment</i> object is not defined. <br/><br/> Posible reason(s): <ul><li> A corresponding &lt;feature&gt; element is missing from the config.xml</li><li>This web content is not being rendered within the context of a BlackBerry WebWorks application.</li><li>The <i>blackberry.payment</i> object is not supported in the current environment.</li></ul>");
	} 
	else {
		//Enable development mode for this application:
		debug("onPageLoad", "blackberry.payment.developmentMode = true");
		blackberry.payment.developmentMode = true;
	}

	displayPurchasedInventory();
	
	displayDevelopmentMode();

	displayDigitalGoods();
	refreshPaymentHistory(false);	//Use false on page load as developmentMode will be set to true

	displayAbout();
	debug("onPageLoad", "complete");
}