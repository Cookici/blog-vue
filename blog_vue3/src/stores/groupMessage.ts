import {defineStore} from "pinia";


export const groupMessage = defineStore('groupMessage', {
    state: () => {
        return {
            receiveGroupMessage: [],
            groupId: ''
        }
    },
})