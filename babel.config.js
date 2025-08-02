module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }], 'react-native-reanimated/plugin'],
    env: { preview: { plugins: ['react-native-paper/babel'] }, production: { plugins: ['react-native-paper/babel'] } },
  };
};
