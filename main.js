const consoleLoop = require('./Loop.js');

if (!(!!process.env.GCP_PROJECT || !!process.env.FUNCTION_SIGNATURE_TYPE)) {
    consoleLoop.consoleLoop();
}