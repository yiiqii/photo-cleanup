const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const inquirer = require('inquirer');
const _ = require('lodash');
const md5File = require('md5-file');
const trash = require('trash');
const { hint } = require('./utils');
const { chooseDuplcateFile } = require('../config/questions');

module.exports = async function([cwd]) {
  const fromDir = path.join(process.cwd(), cwd);
  const filesArray = [];

  glob('**', {
    cwd,
  }, async (er, files) => {
    hint('Starting detection...');

    const count = _.reduce(files, (sum, file) => {
      const filePath = path.join(fromDir, file);

      if (!fs.statSync(filePath).isDirectory()) {
        filesArray.push(filePath);
        sum++;
      }
      return sum;
    }, 0);

    hint('info', `Files Count: ${count}`);

    const filesSet = _.map(filesArray, path => ([
      md5File.sync(path),
      path,
    ]));
    const hashArray = _.map(filesSet, ([hash]) => hash);
    const duplicateItems = _.filter(hashArray, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    const duplicateSet = _.filter(filesSet, ([hash]) => _.includes(duplicateItems, hash));

    hint('info', `Duplicate files Count: ${duplicateItems.length}`);

    duplicateSet.forEach(([hash, path], i) => {
      hint(`${Math.floor(i / 2) + 1}. Duplicate file [${hash}]: ${path}`);
    });

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
  });
};
