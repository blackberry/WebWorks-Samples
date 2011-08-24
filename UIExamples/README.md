# UI Examples Sample Application

This sample demonstrates how to replicate some different types of common BlackBerry&reg; UI concepts for a BlackBerry Smartphone using HTML and CSS.

The sample code for this application is Open Source under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html).


**Author(s)** 

* [Tim Neil](https://github.com/tneil)

## Tested On

* BlackBerry Bold 9700 v5.0.0.469
* BlackBerry Storm 9550 v5.0.0.469
* BlackBerry Torch 9800 v6.0.0.227

These examples have been designed for a Smartphone screen size and **not** for the BlackBerry&reg; PlayBook&trade;

**Requires BlackBerry WebWorks SDK for Smartphones v2.0 or higher**


## Dependencies

1. In order to use the spinner on the Input Control Examples [you require the assiciated SpinnerControl extension](https://github.com/blackberry/WebWorks-Community-APIs/tree/master/Smartphone/SpinnerControl) 


## TODOs and Known Issues

* There are some focus based navigation mode issues that still need to be resolved
* Fix the screen height issue where the bottom of the screen shows the app background color
* Fix the layout issues with Pill Buttons on BB6+
* Fix the layout issues with Tabs on BB6+
* Fix the layout issues on input controls for BB6+
* Add input controls from raw HTML/CSS to webworks.js and webworks.css 
* Add buttons from raw HTML/CSS to webworks.js and webworks.css
* Add more JavaScript toolkit functionality to webworks.js
* Find a way to embed the toolkit image files in webworks.css as base64 encoded images

## How to Build

To build the UI Examples sample application:

1. Click on the **Downloads** button at the top right of this screen.
2. Select **Download.zip** and save the downloaded file to your local machine.
3. Create a new folder on your local machine named **UIExamples** (e.g. **c:\webworks\UIExamples**).
4. Open the downloaded ZIP file from step 2 and **extract the contents from inside the top level folder** to your new **UIExamples** folder.  This ensures that the necessary application assets, such as **config.xml**, are correctly located at the top level of the **UIExamples** folder (e.g. **c:\webworks\UIExamples\config.xml**).
5. Using an achiving utility (e.g. WinZip or 7-zip), package the contents of your **c:\webworks\UIExamples** folder into a ZIP archive named **UIExamples.zip**.  This archive should have the application assets (not a folder containing the application assets) at its top level.
6. Using the [BlackBerry WebWorks SDK for Smartphones](http://us.blackberry.com/developers/browserdev/widgetsdk.jsp), package the **UIExamples.zip** archive into a BlackBerry Smartphone application using the following command line: **bbwp c:\webworks\UIExamples\UIExampes.zip**


## Contributing Changes

Please see the [README](https://github.com/blackberry/WebWorks-Samples) of the WebWorks-Samples repository for instructions on how to add new Samples or make modifications to existing Samples.


## Bug Reporting and Feature Requests

If you find a bug in a Sample, or have an enhancement request, simply file an [Issue](https://github.com/blackberry/WebWorks-Samples/issues) for the Sample and send a message (via github messages) to the Sample Author(s) to let them know that you have filed an [Issue](https://github.com/blackberry/WebWorks-Samples/issues).

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO 
EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR 
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
