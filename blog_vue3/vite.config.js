import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        hmr: true,
        port: 3000,
        open: true,
        cors: true,
        proxy: {
            '/identify': {
                target: "http://localhost:7000", //跨域地址
                changeOrigin: true, //支持跨域
                rewrite: (path) => path.replace(/^\/identify/, '')   //重写路径
            },
            '/oss': {
                target: "http://localhost:8000", //跨域地址
                changeOrigin: true, //支持跨域
                rewrite: (path) => path.replace(/^\/oss/, '')   //重写路径
            },
            '/article':{
                target: "http://localhost:9000", //跨域地址
                changeOrigin: true, //支持跨域
                rewrite: (path) => path.replace(/^\/article/, '')   //重写路径
            }
        }
    },
    base: '/'
})

