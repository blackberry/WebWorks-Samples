# RSS Reader Sample Application

View a complete WebWorks enabled HTML5 sample application with full source to the UI, application logic and JavaScript extensions used. This sample app demonstrates the use of a tight integration with other apps (Browser and Messaging applications) and integration into the BlackBerry® device menu.

The sample code for this application is Open Source under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html).


**Applies To**

* [BlackBerry WebWorks SDK for Smartphones](https://bdsc.webapps.blackberry.com/html5/download/sdk)


**Author(s)** 

* LionsBridge


**Dependencies**

1. In order to use the spinner on the Input Control Examples [you require the assiciated SpinnerControl extension](https://github.com/blackberry/WebWorks-Community-APIs/tree/master/Smartphone/SpinnerControl) 

**Known Issues**

The following are known issues with running this sample application on BlackBerry Device Software 5.0.  As an exercise in learning more about how to develop applications using the BlackBerry WebWorks Application Platform, you are invited to troubleshoot and solve the following issues:
 
* Some feeds that should have multiple articles show only a single article.
* The previous/next buttons on the "article detail" page does not display focus when run on BlackBerry® Storm™ 9550.
* Usability issue with manage feed page: pressing back button from manage feed page takes users to feed list screen, instead of add feed screen.

**Tested On**

* None

**To contribute code to this repository you must be [signed up as an official contributor](http://blackberry.github.com/howToContribute.html).**


## How to Build

To build this sample application:

1. Click on the **Downloads** button at the top right of this screen.
2. Select **Download.zip** and save the downloaded file to your local machine.
3. Create a new folder on your local machine named **rss** (e.g. **c:\webworks\rss**).
4. Open the downloaded ZIP file from step 2 and **extract the contents from inside the top level folder** to your new **rss** folder.  This ensures that the necessary application assets, such as **config.xml**, are correctly located at the top level of the **rss** folder (e.g. **c:\webworks\rss\config.xml**).
5. Using an achiving utility (e.g. WinZip or 7-zip), package the contents of your **c:\webworks\rss** folder into a ZIP archive named **rss.zip**.  This archive should have the application assets (not a folder containing the application assets) at its top level.
6. Using the **[BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp)**, package the **rss.zip** archive into a BlackBerry Tablet OS application using the following command line: **bbwp c:\webworks\rss\rss.zip**


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
