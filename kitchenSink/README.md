# Kitchen Sink Sample Application

The purpose of this application is to demonstrate the multitude of capabilities and functionality (everything but the "kitchen sink") that can be built into a BlackBerry WebWorks application.

The sample code for this application is Open Source under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html).

![Screenshot](https://github.com/blackberry/WebWorks-Samples/tree/master/kitchenSink/img/kitchenSink.png "Kitchen Sink Screenshot")

**Applies To**

* [BlackBerry WebWorks SDK for Tablet OS](http://us.blackberry.com/developers/tablet/webworks.jsp)
* [BlackBerry WebWorks SDK for Smartphones](http://us.blackberry.com/developers/browserdev/widgetsdk.jsp)

**Author(s)** 

* [Adam Stanley](https://github.com/astanley)

**Dependencies**

1. See the **Resource_Copyright_Info.txt** file for a complete listing of copyright info, and references for images and resources used in this application.
2. [json2.js](http://www.JSON.org/js.html) JSON parser is available under Public Domain.

**Known Issues**

1. Application Event API (Tablet OS) - background/foreground events not working (onSwipeDown is, but onBackground and onForeground are not responding).
2. HTML5 FileReader API not fully supported on Tablet OS 1.0.7 or BlackBerry 7.
3. HTML5 WebSockets open call not initializing from the page onload event (can be created after the onload event occurs).
4. HTML5 video conflicting with page onload event. Timer delay needed to start video rather than direct from onload.
5. Invoke API (Tablet OS 1.0.7) - opening photos and videos application causes "cannot open file" error.
6. Microphone API (Tablet OS 1.0.7): "Failed to load resource: the server responded with a status of 500 (Error #1009)"
7. Camera API (Smartphone) image not loading after photo taken.
8. Phone API (Smartphone) Phone logs not displaying as expected.


**To contribute code to this repository you must be [signed up as an official contributor](http://blackberry.github.com/howToContribute.html).**


## How to Build

To build the kitchenSink sample application:

1. Click on the **Downloads** tab above.
2. Select **Download as zip** (Windows) or **Download as tar.gz** (Mac) and save the downloaded file to your local machine.
3. Create a new folder on your local machine named **kitchenSink** e.g. **C:\Documents and Settings\User\WebWorks\kitchenSink** (Windows) or **~/WebWorks/kitchenSink** (Mac).
4. Open the downloaded ZIP file from step 2 and extract the contents **from inside the zipped kitchenSink folder** to your local **kitchenSink** folder from step 3.  This ensures that the necessary application assets, such as **config.xml**, are correctly located at the top level of the local **kitchenSink** folder (e.g. **~/WebWorks/kitchenSink/config.xml**).
5. Using the **[Ripple Mobile Emulator](http://developer.blackberry.com/html5/download)** and either the **[BlackBerry WebWorks SDK for Smartphone](http://developer.blackberry.com/html5/download)** or the **[BlackBerry WebWorks SDK for Tablet OS](http://developer.blackberry.com/html5/download)**, package the contents of your local **kitchenSink** folder into a BlackBerry application.  Enter the project root settings field as the local folder created in step 3, and the archive name settings field as **kitchenSink**.


## More Info

* [BlackBerry HTML5 WebWorks](https://bdsc.webapps.blackberry.com/html5/) - Downloads, Getting Started guides, samples, code signing keys.
* [BlackBerry WebWorks Development Guides] (https://bdsc.webapps.blackberry.com/html5/documentation)
* [BlackBerry WebWorks Community Forums](http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/bd-p/browser_dev)
* [BlackBerry Open Source WebWorks Contributions Forums](http://supportforums.blackberry.com/t5/BlackBerry-WebWorks/bd-p/ww_con)

## Contributing Changes

Please see the [README](https://github.com/blackberry/WebWorks-Samples) of the WebWorks-Samples repository for instructions on how to add new Samples or make modifications to existing Samples.


## Bug Reporting and Feature Requests

If you find a bug in a Sample, or have an enhancement request, simply file an [Issue](https://github.com/blackberry/WebWorks-Samples/issues) for the Sample and send a message (via github messages) to the Sample Author(s) to let them know that you have filed an [Issue](https://github.com/blackberry/WebWorks-Samples/issues).


## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
