const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const inquirer = require('inquirer');
const _ = require('lodash');
const md5File = require('md5-file');
const trash = require('trash');
const { hint } = require('./utils');
const { chooseDuplcateFile } = require('../config/questions');

module.exports = async function(cwds) {
  const filesArray = [];

  hint('Starting arrange files...');

  // 1. Prepare files by folds
  const files = await Promise.all(
    _.map(cwds, cwd => {
      return new Promise((resolve, reject) => {
        glob('**', {
          cwd,
        }, (er, files) => {
          if (er) {
            reject(er);
          } else {
            const fromDir = path.join(process.cwd(), cwd);
            resolve(_.map(files, file => path.join(fromDir, file)));
          }
        });
      }).catch(e => {
        return e;
      });
    }),
  );

  if (files instanceof Error) {
    hint('error', files);
    return;
  }

  hint('Starting detection...');

  // 2. Count files and get all files path
  const count = _.reduce(_.flatten(files), (sum, filePath) => {
    if (!fs.statSync(filePath).isDirectory()) {
      filesArray.push(filePath);
      sum++;
    }
    return sum;
  }, 0);

  hint('info', `Files Count: ${count}`);

  // 3. md5 the files
  const filesSet = _.map(filesArray, path => ([
    md5File.sync(path),
    path,
  ]));
  const hashArray = _.map(filesSet, ([hash]) => hash);
  // 4. Get the duplicate items
  const duplicateItems = _.filter(hashArray, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
  const duplicateSet = _.filter(filesSet, ([hash]) => _.includes(duplicateItems, hash));

  hint('info', `Duplicate files Count: ${duplicateItems.length}`);

  duplicateSet.forEach(([hash, path], i) => {
    hint(`${Math.floor(i / 2) + 1}. Duplicate file [${hash}]: ${path}`);
  });

  // 5. Dispose the duplicate items
  for (const item of duplicateItems) {
    const paths = _.map(_.filter(duplicateSet, ([hash]) => (hash === item)), ([_, path]) => path);
    const { choosedFile } = await inquirer.prompt(chooseDuplcateFile(`Choose File to Delete[${item}]: `, paths));

    if (choosedFile) {
      hint('Starting delete...');

      await trash(choosedFile);

      hint('success', `File deleted: ${choosedFile}`);
    } else {
      hint(`Ignore file[${item}]`);
    }
  }

  hint('Finish!');
};
