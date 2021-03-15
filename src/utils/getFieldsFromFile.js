const _ = require('lodash');
const { exiftool } = require('exiftool-vendored');
const { cleanExifLocationData } = require('../utils');

function getFieldsFromFile(filePath) {
  return new Promise((resolve, reject) => {
    exiftool
      .read(filePath)
      .then((tags) => {
        // console.log(tags);
        const { GPSLatitudeRef, GPSLatitude, GPSLongitudeRef, GPSLongitude, Make, Model, UserComment } = tags;
        const { Lat, Lng } = cleanExifLocationData({
          GPSLatitudeRef,
          GPSLatitude,
          GPSLongitudeRef,
          GPSLongitude,
        });
        const CreationDate = _.get(tags, 'CreationDate.rawValue'); // mov 优先
        const DateTimeOriginal = _.get(tags, 'DateTimeOriginal.rawValue');
        const CreateDate = _.get(tags, 'CreateDate.rawValue');
        const DateCreated = _.get(tags, 'DateCreated.rawValue');

        resolve({
          DateTime: CreationDate || DateTimeOriginal || CreateDate || DateCreated,
          Lat,
          Lng,
          Make,
          Model,
          UserComment,
        });
      })
      .catch((e) => {
        reject(e);
      });
  }).catch((e) => {
    return new Error(e);
  });
}

function shutdownToolProcess() {
  exiftool.end();
}

module.exports = {
  getFieldsFromFile,
  shutdownToolProcess,
};
