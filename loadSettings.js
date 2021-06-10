const fs = require('fs');

const loadSettings = () => {
    try {
        return JSON.parse(fs.readFileSync('./settings.json'));
    } catch (e) {
        console.log("Something is wrong with the settings file (settings.json).");
        process.exit();
    }
};

const loadPrivateKey = () => {
    try {
        return require("./privatekey.json");
    } catch (e) {
        console.log("Something is wrong with the Google private key file (privatekey.json).");
        process.exit();
    }
};

module.exports = {
    loadSettings: loadSettings,
    loadPrivateKey: loadPrivateKey
};