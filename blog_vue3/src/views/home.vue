<script setup lang="ts">
import {getCurrentInstance, onMounted, reactive, ref} from 'vue'
import {User} from "../models/user.model.ts";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
import {userStore} from "../stores/user.ts";
import {activeIndexStore} from "../stores/activeIndex.ts";
import Cropper from "../components/upload/cropper.vue";
import SocketService from "../utils/websocket.js";


const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const UserStore = userStore()
const router = useRouter()
const ActiveIndexStore = activeIndexStore()

let keyword = ref('')
let dialogVisible = ref(false)

const search = () => {
  if (keyword.value !== '') {
    console.log("search ok")
  }
}

const state = reactive({
  socketServe: SocketService.Instance,
})


const logout = () => {
  $http({
    url: `/identify/logout`,
    method: "get",
  }).then((data: {
    data: any
  }) => {
    SocketService.Instance.register(0)
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

let user: User = JSON.parse(localStorage.getItem('user') as any).user

const init = () => {
  SocketService.Instance.connect();
  state.socketServe = SocketService.Instance;
}

onMounted(()=>{
  init()
  state.socketServe.register(1)
})

</script>

<template>

  <div class="container">

    <div class="header">
      <el-col :span="8">
        <div class="userDetail" style="display: flex">
          <el-dropdown>
            <img v-bind:src="user?.userProfilePhoto" alt="">
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="open">修改头像</el-dropdown-item>
                <el-dropdown-item @click="seeDetail">历史头像</el-dropdown-item>
                <el-dropdown-item @click="logout()">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div style="padding-left: 20px;align-items: center">
            <span style="font-weight: bold;font-size: 18px">昵称：{{ user?.userNickname }}</span><br>
            <span style="font-weight: 100;color: #96969b">{{ user?.userName }}</span><br>
            <span class="colorful">level：{{ user?.userLevel }}</span>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div style="display: flex;align-items: center;">
          <el-input
              v-model="keyword"
              placeholder="请输入你要搜索的文章"
              prefix-icon="el-icon-search"
              style="width: 60%;padding: 5px;text-align: left"
              clearable
              @clear="search"
              @keydown.enter.native="search"></el-input>
          <el-button
              type="primary"
              @click="search"
              style="width: 75px;margin: 10px"
          >
            <el-icon style="margin-right:3px">
              <Search/>
            </el-icon>
            搜索
          </el-button>
        </div>
      </el-col>

      <el-col :span="8" style="height: 100%">
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
            <el-menu-item index="3">个人中心</el-menu-item>
            <el-menu-item index="/home/chat">聊天室</el-menu-item>
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


.container {
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
  width: 70px;
  height: 70px;
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