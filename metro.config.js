const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/dist/metro');

const defaultConfig = getDefaultConfig(__dirname);

const config = withNativeWind(defaultConfig, {
  input: './global.css', 
});

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
