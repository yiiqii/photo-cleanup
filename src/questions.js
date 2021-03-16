const _ = require('lodash');

const preChoices = [
  { name: 'None', value: '' },
  { name: 'Type in a name', value: 'input' },
];

const chooseLoc = (message, locs) => [{
  type: 'list',
  name: 'choosedLoc',
  message,
  choices: _.map(preChoices.concat(locs), p => {
    const name = p.type ? `${p.name}=>[${p.type}]` : p.name;
    const value = _.isUndefined(p.value) ? p.name : p.value;
    return {
      name,
      value,
    };
  }),
  default: () => {
    return '';
  },
}];

const typeInLoc = (message) => [{
  type: 'input',
  name: 'typedLoc',
  message,
  default: () => {
    return '';
  },
}];

module.exports = {
  chooseLoc,
  typeInLoc,
};
