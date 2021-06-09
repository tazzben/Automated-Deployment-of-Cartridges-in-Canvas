const csv = require('csvtojson');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const expandTilde = require('expand-tilde');
const path = require('path');

const importCSV = async (filename) => {
    const absFile = path.resolve(expandTilde(filename));
    console.log("Reading " + absFile);
    const timestamp = new Date(Date.now()).toString();
    let jsonArray = [];
    jsonArray = await (async () => {
        return await csv({
            noheader: true,
            output: "csv"
        }).fromFile(absFile);
    })()
    .catch(() => {
        console.log("There is something wrong with the specified file.");
    });
    let r = [];
    let s = [];
    for (const row of jsonArray) {
        const d = new Date(row[2]?.toString().trim() ?? "");
        r.push({
            class: row[0]?.toString().trim() ?? "",
            url: row[1]?.toString().trim() ?? "",
            date: (d instanceof Date && !isNaN(d)) ? d : new Date(0)
        });
        s.push([row[0] ?? "", row[1] ?? "", timestamp]);
    }
    return {
        courseList: r,
        saveable: s
    };
};

const exportCSV = async (filename, data) => {
    const absFile = path.resolve(expandTilde(filename));
    const csvWriter = createCsvWriter({
        path: absFile
    });
    return await csvWriter.writeRecords(data).catch(() => {
        console.log("The CSV file could not be updated");
    });
};

module.exports = {
    importCSV: importCSV,
    exportCSV: exportCSV
};