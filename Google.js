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
    });
    if (sheetData?.data?.values) {
        return sheetData.data.values;
    }
    return [
        []
    ];
};

const updateSpreadsheet = async (rows) => {
    const auth = authenticate();
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    const vals = Array.from({length: rows}, () => [ , , new Date(Date.now()).toString()]);
    return await sheets.spreadsheets.values.update({
        spreadsheetId: settings.spreadsheet,
        range: settings.range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: vals
        }
    });
};


const courseList = async () => {
    const data = await getSpreadsheet();
    let r = [];
    for (let row of data) {
        let d = new Date(row[2]?.toString().trim() ?? "");
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
