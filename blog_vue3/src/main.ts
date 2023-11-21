import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {far} from '@fortawesome/free-regular-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from "./router/index.js";
import UndrawUi from 'undraw-ui'
import ElementPlus from 'element-plus'
import http from "./utils/axios.js";
import VueCropper from 'vue-cropper';
import eventBus from 'vue3-eventbus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPersist from 'pinia-plugin-persist'
import 'vue-cropper/dist/index.css'
import 'element-plus/dist/index.css'
import "v3-scroll/dist/library.mjs.css";
import 'undraw-ui/dist/style.css'


library.add(fas, far, fab)

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App as any);

app.config.globalProperties.$http = http

app.use(router)
    .use(ElementPlus)
    .use(pinia)
    .use(VueCropper)
    .use(eventBus)
    .use(UndrawUi)
    .component('font-awesome-icon', FontAwesomeIcon)



for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')




