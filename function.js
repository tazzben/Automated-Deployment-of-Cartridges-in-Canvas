const consoleLoop = require('./Loop.js');

exports.helloPubSub = (message, ) => {
    const d = message.data ? Buffer.from(message.data, 'base64').toString() : '';
    console.log('PubSub Message: ' + d);
    consoleLoop.consoleLoop();
};