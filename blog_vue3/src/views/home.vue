<script setup lang="ts">
import {getCurrentInstance, onBeforeMount, onBeforeUnmount, onMounted, ref} from 'vue'
import {ElMessage, ElNotification} from "element-plus";
import {useRouter} from "vue-router";
import {userStore} from "../stores/user.ts";
import {activeIndexStore} from "../stores/activeIndex.ts";
import Cropper from "../components/upload/cropper.vue";
import {socket} from "../utils/websocket.js";
import {singleMessage} from "../stores/singleMessage.ts";
import bus from 'vue3-eventbus'
import {readStore} from "../stores/read.ts";
import {groupListStore} from "../stores/groupList.ts";
import {groupMessage} from "../stores/groupMessage.ts";
import {groupReadStore} from "../stores/groupRead.ts";


const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const UserStore = userStore()
const router = useRouter()
const ActiveIndexStore = activeIndexStore()
const SingleMessage = singleMessage()
const ReadStore = readStore()
const GroupListStore = groupListStore()
const GroupMessage = groupMessage()
const GroupReadStore = groupReadStore()


let dialogVisible = ref(false)

const logout = () => {
  $http({
    url: $http.adornUrl(`logout`),
    method: "post",
  }).then((data: {
    data: any
  }) => {
    socket.register(0)
    localStorage.clear()
    router.replace({path: '/login'}).then(() => {
      window.location.reload()
    })
    ElMessage.success(data.data.data)
  })
}


const canPointer = ref('none')

const open = () => {
  dialogVisible.value = !dialogVisible.value
  canPointer.value = dialogVisible.value ? 'auto' : 'none'
}


const seeDetail = () => {
  router.push({path: '/home/content/historyImg'})
}


const messageFromWebSocket = () => {
  socket.ws.onmessage = function (msg: any) {
    const res = JSON.parse(msg.data);
    if (res.type === 9) {       //注册
      console.log("注册从服务端获取到了数据 ==> ", res)
      ElMessage.success(`${res.params.message}`)
    } else if (res.type === 10) {   //心跳
      console.log(res.params.message)
    } else if (res.type === 5) {
      if (Number(res.params.toUser.userId) === Number(UserStore.user?.userId)
          && Number(SingleMessage.friendId) !== Number(res.params.fromUser.userId)
      ) {
        ElNotification({
          title: "提示",
          message: `你有${res.params.fromUser.userName}的新消息`,
          type: "success",
        })
      }
      if (
          (Number(res.params.toUser.userId) === Number(UserStore.user?.userId) && Number(res.params.fromUser.userId) === Number(SingleMessage.friendId))
          || (Number(res.params.fromUser.userId) === Number(UserStore.user?.userId) && Number(res.params.toUser.userId) === Number(SingleMessage.friendId))
      ) {
        SingleMessage.receiveMessage.push(res.params as any)
        bus.emit('receiveMessageScroll', {flag: true})
      } else {
        if (Number(res.params.toUser.userId) === Number(UserStore.user?.userId)) {
          addRedPoint(UserStore.user?.userId, res.params.fromUser.userId)
        }
      }
    } else if (res.type === 7) {
      if (Number(res.params.groupId) === Number(GroupMessage.groupId)) {
        console.log(res.params)
        GroupMessage.receiveGroupMessage.push(res.params as any)
        bus.emit('receiveMessageScroll', {flag: true})
      } else {
        ElNotification({
          title: "提示",
          message: `群聊${res.params.groupId}的新消息来咯`,
          type: "success",
        })
        addGroupRedPoint(UserStore.user?.userId, res.params.groupId)
      }
    }
  }
}

const addRedPoint = (userId : any, friendId : any) => {
  $http({
    url: $http.adornUrl(`blog/redis/redPoint/add/${userId}/${friendId}`),
    method: 'get'
  }).then(({data} : any) => {
    ReadStore.read = data.data
    console.log("ReadStore:", ReadStore.read)
  })
}

const addGroupRedPoint = (userId : any, groupId : any) => {
  $http({
    url: $http.adornUrl(`blog/redis/redPoint/group/add/${userId}/${groupId}`),
    method: 'get'
  }).then(({data} : any) => {
    GroupReadStore.groupRead = data.data
    console.log("GroupReadStore:", data.data)
  })

}


