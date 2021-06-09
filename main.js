#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const consoleLoop = require('./Loop.js');

if (!(!!process.env.GCP_PROJECT || !!process.env.FUNCTION_SIGNATURE_TYPE || !!process.env.AWS_REGION)) {
    let filename  = "";
    if (argv.filename && argv.filename.length > 0){
        filename = argv.filename.trim();
    }
    consoleLoop.consoleLoop(filename);
}