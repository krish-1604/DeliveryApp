const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/dist/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css', // or whatever your input Tailwind file is
});
