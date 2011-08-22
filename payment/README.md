# Payment service Sample Application

This sample [demonstrates how to use the BlackBerry Payment Service](http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/Sample-App-BlackBerry-WebWorks-Payment-Service/ta-p/1193335) in a BlackBerry WebWorks application for the BlackBerry Tablet OS. 
The Payment Service JavaScript API provides an end-to-end payment solution for monetizing application content. 

The sample code for this application is Open Source under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html).


**Applies To**

* [BlackBerry Tablet OS](http://us.blackberry.com/developers/tablet/)
* [BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp)
* [BlackBerry Payment Service](http://us.blackberry.com/developers/platform/paymentservice.jsp)

**Author(s)** 

* [Adam Stanley](https://github.com/astanley)

**Dependencies**

1. [jquery-1.5.2.min.js](http://code.jquery.com/jquery-1.5.2.min.js) is [dual licensed](http://jquery.org/license/) under the MIT or GPL Version 2 licenses.
2. [jquery.mobile-1.0a4.1.min.js](http://code.jquery.com/mobile/1.0a4.1/jquery.mobile-1.0a4.1.min.js) is [dual licensed](http://jquery.org/license/) under the MIT or GPL Version 2 licenses.
3. [jquery.mobile-1.0a4.1.min.css](http://code.jquery.com/mobile/1.0a4.1/jquery.mobile-1.0a4.1.min.css) is [dual licensed](http://jquery.org/license/) under the MIT or GPL Version 2 licenses.
4. [shopping_icons_set2](http://www.iconfinder.com/search/?q=iconset%3Ashopping_icons_set2) by Daily Overview, free for commercial use available from IconFinder.com.


**To contribute code to this repository you must be [signed up as an official contributor](http://blackberry.github.com/howToContribute.html).**


## How to Build

To build the payment sample application:

1. Click on the **Downloads** button at the top right of this screen.
2. Select **Download.zip** and save the downloaded file to your local machine.
3. Create a new folder on your local machine named **payment** (e.g. **c:\webworks\payment**).
4. Open the downloaded ZIP file from step 2 and **extract the contents from inside the top level folder** to your new **payment** folder.  This ensures that the necessary application assets, such as **config.xml**, are correctly located at the top level of the **payment** folder (e.g. **c:\webworks\payment\config.xml**).
5. Using an achiving utility (e.g. WinZip or 7-zip), package the contents of your **c:\webworks\payment** folder into a ZIP archive named **payment.zip**.  This archive should have the application assets (not a folder containing the application assets) at its top level.
6. Using the **[BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp)**, package the **payment.zip** archive into a BlackBerry Tablet OS application using the following command line: **bbwp c:\webworks\payment\payment.zip**


## More Info

* [BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp) - Getting Started guides, SDK downloads, code signing keys.
* [BlackBerry WebWorks Development Guides] (http://docs.blackberry.com/en/developers/deliverables/30182/)
* [BlackBerry WebWorks Community Forums](http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/bd-p/browser_dev)
* [BlackBerry Open Source WebWorks Contributions Forums](http://supportforums.blackberry.com/t5/BlackBerry-WebWorks/bd-p/ww_con)


## Contributing Changes

Please see the [README](https://github.com/blackberry/WebWorks-Samples) of the WebWorks-Samples repository for instructions on how to add new Samples or make modifications to existing Samples.


## Bug Reporting and Feature Requests

If you find a bug in a Sample, or have an enhancement request, simply file an [Issue](https://github.com/blackberry/WebWorks-Samples/issues) for the Sample and send a message (via github messages) to the Sample Author(s) to let them know that you have filed an [Issue](https://github.com/blackberry/WebWorks-Samples/issues).

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
