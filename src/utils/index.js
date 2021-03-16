const chalk = require('chalk');
const _ = require('lodash');
const shell = require('shelljs');

function hint(type, msg) {
  if (!msg) {
    msg = type;
  }
  switch (type) {
    case 'error':
      console.log(chalk.red('[错误] ') + msg);
      break;
    case 'success':
      console.log(chalk.green('[成功] ') + msg);
      break;
    case 'info':
      console.log(chalk.cyan('[提示] ') + msg);
      break;
    case 'warn':
      console.log(chalk.yellow('[警告] ') + msg);
      break;
    default:
      console.log(chalk.grey(`${msg}`));
  }
}

function checkBrewBinExists(name, installName) {
  return promiseExec(`which ${name}`, `please install ${installName || name}`);
}

function promiseExec(command, rejectValue, resolveValue) {
  return new Promise(function (resolve, reject) {
    require('child_process').exec(
      command,
      {
        maxBuffer: 2 * 1024 * 1024,
      },
      function (error, stdout, stderr) {
        if (error || stderr) {
          reject(rejectValue || error || stderr);
        } else {
          resolve(resolveValue || stdout);
        }
      },
    );
  }).catch(e => {
    return e;
  });
}

function doExec(cmd, silent) {
  try {
    const ret = shell.exec(cmd, {
      silent,
    });

    if (ret.code === 0) {
      return ret.stdout;
    } else {
      throw new Error(ret.stderr);
    }
  } catch (e) {
    throw new Error(e);
  }
}

function calcStringFraction(str) {
  const frac = str.split('/');

  return parseInt(frac[0], 10) / parseInt(frac[1], 10);
}

function exifCoordinateToDecimal(exifCoordinate) {
  const dms = exifCoordinate.split(',').map(calcStringFraction);

  return dms[0] + dms[1] / 60 + dms[2] / 3600;
}

function cleanExifLocationData(data) {
  let lat = data.GPSLatitude || '';
  let lng = data.GPSLongitude || '';

  if (!_.isNumber(lat)) {
    lat = exifCoordinateToDecimal(lat);
  }
  if (!_.isNumber(lng)) {
    lng = exifCoordinateToDecimal(lng);
  }

  return {
    Lat: (data.GPSLatitudeRef === 'S' ? -1 : 1) * lat,
    Lng: (data.GPSLongitudeRef === 'W' ? -1 : 1) * lng,
  };
}

module.exports = {
  hint,
  doExec,
  promiseExec,
  checkBrewBinExists,
  cleanExifLocationData,
};
