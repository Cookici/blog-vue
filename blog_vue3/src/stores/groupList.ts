import {defineStore} from "pinia";
import {Group} from '../models/group.model.ts'


export const groupListStore = defineStore('groupList', {
    state: () => {
        return {
            groupList: [] as Group[] | [],
            groupListSize: 0
        }
    },
})
