const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: [
      'localhost',
      'https://code-editor-1-7n1e.onrender.com/', // Allow subdomains
      '192.168.1.100',  // Allow LAN access
    ],
  }
})
