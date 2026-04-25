/*
 * @File: 
 * @Description: 
 * @Author: guyawei (1972065889@qq.com)
 * @Date: 2026-04-24 23:15:18
 * @LastEditTime: 2026-04-25 09:43:37
 * @LastEditors: guyawei (1972065889@qq.com)
 * @FilePath: \filesearch\resume-frontend\vue.config.js
 */
module.exports = {
  devServer: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
};
