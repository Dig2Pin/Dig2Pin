require('dotenv').config();

const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  devIndicators: {
    autoPrerender: false,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    serverUrl,
	logo: {
		src: '/logo.png',
		width: 96,
		height: 96,
	},
  },
};
