const path = require('path');
const inquirer = require('inquirer');
const glob = require('glob');
const fs = require('fs-extra');
const moment = require('moment');
const { choosePois } = require('./questions');
const { hint } = require('./utils');
const { getFieldsFromFile, shutdownToolProcess } = require('./utils/getFieldsFromFile');
const { getRegeoByCoordinate, setRegeoCache } = require('./utils/getRegeoByCoordinate');

const dateHash = moment().format('YYYYMMDD');
let fileCount = 0;

module.exports = async function (cwd) {
  const fromPath = path.join(process.cwd(), cwd);
  const destPath = path.join(process.cwd(), dateHash);

  // 1. Create dest fold
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  }

  // 2. Glob all files
  const files = glob.sync('**', {
    cwd,
    dot: true,
  });
  let len = files.length;

  // 3. Traverse all files
  for (const file of files) {
    let result;
    const filePath = path.join(fromPath, file);

    // 3.1. Filter
    if (/\.(png|mov|jpg|jpeg|heic|mp4)$/gi.test(file)) {
      fileCount++;
      // 3.2. Get fields
      result = await getFieldsFromFile(filePath);

      if (!result) {
        return;
      }

      if (result instanceof Error) {
        hint('error', result);
        return;
      }

      const dateTime = result.DateTime;
      let model = result.UserComment || result.Model;
      let destDatePath;
      let destModelPath;
      let destLocPath;

      // 3.3. Check Model&Make
      if (result.Model && result.Make) {
        if (result.Make === 'Apple') {
          model = result.Model;
        } else {
          if (result.Model.indexOf(result.Make) === -1) {
            model = `${result.Make} ${result.Model}`;
          }
        }
      }

      // 3.4. Check DateTime and create date fold
      if (dateTime) {
        const foldByDate = moment(dateTime.replace(/:/g, '')).format('YYYY.MM');

        destDatePath = path.join(destPath, foldByDate);
        fs.ensureDirSync(destDatePath);
      }

      // 3.5. List the coordinate
      if (result.Lat && result.Lng) {
        const { name, lat, lng, pois } = await getRegeoByCoordinate(result.Lat, result.Lng);

        if (name) {
          destLocPath = path.join(destDatePath, name);
        } else {
          const answers = await inquirer.prompt(choosePois(`${filePath} ${lat},${lng}`, pois));

          if (answers.pois) {
            const poi = answers.pois.split('=>')[0];
            const locName = `${moment(dateTime.replace(/:/g, '')).format('YYYY.MM.DD')}${poi}`;

            destLocPath = path.join(destDatePath, locName);
            setRegeoCache(lat, lng, locName);
          }
        }
      }

      if (destLocPath) {
        fs.ensureDirSync(destLocPath);
      }

      // 3.6. Check Model and create model fold
      if (model) {
        if (destLocPath) {
          destModelPath = path.join(destLocPath, model);
        } else {
          destModelPath = path.join(destDatePath, model);
        }
        fs.ensureDirSync(destModelPath);
      }

      // 3.7. Copy
      const destFilePath = path.join(destModelPath || destLocPath || destDatePath, file);

      fs.copySync(filePath, destFilePath);
      hint('success', `${filePath} => ${destFilePath}`);
      // console.log(file, 'https://amap.com/?q=' + result.Lat + ',' + result.Lng);
    }

    len--;

    // 3.8 Shutdown
    if (len === 0) {
      shutdownToolProcess();
    }
    // console.log(file, result);
  }

  hint('info', `file count: ${fileCount}`);
};
