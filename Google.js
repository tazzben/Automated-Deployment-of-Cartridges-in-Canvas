const {
    google
} = require('googleapis');
const {
    JWT
} = require('google-auth-library');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./settings.json'));

const authenticate = () => {
    const privatekey = require("./privatekey.json");
    return new JWT({
        email: privatekey.client_email,
        key: privatekey.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
};

const getSpreadsheet = async () => {
    const auth = authenticate();
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    const sheetData = await sheets.spreadsheets.values.get({
        spreadsheetId: settings.spreadsheet,
        range: settings.range,
    }).catch(() => {
        console.log("There was a problem retrieving the spreadsheet data from Google Sheets");
        return [
            []
        ];
    });
    if (sheetData?.data?.values) {
        return sheetData.data.values;
    }
    return [
        []
    ];
};

const updateSpreadsheet = async (rows, timestamp) => {
    const auth = authenticate();
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    const dateValues = Array.from({length: rows}, () => [ , , timestamp]);
    return await sheets.spreadsheets.values.update({
        spreadsheetId: settings.spreadsheet,
        range: settings.range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: dateValues
        }
    }).catch(() => {
        console.log("There was an error writing to the Google Spreadsheet");
        return;
    });
};


const courseList = async () => {
    const data = await getSpreadsheet();
    let r = [];
    for (const row of data) {
        const d = new Date(row[2]?.toString().trim() ?? "");
        r.push({
            class: row[0]?.toString().trim() ?? "",
            url: row[1]?.toString().trim() ?? "",
            date: (d instanceof Date && !isNaN(d)) ? d : new Date(0)
        });
    }
    return r;
}

module.exports = {
    courseList: courseList,
    updateSpreadsheet: updateSpreadsheet
};
