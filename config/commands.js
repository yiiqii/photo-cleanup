module.exports = [{
  name: 'organize',
  description: 'Organize files through Model, Date and Location.',
  examples: 'photo-cleanup <fold> [destFold]',
  isDefault: true,
  options: [],
}, {
  name: 'compare',
  description: 'Compare parts of data to find matches and diffs',
  examples: 'photo-cleanup compare <fold> [fold2]',
  options: [],
}, {
  name: 'flatten',
  description: 'Flatten depth folder',
  examples: 'photo-cleanup flatten <fold> [fold2]',
  options: [{
    name: '-o, --output <fold>',
    description: 'Output directory',
    defaultValue: '',
  }],
}];
