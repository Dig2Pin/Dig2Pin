module.exports = {
  port: process.env.PORT || 3000,
  staticRoute: '/', // The URL portion
  staticPath: 'public', // The local path on disk
  distDir: 'dist',
};