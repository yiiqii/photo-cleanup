const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const _ = require('lodash');
const moment = require('moment');
const cliProgress = require('cli-progress');
const { printTable } = require('console-table-printer');
const { hint, getAllFilesByFolds } = require('./utils');
const { confirmEmptyFold } = require('../config/questions');

module.exports = async function(cwds, { output, move }) {
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

  // 2.1 Return when no files
  if (count.length === 0) {
    return;
  }

  // 3. Copy/Move
  const destPath = path.join(process.cwd(), output || `flatten${dateHash}[${count}]`);
  const existFiles = [];
  let counter = 1;

  // 3.1. Whether dest is exist, will empty?
  if (fs.existsSync(destPath)) {
    const { emptyFold } = await inquirer.prompt(confirmEmptyFold(`<${path.basename(destPath)}> is exist, sure to empty?`));

    if (emptyFold) {
      fs.emptyDirSync(destPath);
    }
  }

  // 3.2. Start Move and show progress
  hint(`${move ? 'Move' : 'Copy'} starting...`);
  progressBar.start(count, 0);

  for (const file of filesArray) {
    let destFilePath = path.join(destPath, path.basename(file));

    progressBar.update(counter);

    if (counter === count) {
      progressBar.stop();
    }

    counter++;

    // 3.3. Whether dest file is exist, and rename it
    if (fs.existsSync(destFilePath)) {
      const newFileName = path.basename(file).replace(/(.+)\.(\w+)$/i, `$1_${Date.now()}.$2`);
      existFiles.push({
        index: existFiles.length + 1,
        newFileName,
        originalFilePath: file,
      });
      destFilePath = path.join(destPath, newFileName);
    }

    if (move) {
      fs.moveSync(file, destFilePath, { overwrite: false });
    } else {
      fs.copySync(file, destFilePath);
    }
  }

  // 3.4. Print the exist files by table
  if (existFiles.length) {
    hint('warn', `${existFiles.length} files exist, I've renamed them, the result is:`);
    printTable(existFiles);
  }

  hint(`${move ? 'Move' : 'Copy'} finished...`);
};
