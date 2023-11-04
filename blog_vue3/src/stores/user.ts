import {defineStore} from "pinia";
import {User} from "../models/user.model.ts";


export const userStore = defineStore('user', {

    state: () => {
        return {
            user: null as User | null,
        }
    },

    actions: {
        setUser(user: User) {
            this.user = user
        }
    },

    persist: {
        enabled: true,
        strategies: [
            {storage: localStorage, paths: ['user']}
        ],
    }

})

