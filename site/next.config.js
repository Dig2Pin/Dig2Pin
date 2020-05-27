const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  devIndicators: {
    autoPrerender: false,
  },
};
