const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@env': path.resolve(__dirname, '.env'),
};

config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'env');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'env'];

module.exports = config;