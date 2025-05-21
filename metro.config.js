const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);
const path = require('path');

defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.unstable_enablePackageExports = false;

defaultConfig.resolver.extraNodeModules = {
  ...(defaultConfig.resolver.extraNodeModules || {}),
  '@env': path.resolve(__dirname, '.env'),
};

defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'env');
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'env'];

module.exports = defaultConfig;