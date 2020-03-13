export default {
    '/mocker.api': {
      target: ' http://202.98.157.34:8100/mock/5e69c69a537a66a0f4eccce8/sei-dashboard-service',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/mocker.api': '' },
    },
    '/service.api': {
      target: 'http://10.4.208.86:8100/api-gateway',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/service.api': '' },
    },
  }
