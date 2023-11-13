import {defineStore} from "pinia";


export const readStore = defineStore('read', {

    state: () => {
        return {
            read: {}
        }
    },

})

