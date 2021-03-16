const _ = require('lodash');

const preLocChoices = [
  { name: 'None', value: '' },
  { name: 'Type in a name', value: 'input' },
];

const preDuplcateChoices = [
  { name: 'None', value: '' },
];

const chooseLoc = (message, locs) => [{
  type: 'list',
  name: 'choosedLoc',
  message,
  choices: _.map(preLocChoices.concat(locs), p => {
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

const chooseDuplcateFile = (message, files) => [{
  type: 'list',
  name: 'choosedFile',
  message,
  choices: preDuplcateChoices.concat(_.map(files, file => ({
    name: file,
    value: file,
  }))),
  default: () => {
    return '';
  },
}];

module.exports = {
  chooseLoc,
  typeInLoc,
  chooseDuplcateFile,
};
