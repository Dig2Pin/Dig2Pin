require('dotenv').config();

const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  devIndicators: {
    autoPrerender: false,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    name:process.env.PROJECT_NAME,
    serverUrl,
    siteUrl,
	logo: {
		src: '/logo.png',
		width: 96,
		height: 96,
	},
  },
};
