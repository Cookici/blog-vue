import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from "./router";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import http from "./utils/axios";


const app = createApp(App);

app.config.globalProperties.$http = http

app.use(store).use(router).use(ElementPlus)

app.mount('#app')



