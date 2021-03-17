const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const moment = require('moment');
const cliProgress = require('cli-progress');
const { hint, getAllFilesByFolds } = require('./utils');

module.exports = async function(cwds, { output }) {
  const filesArray = [];
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  const dateHash = moment().format('YYYYMMDDHHmmss');
  hint('Starting flatten...');

  // 1. Prepare files by folds
  const files = await getAllFilesByFolds(cwds);

  if (files instanceof Error) {
    hint('error', files);
    return;
  }

  // 2. Count files and get all files path
  const count = _.reduce(_.flatten(files), (sum, filePath) => {
    if (!fs.statSync(filePath).isDirectory()) {
      filesArray.push(filePath);
      sum++;
    }
    return sum;
  }, 0);

  hint('info', `Files Count: ${count}`);
  hint('Copy starting...');
  progressBar.start(count, 0);

  // 3. Copy
  const destPath = path.join(process.cwd(), output || `flatten${dateHash}[${count}]`);
  let counter = 1;

  for (const file of filesArray) {
    const destFilePath = path.join(destPath, path.basename(file));

    progressBar.update(counter);

    if (counter === count) {
      progressBar.stop();
    }

    counter++;

    fs.copySync(file, destFilePath);
  }

  hint('Copy finished...');
};
