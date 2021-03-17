const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const moment = require('moment');
const { hint, getAllFilesByFolds } = require('./utils');

module.exports = async function(cwds, { output }) {
  const filesArray = [];
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

  // 3. Copy
  const destPath = path.join(process.cwd(), output || `flatten${dateHash}[${count}]`);

  for (const file of filesArray) {
    const destFilePath = path.join(destPath, path.basename(file));

    fs.copySync(file, destFilePath);
  }

  hint('Copy finished...');
};
