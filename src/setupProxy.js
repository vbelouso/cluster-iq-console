const { createProxyMiddleware } = require('http-proxy-middleware');

const apiURL = process.env.REACT_APP_CIQ_API_URL

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiURL + "/api/v1",
      changeOrigin: true,
    })
  );
};

