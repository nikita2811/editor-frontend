const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: 'code-editor-1-7n1e.onrender.com',
    port: 8080,
    allowedHosts: 'all', // <- this is the key line
  }
})
