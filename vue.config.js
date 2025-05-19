const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    allowedHosts: 'all', // <- this is the key line
    host: '0.0.0. 0.0', // <- this is the key line
    disableHostCheck: true, // <- this is the key line
  }
})
