#!/usr/bin/env node

// This simple script sets the ELECTRON environment variable to true
// and then starts the Electron app
const {spawn} = require('child_process');
const {platform} = require('os');

process.env.ELECTRON = 'true';

const npm = platform() === 'win32' ? 'npm.cmd' : 'npm';
const args = process.argv.slice(2);

// Default to development if no arguments provided
const script = args.length > 0 ? args[0] : 'dev';

// Start the electron process
const child = spawn(npm, ['run', `electron:${script}`], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', code => {
  process.exit(code);
});