const getAllGroup = () => {
  $http({
    url: $http.adornUrl(`blog/group/getGroups/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data} : any) => {
    console.log(data.data)
    GroupListStore.groupList = data.data.groups
    GroupListStore.groupListSize = data.data.groupsSize
    console.log("home groupList", GroupListStore.groupList)
    console.log("home groupsSize", GroupListStore.groupListSize)
    sendCreateGroup()
  })
}


const sendCreateGroup = () => {
  console.log("sendCreateGroup")
  for (let i = 0; i < GroupListStore.groupList.length; i++) {
    console.log("sendCreateGroup begin")
    let data = {
      type: 3,
      params: {
        userIdList: GroupListStore.groupList[i].blogGroup.usersId.substring(1, GroupListStore.groupList[i].blogGroup.usersId.length - 1),
        groupId: GroupListStore.groupList[i].blogGroup.groupId
      }
    }
    console.log(data.params.userIdList)
    socket.send(data)
  }
}


onBeforeMount(() => {
  if (UserStore.user !== null) {
    socket.register(1)
  } else {
    socket.close()
  }
  getAllGroup()
})

onMounted(() => {
  messageFromWebSocket()
})

onBeforeUnmount(() => {
  if (UserStore.user !== null) {
    socket.register(0)
  } else {
    socket.close()
  }
})


</script>

<template>

  <div class="home-container">

    <div class="header">
      <el-col :span="14">
        <div class="userDetail" style="display: flex">
          <el-dropdown>
            <img v-bind:src="UserStore.user?.userProfilePhoto" alt="">
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="open">修改头像</el-dropdown-item>
                <el-dropdown-item @click="seeDetail">历史头像</el-dropdown-item>
                <el-dropdown-item @click="logout()">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div style="padding-left: 20px;align-items: center">
            <span style="font-weight: bold;font-size: 18px">昵称：{{ UserStore.user?.userNickname }}</span><br>
            <span style="font-weight: 100;color: #96969b">{{ UserStore.user?.userName }}</span><br>
            <span class="colorful">level：{{ UserStore.user?.userLevel }}</span>
          </div>
        </div>
      </el-col>


      <el-col :span="10" style="height: 100%">
        <div class="nav">
          <el-menu
              :default-active="ActiveIndexStore.activeIndex"
              class="el-menu-demo"
              mode="horizontal"
              :ellipsis="false"
              :router="true"
          >
            <div class="flex-grow"/>
            <el-menu-item index="/home/content">博客主页</el-menu-item>
            <el-menu-item index="/home/subArticle">发表博客</el-menu-item>
            <el-menu-item index="/home/personCenter">个人中心</el-menu-item>
            <el-menu-item index="/home/chat">聊天主页</el-menu-item>
          </el-menu>
        </div>
      </el-col>
    </div>

    <router-view :key="$route.fullPath"></router-view>

  </div>

  <div style="position: absolute;
          height: 600px;
          width: 800px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%)" :style="{pointerEvents:canPointer}">
    <div style="padding-top:1.5%"></div>
    <Cropper v-model:canPointer="canPointer" v-model:dialogVisible="dialogVisible"
             v-if="dialogVisible"
             style="height: 100%;width: 100%"
             :userName="UserStore.$state.user?.userName"
             :photoUrl="UserStore.$state.user?.userProfilePhoto"
    />
  </div>

</template>

<style scoped>


.colorful {
  background: linear-gradient(to bottom, #96969b, #6c7b88, #484d52);
  -webkit-background-clip: text;
  color: transparent;
}


.home-container {
  height: 100%;
  width: 100%;
  background: #f8f8f8;
  overflow-y: auto;
}

.header {
  height: 10%;
  width: 100%;
  position: fixed;
  display: flex;
  text-align: center;
  align-items: center;
  background: white;
  right: 0;
  top: 0;
  z-index: 999;
}

.userDetail img {
  margin-left: 30px;
  object-fit: fill;
  width: 65px;
  height: 65px;
  border-radius: 100%;
  outline: none; /*取消黑边*/
}


/* 导航条 */
.nav {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.nav ul {
  margin: 0;
  padding: 0;
  display: flex;
  height: 100%;
}

/* 导航链接 */
.nav li {
  cursor: pointer;
  color: black;
  font-size: 16px;
  flex: 1;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Microsoft JhengHei UI", serif;
  font-weight: bold;
}


</style>