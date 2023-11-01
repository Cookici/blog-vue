import {defineStore} from "pinia";

export const tokenStore = defineStore('token', {

    state: () => {
        return {
            token: localStorage.getItem('token') ? localStorage.getItem('token') : ''
        }
    },
    actions: {
        setToken(token: string){
            this.token = token
            localStorage.setItem("token", token)
        },
    }


})