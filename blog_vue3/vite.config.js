import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        hmr:true,
        port: 3000,
        open: true,
        cors: true,
        proxy: {
            '/api': {
                target: "http://localhost:7000", //跨域地址
                changeOrigin: true, //支持跨域
                rewrite: (path) => path.replace(/^\/api/, '')   //重写路径
            }
        }
    }
})

