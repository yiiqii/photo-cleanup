const _ = require('lodash');

const choosePois = (filePath, pois) => [
  {
    type: 'list',
    name: 'pois',
    message: filePath,
    choices: _.map(pois, (p) => {
      const name = p.type ? `${p.name}=>[${p.type}]` : p.name;
      return {
        name,
        value: name,
      };
    }),
    default: function () {
      return '';
    },
  },
];

module.exports = {
  choosePois,
};
