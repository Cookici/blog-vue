import {defineStore} from "pinia";


export const singleMessage = defineStore('singleMessage', {
    state: () => {
        return {
            receiveMessage:[],
            friendId:''
        }
    },
})