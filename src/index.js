const path = require('path');
const inquirer = require('inquirer');
const glob = require('glob');
const fs = require('fs-extra');
const moment = require('moment');
const { chooseLoc, typeInLoc } = require('../config/questions');
const { hint } = require('./utils');
const { getFieldsFromFile, shutdownToolProcess } = require('./utils/getFieldsFromFile');
const { getRegeoByCoordinate, setRegeoCache } = require('./utils/getRegeoByCoordinate');

const dateHash = moment().format('YYYYMMDD');
let fileCount = 0;

module.exports = async function([cwd, dest]) {
  const fromPath = path.join(process.cwd(), cwd);
  const destPath = path.join(process.cwd(), dest || dateHash);

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

  hint('info', `Glob file count: ${len}`);

  // 3. Traverse all files
  for (const file of files) {
    let result;
    const filePath = path.join(fromPath, file);

    // 3.1. Filter
    if (/\.(png|mov|jpg|jpeg|heic|heif|mp4)$/gi.test(file)) {
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
        const { name, lat, lng, pois, isCache } = await getRegeoByCoordinate(result.Lat, result.Lng);

        if (isCache || name) {
          destLocPath = path.join(destDatePath, name || '');
        } else {
          hint(`=> Loc by map [${file}]: https://amap.com/?q=${lat},${lng}`);

          const { choosedLoc } = await inquirer.prompt(chooseLoc(`Choose Loc: ${filePath} lat: ${lat} lng: ${lng}`, pois));
          let loc = choosedLoc;
          let locName;

          if (choosedLoc) {
            if (choosedLoc === 'input') {
              const { typedLoc } = await inquirer.prompt(typeInLoc('Type in Loc:'));

              if (typedLoc) {
                loc = typedLoc;
              }
            }

            locName = `${moment(dateTime.replace(/:/g, '')).format('YYYY.MM.DD')}${loc}`;
            destLocPath = path.join(destDatePath, locName);
          }
          setRegeoCache(lat, lng, locName);
        }
      }

      if (destLocPath) {
        fs.ensureDirSync(destLocPath);
      }

      // 3.6. Check Model and create model fold
      // 如果源存在目录，认为已归类好，不再细分 Model
      const oBasename = path.dirname(filePath.replace(fromPath, '')).replace(/[\s|/]*/ig, '');
      if (model) {
        if (destLocPath) {
          destModelPath = path.join(destLocPath, model);
        } else {
          destModelPath = path.join(destDatePath, model);
        }
        if (oBasename === '') {
          fs.ensureDirSync(destModelPath);
        }
      }

      // 3.7. Copy
      let foldPath = destModelPath || destLocPath || destDatePath;
      if (oBasename) {
        foldPath = destLocPath || destDatePath;
      }
      const destFilePath = path.join(foldPath, file);

      fs.copySync(filePath, destFilePath);
      hint('success', `${filePath} => ${destFilePath}`);
    } else {
      hint(`Can not recognize file type: ${filePath}`);
    }

    len--;

    // 3.8 Shutdown
    if (len === 0) {
      shutdownToolProcess();
    }
  }

  hint('info', `Traverse file count: ${fileCount}`);
};
