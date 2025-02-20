// IMP: To test Challenge A run 'npm run start:a'
// Challenge A 
// Write a program that will generate four (4) types of printable random objects and 
// store them in a single file, each object will be separated by a ",". These are the 4 
// objects: alphabetical strings, real numbers, integers, alphanumerics. The 
// alphanumerics should contain a random number of spaces before and after it (not 
// exceeding 10 spaces). The output should be 10MB in size.

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads'); // i used worker thread to reduce the output timing
const fs = require('fs');
const { Readable } = require('stream');

const TARGET_FILE_SIZE = 10485760; // 10485760 (10MB), 1048576 (1MB), 1024 (1KB)
const CHUNK_SIZE = 1024 * 1024; // 1MB size
const NUM_WORKERS = 4;

if (isMainThread) {
  const startTime = Date.now();
  const writeStream = fs.createWriteStream('output.txt');
  let totalBytesWritten = 0;

  const workers = Array(NUM_WORKERS).fill(null).map(() => 
    new Worker(__filename, { workerData: { chunkSize: CHUNK_SIZE / NUM_WORKERS } })
  );

  const generatorStream = new Readable({
    highWaterMark: CHUNK_SIZE,
    read() {
      if (totalBytesWritten >= TARGET_FILE_SIZE) {
        workers.forEach(worker => worker.terminate());
        this.push(null);
        return;
      }

      let chunksReceived = 0;
      let currentChunk = '';

      workers.forEach(worker => {
        worker.postMessage('generate');
      });

      const handleChunk = (chunk) => {
        currentChunk += (chunksReceived > 0 ? ',' : '') + chunk;
        chunksReceived++;

        if (chunksReceived === NUM_WORKERS) {
          const chunkSize = Buffer.byteLength(currentChunk);
          totalBytesWritten += chunkSize;

          const progress = (totalBytesWritten / TARGET_FILE_SIZE * 100).toFixed(2);
          process.stdout.write(`\rGenerating: ${progress}% complete`);

          this.push(currentChunk);
        }
      };

      workers.forEach(worker => {
        worker.once('message', handleChunk);
      });
    }
  });

  generatorStream
    .pipe(writeStream)
    .on('finish', () => {
      console.log('\nFile generation complete.');
      console.log(`Time taken: ${(Date.now() - startTime) / 1000}s`);
      process.exit(0);
    });

} else {
  const { chunkSize } = workerData;
  //alphabetical as per of instructions
  const generateAlphaString = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = Math.floor(Math.random() * 8) + 3; // 3-10 characters
    return Array(length).fill(null)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');
  };
  // real numbers as per of instructions
  const generateRealNumber = () => (Math.random() * 1000).toFixed(6);
  // integers as per of instructions
  const generateInteger = () => Math.floor(Math.random() * 10000);
  // alphanumerics as per of instructions
  const generateAlphanumeric = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 3) + 3; // 3-5 characters
    const value = Array(length).fill(null)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');
    
    const beforeSpaces = ' '.repeat(Math.floor(Math.random() * 10) + 1);
    const afterSpaces = ' '.repeat(Math.floor(Math.random() * 10) + 1);
    return `${beforeSpaces}${value}${afterSpaces}`;
  };

  parentPort.on('message', (msg) => {
    if (msg === 'generate') {
      let chunk = '';
      let currentSize = 0;

      while (currentSize < chunkSize) {
        const values = [
          generateAlphaString(),
          generateRealNumber(),
          generateInteger(),
          generateAlphanumeric()
        ];

        for (let i = values.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [values[i], values[j]] = [values[j], values[i]];
        }

        chunk += (currentSize > 0 ? ',' : '') + values.join(',');
        currentSize = Buffer.byteLength(chunk);
      }

      parentPort.postMessage(chunk);
    }
  });
}