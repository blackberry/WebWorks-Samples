# Aura Sample Application

This sample demonstrates how to integrate HTML5, Accelerometer data and CSS3 into a BlackBerry WebWorks application for the BlackBerry Tablet OS. [Aura](http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/Sample-Application-Demonstrating-HTML5-and-Accelerometer/ta-p/1150115) is the name of a proof-of-concept WebWorks application, [initially demonstrates at Mobile World Congress 2011](http://www.youtube.com/watch?v=uH7NKhNyygw), that allows a user to select from a 4-day Weather forcast of Barcelona Spain, and interact with the application elements by physically moving the BlackBerry device.

The sample code for this application is Open Source under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html).


**Applies To**

* [BlackBerry Tablet OS](http://us.blackberry.com/developers/tablet/)
* [BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp)

**Author(s)** 

* [The Astonishing Tribe](http://tat.se/)
* [Erik Oros](http://supportforums.blackberry.com/t5/user/viewprofilepage/user-id/172321)
* [Adam Stanley](https://github.com/astanley)

**Dependencies**

1. [jquery-1.5.js](http://code.jquery.com/jquery-1.5.js) 
2. [jquery-ui-1.8.9.custom.min.js](http://code.jquery.com/ui/1.8.9/jquery-ui.min.js) 
3. [jquery.easing.1.3.js](http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js) 


**To contribute code to this repository you must be [signed up as an official contributor](https://github.com/blackberry/WebWorks/wiki/How-to-Contribute).**


## How to Build

To build the Aura sample application:

1. Click on the **Downloads** button at the top right of this screen.
2. Select **Download.zip** and save the downloaded file to your local machine.
3. Create a new folder on your local machine named **Aura** (e.g. **c:\webworks\Aura**).
4. Open the downloaded ZIP file from step 2 and **extract the contents from inside the top level folder** to your new **Aura** folder.  This ensures that the necessary application assets, such as **config.xml**, are correctly located at the top level of the **Aura** folder (e.g. **c:\webworks\Aura\config.xml**).
5. Using an achiving utility (e.g. WinZip or 7-zip), package the contents of your **c:\webworks\Aura** folder into a ZIP archive named **Aura.zip**.  This archive should have the application assets (not a folder containing the application assets) at its top level.
6. Using the **[BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp)**, package the **Aura.zip** archive into a BlackBerry Tablet OS application using the following command line: **bbwp c:\webworks\Aura\Aura.zip**

## More Info
* [BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp) - Getting Started guides, SDK downloads, code signing keys.
* [BlackBerry WebWorks Development Guides] (http://docs.blackberry.com/en/developers/deliverables/30182/)
* [BlackBerry WebWorks Community Forums](http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/bd-p/browser_dev)
* [BlackBerry Open Source WebWorks Contributions Forums](http://supportforums.blackberry.com/t5/BlackBerry-WebWorks/bd-p/ww_con)


## Contributing Changes

Please see the [README](https://github.com/astanley/WebWorks-Samples/blob/master/README.md) of the WebWorks-Samples repository for instructions on how to add new Samples or make modifications to existing Samples.


## Bug Reporting and Feature Requests

If you find a bug in a Sample, or have an enhancement request, simply file an [Issue](https://github.com/blackberry/WebWorks-Samples/issues) for the Sample and send a message (via github messages) to the Sample Author(s) to let them know that you have filed an [Issue](https://github.com/blackberry/WebWorks-Samples/issues).

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
