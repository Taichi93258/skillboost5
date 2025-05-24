module.exports = function(api) {
  api.cache(true);
  const env = process.env.NODE_ENV || 'development';
  const envFile = `.env.${env}`;
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-paper/babel',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: envFile,
          allowUndefined: true
        }
      ]
    ]
  };
};