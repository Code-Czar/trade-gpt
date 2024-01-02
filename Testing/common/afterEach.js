const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function getCallingFile() {
  const stack = new Error().stack.split('\n');
  console.log('🚀 ~ file: afterEach.js:7 ~ stack:', stack);

  // Iterate over the stack trace and find the first file in the 'Testing' directory
  for (let i = 2; i < stack.length; i++) {
    const match = stack[i].match(/\((.*):\d+:\d+\)/);
    if (match && match[1] && match[1].includes('Testing')) {
      return match[1];
    }
  }

  throw new Error("No file in the 'Testing' directory found in the stack.");
}

async function saveResultToFile(data, filename, outputDir = null) {
  const callingFile = getCallingFile();

  // Split the path on 'Testing' and get the right part
  const parts = callingFile.split('Testing');
  if (parts.length !== 2) {
    throw new Error("Calling file path does not contain 'Testing' string.");
  }
  const relativePath = parts[1].trim().replace(/^[/\\]/, ''); // Remove leading slash if present

  // Determine the final output directory
  outputDir = outputDir || path.join('outputData', relativePath);

  // Ensure the output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const filePath = path.join(outputDir, filename);
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, 'utf-8');
}

async function stopAllServices() {
  // Command to list and kill processes with --testing flag
  // This example is for Unix-like systems. Modify as needed for other platforms.
  const command = "ps ax | grep -- '--testing' | grep -v grep | awk '{print $1}' | xargs kill";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error while killing processes: ${error}`);
      return done?.(error);
    }
    if (stderr) {
      console.error(`Error output while killing processes: ${stderr}`);
    }
    console.log('Killed processes with --testing flag');
  });
}

module.exports = {
  saveResultToFile,
  stopAllServices,
};
