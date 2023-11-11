<script setup lang="ts">
import {onMounted, reactive, ref, getCurrentInstance} from "vue";
import {activeIndexStore} from "../../stores/activeIndex";
import {ElMessage, ElMessageBox} from "element-plus";
import {userStore} from "../../stores/user.ts";
import {User} from "../../models/user.model.ts";
import {socket} from "../../utils/websocket.js";
import qs from "qs";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

const ActiveIndexStore = activeIndexStore()
const UserStore = userStore()


let searchId = ref('')

const friendApplySize = ref(0)

let friendApplyList: User[] = reactive([])

const toSearch = () => {
  $http({
    url: `/identify/blog/identify/getByUserName/${searchId.value}`,
    method: 'get',
    data: $http.adornParams({}, false)
  }).then(({data}: any) => {
    if (data.code !== 200) {
      ElMessage.warning("没有此用户")
    } else {
      ElMessageBox.confirm(`是否添加${data.data.userName}:${data.data.userNickname}`, "提示").then(() => {
        ElMessage.success('已发送好友申请')
        wsAddFriend(data.data.userId)
      }).catch(() => {
        ElMessage.success('已取消添加')
      })
    }
  })
}

const judgeHaven = () => {
  if (searchId.value === UserStore.user?.userName) {
    ElMessage.warning("不能添加自己")
    return;
  }
  $http({
    url: `/chat/blog/chat/${UserStore.user?.userId}/${searchId.value}`,
    method: 'get',
  }).then(({data}) => {
    console.log(data)
    if (data.data == 0) {
      toSearch()
    } else {
      ElMessage.warning("已经添加过该好友")
    }
  })
}

const handlerOpen = (index: any) => {
  if (index === '4') {
    getApply()
  }
}

const getApply = () => {
  $http({
    url: `/chat/blog/redis/get/apply/${UserStore.user?.userId}`,
    method: 'get',
    data: $http.adornParams({}, false)
  }).then(({data}: any) => {
    console.log(data)
    friendApplySize.value = data.data.applySize
    if (friendApplySize.value !== 0) {
      $http({
        url: `/identify/blog/identify/getByIds?${qs.stringify({ids: Object.keys(data.data.apply)}, {
          charset: "utf-8",
          arrayFormat: "repeat"
        })}`,
        method: 'get',
      }).then(({data}: any) => {
        friendApplyList = data.data
      })
    }
  })
}

const agree = (userId: number, friendId: number) => {
  ElMessageBox.confirm("是否添加该好友?", "提示", {}).then(() => {
    $http({
      url: "/chat/blog/chat/agree",
      method: 'post',
      data: $http.adornData({userId: userId, friendId: friendId}, false, 'json')
    }).then(({data}: any) => {
      console.log(data)
      if (data.data === 2) {
        ElMessage.success("添加成功")
        setTimeout(()=>{
          window.location.reload()
        },200)
      }
    })
  }).catch(() => {
    ElMessage.success("取消添加成功")
  })
}

const reject = (userId: number, friendId: number) => {
  ElMessageBox.confirm("是否确定拒绝","提示",{}).then(()=>{
    $http({
      url: "/chat/blog/chat/reject",
      method: 'put',
      data: $http.adornData({userId: userId, friendId: friendId}, false, 'json')
    }).then(({data}) => {
      if (data.code == 200) {
        ElMessage.success("删除成功")
        setTimeout(()=>{
          window.location.reload()
        },200)
      }
    })
  }).catch(()=>{
    ElMessage.success("取消拒绝成功")
  })

}


const wsAddFriend = (userId: any) => {
  let data = {
    type: 5,
    params: {
      toMessageId: userId,
    }
  }
  socket.send(data)
}


onMounted(() => {
  socket.init()
  ActiveIndexStore.activeIndex = '/home/chat'
  getApply()
})

</script>

<template>
  <div class="padding" style="height: 10%"></div>
  <div class="chat-container">
    <el-container style="height: 99.9%">
      <el-aside width="350px">
        <el-menu class="el-menu-vertical-demo" @open="handlerOpen">


          <el-menu-item index="1">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>聊天首页</span>
          </el-menu-item>


          <el-sub-menu index="2">
            <template #title>
              <el-icon>
                <location/>
              </el-icon>
              <span>我的好友</span>
            </template>
          </el-sub-menu>


          <el-sub-menu index="3">
            <template #title>
              <el-icon>
                <location/>
              </el-icon>
              <span>群聊</span>
            </template>
          </el-sub-menu>


          <el-sub-menu index="4">
            <template #title>
              <el-icon>
                <location/>
              </el-icon>
              <span>好友申请</span>
              <font-awesome-icon style="margin-left: 50%" :icon="['far', 'message']"/>&nbsp;&nbsp;<span
                style="color: red">{{ friendApplySize }}</span>
            </template>
            <el-menu-item v-for="apply in friendApplyList" :key="apply.userId" style="height: 150px">
              <div class="apply-box">
                <div class="apply-userInfo">
                  <el-row>
                    <el-col :span="8" style="padding: 10px">
                      <el-image class="apply-img" :src="apply.userProfilePhoto"></el-image>
                    </el-col>
                    <el-col :span="8"></el-col>
                    <el-col :span="8" style="text-align: center">
                      <div class="apply-message">
                        <span style="font-weight: bolder">昵称：{{ apply.userNickname }}</span>
                        <span style="font-weight: 100">{{ apply.userName }}</span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="option">
                  <el-button size="small" style="margin-right: 70px;margin-top: 4px" type="primary"
                             @click="agree(UserStore.user?.userId ,apply.userId)">
                    同意
                  </el-button>
                  <el-button size="small" style="margin-left: 70px;margin-top: 4px" type="danger"
                             @click="reject(UserStore.user?.userId ,apply.userId)">拒绝
                  </el-button>
                </div>
              </div>
            </el-menu-item>
          </el-sub-menu>


        </el-menu>
      </el-aside>
      <el-container style="height: auto;min-height: 100%">
        <el-header style="padding: 10px">
          <el-input style="width: 80%" v-model="searchId" placeholder="Please input"/>
          <el-button style="margin-left: 7%" type="primary" @click="judgeHaven">添加</el-button>
        </el-header>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.chat-container {
  height: 90%;
  width: 100%;
}

.el-aside {
  border: black solid 1px;
}

.el-header {
  border: black solid 1px;
}

.el-main {
  border: black solid 1px;
}

.parent-container {
  /* Set the parent container's size here */
  width: 400px; /* Example width */
  height: 600px; /* Example height */
}

.el-menu-item {
  border: black solid 1px;
}

.apply-box {
  margin-top: 5px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

}

.apply-userInfo {
  flex: 1;
  display: flex;
}

.apply-message {
  flex: 1;
  display: flex;
  flex-direction: column;
}


.option {
  flex: 3;
  display: flex;
  text-align: center;
  justify-content: center;
}

.apply-img {
  height: 80px;
  width: 80px;
}

/* Additional styles for buttons, images, etc. can be added as needed */

</style>