import {defineStore} from "pinia";


export const activeIndexStore = defineStore('activeIndex', {

    state: () => {
        return {
            activeIndex: '/home/content',
        }
    },
    actions: {
        setActiveIndex(activeIndex: string) {
            this.activeIndex = activeIndex
        },
    }


})