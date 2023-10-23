import {createRouter, createWebHashHistory} from 'vue-router'
import Login from "../views/common/login.vue";
import Home from "../views/common/home.vue";


const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/home',
        name: 'Home',
        component: Home
    },

]


const router = createRouter({
    history: createWebHashHistory(),
    routes,
})



export default router

