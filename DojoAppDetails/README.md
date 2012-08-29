# Dojo Sample Application

This application shows the markup for creating a simple Dojo application to view app details based on the app's WebWorks config.xml file

The sample code for this application is Open Source under the [BSD License](http://opensource.org/licenses/BSD-3-Clause).


**Applies To**

* [BlackBerry WebWorks SDK for Smartphones](https://bdsc.webapps.blackberry.com/html5/download/sdk)


**Author(s)** 

* Michelle Mendoza


**Dependencies**

* To access Dojo toolkit resources, the device must have an internet connection

**Known Issues**

* When using the Ripple Emulator, a Chrome Console log error is shown: "Uncaught Error: undefinedModule". This is due to Dojo trying to load Ripple's "ripple/bootstrap" since it follows the same Dojo syntax for loading legacy modules e.g. require("ripple/bootstrap")

**Tested On**
* BlackBerry Bold  9900 v7.1.0.605

**To contribute code to this repository you must be [signed up as an official contributor](http://blackberry.github.com/howToContribute.html).**


## How to Build
Once your Dojo WebWorks app is ready you can run it on the Chrome browser using the Ripple extension. To get your app on a BlackBerry simulator or device, check out these links to [package](https://developer.blackberry.com/html5/documentation/packaging_your_app_1939301_11.html), [test](https://developer.blackberry.com/html5/documentation/using_the_bb10_simulator_2008466_11.html) and [debug](https://developer.blackberry.com/html5/documentation/web_inspector_overview_1553586_11.html) your application.

To build this sample application:

1. Click on the **Downloads** button at the top right of this screen.
2. Select **Download.zip** and save the downloaded file to your local machine.
3. Create a new folder on your local machine named **DojoAppDetails** (e.g. **c:\webworks\weather**).
4. Open the downloaded ZIP file from step 2 and **extract the contents from inside the top level folder** to your new **DojoAppDetails** folder.  This ensures that the necessary application assets, such as **config.xml**, are correctly located at the top level of the **DojoAppDetails** folder (e.g. **c:\webworks\DojoAppDetails\config.xml**).
5. Using an achiving utility (e.g. WinZip or 7-zip), package the contents of your **c:\webworks\DojoAppDetails** folder into a ZIP archive named **DojoAppDetails.zip**.  This archive should have the application assets (not a folder containing the application assets) at its top level.
6. Using the **[BlackBerry WebWorks SDK for Smartphones](https://bdsc.webapps.blackberry.com/html5/download/sdk)**, package the **DojoAppDetails.zip** archive into a BlackBerry Smartphone OS application using the following command line: **bbwp c:\webworks\DojoAppDetails\DojoAppDetails.zip**


## More Info

* [BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp) - Getting Started guides, SDK downloads, code signing keys.
* [BlackBerry WebWorks SDK for Smartphones](http://us.blackberry.com/developers/browserdev/widgetsdk.jsp) - Getting Started guides, SDK downloads, code signing keys.
* [BlackBerry WebWorks SDK for Tablets - Development Guides] (http://docs.blackberry.com/en/developers/deliverables/30182/)
* [BlackBerry WebWorks SDK for Smartphones - Development Guides] (http://docs.blackberry.com/en/developers/subcategories/?userType=21&category=BlackBerry+WebWorks+for+Smartphones)
* [BlackBerry WebWorks Community Forums](http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/bd-p/browser_dev)
* [BlackBerry Open Source WebWorks Contributions Forums](http://supportforums.blackberry.com/t5/BlackBerry-WebWorks/bd-p/ww_con)


## Contributing Changes

Please see the [README](https://github.com/blackberry/WebWorks-Samples) of the WebWorks-Samples repository for instructions on how to add new Samples or make modifications to existing Samples.


## Bug Reporting and Feature Requests

If you find a bug in a Sample, or have an enhancement request, simply file an [Issue](https://github.com/blackberry/WebWorks-Samples/issues) for the Sample and send a message (via github messages) to the Sample Author(s) to let them know that you have filed an [Issue](https://github.com/blackberry/WebWorks-Samples/issues).


## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.