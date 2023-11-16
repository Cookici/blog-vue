import {defineStore} from "pinia";


export const pageStore = defineStore('page', {

    state: () => {
        return {
            page: 1,
            sortId: 0,
            value: ''
        }
    },
    actions: {
        setToken(page: string) {
            localStorage.setItem("page", page)
        },
    }


})