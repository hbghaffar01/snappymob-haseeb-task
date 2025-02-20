// ** IMP - > I had completed this in Challenge B && Challenge C 
// To test it run: 
// 1: npm run docker:build
// 2: npm run docker:up
// this is create processed_output.txt and show output in terminal also


// Challenge B
// Create a program that will read the generated file above and print to the console the 
// object and its type. Spaces before and after the alphanumeric object must be 
// stripped.

// Challenge C 
// Dockerize Challenge B. Write a docker file so that it reads the output from Challenge 
// A as an Input. Once this container is started, the program in challenge B is executed 
// to process this file. The output should be saved in a file and should be exposed to 
// the Docker host machine. 

const fs = require('fs').promises;

function getValueType(value) {
  if (/^[a-zA-Z]+$/.test(value)) {
    return 'alphabetical string';
  } else if (/^-?\d+$/.test(value)) {
    return 'integer';
  } else if (!isNaN(value)) {
    return 'real number';
  } else {
    return 'alphanumeric';
  }
}

async function processData() {
  try {
    const data = await fs.readFile('/usr/src/app/output.txt', 'utf8');
    const values = data.split(',');
    const output = values.map(value => {
      const trimmedValue = value.trim();
      const type = getValueType(trimmedValue);
      return `Value: ${trimmedValue} - Type: ${type}`;
    });
    await fs.writeFile('/usr/src/app/processed_output.txt', output.join('\n'));
    console.log(output.join('\n'));
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

processData();