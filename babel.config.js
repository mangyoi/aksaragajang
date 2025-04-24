module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["expo-router/babel"],
    plugins: [
    'react-native-reanimated/plugin', // Tambahkan ini
  ],
  };
};
