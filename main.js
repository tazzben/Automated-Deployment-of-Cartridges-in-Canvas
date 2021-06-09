const consoleLoop = require('./Loop.js');

if (!(!!process.env.GCP_PROJECT || !!process.env.FUNCTION_SIGNATURE_TYPE || !!process.env.AWS_REGION)) {
    consoleLoop.consoleLoop();
}