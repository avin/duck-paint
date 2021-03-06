/* eslint-disable */

/**
 * >>> ⚠⚠⚠ ВНИМАНИЕ ⚠⚠⚠ <<<
 *
 * Данный файл отдает текущую конфиугурацию Webpack. Используется только для нужд IDE и react-cosmos.
 * Конфигурацию в этом файле не проводить!!! Для конфигурирования использовать config-overrides.js
 */

const { paths } = require('react-app-rewired');
const override = require('./config-overrides');
const config = require(paths.scriptVersion + '/config/webpack.config');

module.exports = env => {
  return override(config(env), env);
};
