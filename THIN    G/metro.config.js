const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    alias: {
      '@': './src',
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
