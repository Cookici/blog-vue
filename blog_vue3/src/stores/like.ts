import {defineStore} from "pinia";


export const likeStore = defineStore('like', {

    state: () => {
        return {
            articleLike : [] as any[],
            commentLike:[] as any[]
        }
    },



})