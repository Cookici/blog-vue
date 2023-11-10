import {createRouter, createWebHistory} from 'vue-router'
import http from '../utils/axios'


const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import("../views/common/login.vue"),
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import("../views/home.vue"),
        children: [
            {
                path: '/home/content/showArticle',
                name: 'ShowArticle',
                component: () => import("../views/article/showArticle.vue")
            },
            {
                path: '/home/content',
                name: 'Content',
                component: () => import("../views/article/content.vue")
            },
            {
                path: '/home/content/historyImg',
                name: 'HistoryImg',
                component: () => import("../components/historyImg.vue")
            },
            {
                path: '/home/subArticle',
                name: 'SubmitArticle',
                component: () => import("../views/article/submitArticle.vue")
            },
            {
                path:'/home/chat',
                name:'Chat',
                component:()=>import('../views/chat/chat.vue')
            }
        ]
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import("../views/common/register.vue")
    },

]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {

    if (to.name !== 'Login' && to.name !== 'Register'
        &&
        (localStorage.getItem('token') === null || localStorage.getItem('token') === undefined)
    ) {
        if (to.name === 'Register') {
            next({name: 'Register'})
        }
        next({name: 'Login'})
    } else {
        next()
    }
})


export default router

