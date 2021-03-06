const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const request = require('request');
const _ = require('lodash');

const prefix = 'https://restapi.amap.com/v3/geocode/regeo';
const tokenFile = '.amap.token';
let token;

function getRegeoByCoordinate(lat, lng) {
  if (!token) {
    [path.join(os.homedir(), tokenFile), path.join(process.cwd(), tokenFile)].forEach(function(file) {
      if (fs.existsSync(file)) {
        token = fs.readFileSync(file, 'utf8').trim();
      }
    });
  }
  const url = `${prefix}?key=${token}&location=${lng},${lat}&radius=1000&extensions=all`;

  return new Promise((resolve, reject) => {
    const cache = checkCache(lat, lng);

    if (!token) {
      return reject(new Error('No token, i can\'t get the location'));
    }

    if (cache.length) {
      resolve(cache[0]);
    } else {
      request(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          const ret = JSON.parse(body);
          const { formatted_address: formattedAddress, addressComponent = {}, aois = [], pois = [] } = _.get(ret, 'regeocode', {});
          const { district, city, township } = addressComponent;
          let locs = aois.concat(pois);

          if (formattedAddress) {
            locs = [{ name: formattedAddress }].concat(locs);
          }

          district &&
            locs.push({
              name: district,
              type: `${city},${township}`,
            });

          resolve({
            lat,
            lng,
            pois: _.map(locs, (n) => {
              return _.pick(n, 'name', 'type');
            }),
          });
        }
      });
    }
  }).catch((e) => {
    return e;
  });
}

const locCache = [];

function checkCache(lat = 0, lng = 0) {
  lat = Number(lat).toFixed(2);
  lng = Number(lng).toFixed(2);

  const list = _.filter(locCache, { lat, lng });

  if (list.length === 0) {
    return [];
  }

  return list;
}

function setRegeoCache(lat, lng, name) {
  lat = Number(lat).toFixed(2);
  lng = Number(lng).toFixed(2);

  if (checkCache(lat, lng).length === 0) {
    locCache.push({
      lat,
      lng,
      name,
      isCache: true,
    });
  }
}

module.exports = {
  getRegeoByCoordinate,
  setRegeoCache,
};
