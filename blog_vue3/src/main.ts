import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from "./router/index.js";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import http from "./utils/axios.js";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPersist from 'pinia-plugin-persist'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'



library.add(fas,far,fab)

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App as any);

app.config.globalProperties.$http = http

app.use(router).use(ElementPlus).use(pinia).component('font-awesome-icon', FontAwesomeIcon).use(VueCropper)


for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')




