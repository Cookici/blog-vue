<script setup lang="ts">
import {onMounted, getCurrentInstance, ref, reactive, toRaw, nextTick, Ref, UnwrapRef} from "vue";
import {userStore} from "../../stores/user.ts";
import {User} from "../../models/user.model.ts";
import {ElMessage, ElMessageBox, ElTable} from "element-plus";
import {v4} from "uuid";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const UserStore = userStore()

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])

const disabled: Ref<UnwrapRef<boolean>> = ref(true)

const groupUserIds: number[] = reactive([])
const friendList: Ref<UnwrapRef<any[]>> = ref([])

const groupName = ref('')

const getFriends = () => {
  $http({
    url: $http.adornUrl(`blog/chat/friendList/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data}: any) => {
    console.log(data)
    friendList.value = data.data
  })
}

const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val
  if (toRaw(multipleSelection.value).length >= 2) {
    disabled.value = false
  } else {
    disabled.value = true
  }
}

const createGroup = () => {
  if (groupName.value === '') {
    ElMessage.warning("群名不能为空")
    return
  }
  ElMessageBox.confirm(`是否创建群聊${groupName.value}`, "提示", {}).then(() => {
    groupUserIds.push(UserStore.user?.userId as any)
    let groupId = v4();
    groupId = groupId.replace(/[a-zA-Z]+/g, "")
    groupId = groupId.replace(/-+/g, '')
    groupId = groupId.substring(0, 6)
    for (let i = 0; i < toRaw(multipleSelection.value).length; i++) {
      groupUserIds.push(multipleSelection.value[i].userId as any)
    }
    groupUserIds.sort((a, b) => a - b)
    $http({
      url: $http.adornUrl(`blog/group/create/${UserStore.user?.userName}`),
      method: 'post',
      data: $http.adornData({groupId: groupId, groupName: groupName.value, ids: groupUserIds}, false, 'json')
    }).then(({data} : any) => {
      if (data.data === true) {
        ElMessage.success("创建成功")
        nextTick(() => {
          window.location.reload()
        })
      } else if (data.data === false) {
        ElMessage.warning("你们几个已经创建过群了")
      } else {
        ElMessage.error("服务器错误")
      }
    })
    groupUserIds.splice(0)
    groupName.value = ''
  }).catch(() => {
    groupUserIds.splice(0)
    groupName.value = ''
    ElMessage.success("取消创建成功")
  })

}


onMounted(() => {
  getFriends()
})

</script>

<template>
  <el-container style="height: 100%;;display: flex;flex-direction: column">
    <el-table
        ref="multipleTableRef"
        :data="friendList"
        style="width: 100%;min-height: 90%;height: auto"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection"/>
      <el-table-column label="头像">
        <template #default="scope">
          <el-image style="width: 60px;height: 60px" :src="scope.row.userProfilePhoto"/>
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="账号">
      </el-table-column>
      <el-table-column prop="userNickname" label="昵称">
      </el-table-column>
    </el-table>
    <div style="align-items: center;height: 10%;background-color: white;display: flex">
      <el-input style="margin-left:3%;width: 80%" v-model="groupName" placeholder="输入群聊名称..."/>
      <el-button style="margin-left: 6%" type="primary" :disabled="disabled" @click="createGroup">创建群聊</el-button>
    </div>
  </el-container>
</template>

<style scoped>

</style>