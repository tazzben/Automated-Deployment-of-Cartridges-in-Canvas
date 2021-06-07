# Automatic Deployment of Cartridges in Canvas

## Summary

This script is designed to automatically deploy Canvas Cartridge files to an arbitrary number of Canvas courses.  The script is driven by a "settings.json" file as well as a Google Spreadsheet of the user's choosing.  The script can be executed directly from the command prompt or deployed as a Google Cloud Function (useful when running the script on a schedule).

## settings.json

The script requires two files: settings.json and privatekey.json.  The settings.json file allows the user to customize the behavior of the script.  Below is an example of this file:

```
{
    "token": "<Canvas Token>",
    "canvasURL": "unomaha.instructure.com",
    "spreadsheet": "<Spreadsheet ID>",
    "range": "ClassList!A:C",
    "disableMaxTerm": false,
    "state": "unpublished"
}
```

Where <Canvas Token> is the Developer Token for the Canvas account you wish to use and <Spreadsheet ID> is the Google Spreadsheet ID.  You can generate a Canvas token by going to the Account->Settings within Canvas.  Under the "Approved Integrations" section of the page click the "+ New Access Token" button.   The Google Spreadsheet can be found by looking at the URL of the spreadsheet when open. Google Spreadsheet URLs follow the following pattern: ".../d/<Spreadsheet ID>/edit..."  The <Spreadsheet ID> will be a long alphanumeric string.  

In the settings file, the range parameter sets the sheet and range of the list of courses; this range should be three columns wide.  By default only the courses with the maximum term will be considered for deployment (this is to prevent accidental deployment to courses that are over, but have not been concluded in Canvas).  Setting "disableMaxTerm" to true will not filter the list of courses based on the maximum term.  Finally, "state" allows the user to specify if content should be deployed to unpublished Canvas courses (the default) or available and unpublished courses.    If "state" is set to "available" the script will deploy to both available and unpublished courses.  Otherwise it will deploy content only to unpublished courses.

## privatekey.json

The script is driven by a service account file (privatekey.json) -- you can obtain a service account JSON file by following the instructions [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys).  You need to add this service account as an editor to the Google Spreadsheet you plan to store your list of courses.   Additionally, in the Google Cloud project that you created the service account file, you need to enable Google Sheets API.  You can do this by searching for "API," selecting "APIs & Services" and clicking "Enable APIs and Services."  From this page you can search for "Google Sheets" and enable the API.

## Google Spreadsheet

The script uses a Google Spreadsheet with three columns.  The first column lists a portion of the course code, the second lists the asset to deploy, and third list the date and time the asset was last deployed. For instance, the content of the spreadsheet might look something like this (there is no header row on the spreadsheet):

| | | |
| ------------- | ------------- | ------------- |
| ECON     | https://storage.googleapis.com/bucket/ECONBranding.zip | Mon Jun 07 2021 09:24:03 GMT-0500 (Central Daylight Time) |
| ECON2200 | https://storage.googleapis.com/bucket/Pretest.zip |  |
| ECON8990801 | https://storage.googleapis.com/bucket/SectionSpecific.zip | Tue Jun 01 2021 09:24:03 GMT-0500 (Central Daylight Time) |
| ECON2 | https://storage.googleapis.com/bucket/Pretest.zip | Tue Jun 01 2021 09:24:03 GMT-0500 (Central Daylight Time) |

The first column describes the classes to match.  This can be as specific or as general as the user wishes.  Given the first row lists just "ECON" it would deploy the asset in the second column to all economics courses.  Similarly, the second row would deploy to all ECON2200 courses and the third row would deploy to a specific section of 8990.  There is no issue with multiple assets being deployed to the same course.

The second column lists the asset to be deployed.  This can be any publicly available URL.  The expected file format is a Canvas Cartridge which can be generated in Canvas by using the export feature of the settings section of a given course.  The final file is a ZIP file with a imsmanifest.xml file inside with supporting files.

The final column is the date and time of the last deployment of the given row.   The script will only deploy the content to courses created after this date and time; this prevents the same content being deployed multiple times when the script is run periodically.  Therefore, the asset in the first row would only be deployed to courses created after Jun 7, 9:24AM, the asset in the second row would be deployed to all ECON 2200 courses (no restriction on the creation date given the third column is blank), the asset in the third row would be deployed to ECON8990801 if it was created after Jun 1, 9:24AM, and the asset in the forth row would be deployed to all classes starting with "ECON2" created after Jun 1, 9:24AM.

The third column is automatically updated by the script when it deploys an asset.  The net result is that assets are only deployed to new courses and duplicate deployments don't occur.

## Deployment Options

### Command Line

The script can be executed directly on any computer with Node.js 14 or above.  The user can simply type:

```
node main.js
```

This approach is appropriate when the user is performing a one-off deployment of a set of assets.

### Google Cloud Function and Timers

If a set of assets are systematically deployed to a set of courses, a Google Cloud Function might make more sense.  

Google has provided a [guide](https://cloud.google.com/functions/docs/quickstart-console) to deploy a Google Cloud function.  Note that the user will need to upload a ZIP with all of the necessary files.  This includes settings.json, privatekey.json, package.json and all script (.js) files.   Note to set the trigger type to "Cloud Pub/Sub" and create a Pub/Sub topic (the topic doesn't matter but you will need to use it later).  The script entry point is helloPubSub (the default) and you should use the Node.js 14 runtime or higher.

Once the script is setup, you can follow this [guide](https://cloud.google.com/scheduler/docs/tut-pub-sub) to setup a schedule when the script will automatically be run.

## Getting Help

If you encounter any issues setting up this program, please contact Ben Smith at bosmith@unomaha.edu.
