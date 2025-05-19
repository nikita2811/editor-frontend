const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '216.24.57.4',
    port: 8080,
    allowedHosts: 'all', // <- this is the key line
  }
})
