import {defineStore} from "pinia";


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

    persist:{
        enabled:true,
        strategies: [
            { storage: sessionStorage, paths: ['user'] }
        ],
    }

})

interface User {
    userId: string;
    userIp: string;
    userName: string;
    userPassword: null;
    userEmail: string;
    userProfilePhoto: string;
    userRegistrationTime: string
    userBirthday: string;
    userAge: string;
    userTelephoneNumber: string;
    userNickname: string;
    userLevel: string;
    userAuthority: string;
}