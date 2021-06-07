# Automatic Deployment of Cartridges in Canvas

## Summary

This script is designed to automatically deploy Canvas cartridge files to an arbitrary number of Canvas courses.  The script is driven by a "settings.json" file as well as a Google Spreadsheet of the user's choosing.  The script can be executed directly from the command prompt or deployed as a Google Cloud Function (useful when running the script on a schedule).

## settings.json

The script requires two settings files: settings.json and privatekey.json.  The settings.json file allows the user to customize the behavior of the script.  Below is an example of this file:

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

In the settings file, the range parameter sets the sheet and range of the list of courses.  By default only the courses with the maximum term will considered for deployment (this is to prevent accidental deployment to courses that over, but have not been concluded in Canvas).  Settings "disableMaxTerm" to true will not filter the list of courses based on the maximum term.  Finally, "state" allows the user to specify if content should be deployed to unpublished Canvas courses (the default) or available and unpublished courses.    If "state" is set to "available" the script will deploy to both available and unpublished courses.  Otherwise it will deploy content only to unpublished courses.

## privatekey.json

The script is driven by a service account file (privatekey.json) -- you can obtain a service account JSON file by following the instructions [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys).  You need to add this service account as an editor to the Google Spreadsheet you plan to store your list of courses.   Additionally, in the Google Cloud project that you created the service account file, you need to enable Google Sheets API.  You can do this by searching for "API," selecting "APIs & Services" and clicking "Enable APIs and Services."  From this page you can search for "Google Sheets" and enable the API.