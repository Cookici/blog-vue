<script setup lang="ts">
import {onMounted, reactive, ref, getCurrentInstance, onBeforeMount} from "vue";
import {activeIndexStore} from "../../stores/activeIndex";
import {ElMessage, ElMessageBox} from "element-plus";
import {userStore} from "../../stores/user.ts";
import {socket} from "../../utils/websocket.js";
import {useRouter} from "vue-router";
import {singleMessage} from "../../stores/singleMessage.ts";
import qs from "qs";
import {readStore} from "../../stores/read.ts";
import {groupListStore} from "../../stores/groupList.ts";
import {groupMessage} from "../../stores/groupMessage.ts";
import {groupReadStore} from "../../stores/groupRead.ts";
import {User} from "../../models/user.model.ts";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

const ActiveIndexStore = activeIndexStore()
const UserStore = userStore()
const router = useRouter()
const SingleMessage = singleMessage()
const GroupListStore = groupListStore()
const GroupMessage = groupMessage()
const GroupReadStore = groupReadStore()

let searchId = ref('')

const friendApplySize = ref(0)

let friendApplyList: User[] = reactive([])

let offLineMessage = reactive({})

let friendList: User[] = reactive([])

const friendListSize = ref(0)
const ReadStore = readStore()

let offLineGroupMessage = reactive({})

const toSearch = () => {
  $http({
    url: $http.adornUrl(`blog/identify/getByUserName/${searchId.value}`),
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
    url: $http.adornUrl(`blog/chat/${UserStore.user?.userId}/${searchId.value}`),
    method: 'get',
  }).then(({data}: any) => {
    console.log(data)
    if (data.data == 0) {
      toSearch()
    } else {
      ElMessage.warning("已经添加过该好友")
    }
  }).catch(() => {
    ElMessage.warning("没有此用户")
  })
}

const getApply = () => {
  $http({
    url: $http.adornUrl(`blog/redis/get/apply/${UserStore.user?.userId}`),
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
      url: $http.adornUrl(`blog/chat/agree`),
      method: 'post',
      data: $http.adornData({userId: userId, friendId: friendId}, false, 'json')
    }).then(({data}: any) => {
      console.log(data)
      if (data.data === 2) {
        ElMessage.success("添加成功")
        setTimeout(() => {
          window.location.reload()
        }, 200)
      }
    })
  }).catch(() => {
    ElMessage.success("取消添加成功")
  })
}

const reject = (userId: number, friendId: number) => {
  ElMessageBox.confirm("是否确定拒绝", "提示", {}).then(() => {
    $http({
      url: $http.adornUrl(`blog/chat/reject`),
      method: 'put',
      data: $http.adornData({userId: userId, friendId: friendId}, false, 'json')
    }).then(({data}: any) => {
      if (data.code == 200) {
        ElMessage.success("删除成功")
        setTimeout(() => {
          window.location.reload()
        }, 200)
      }
    })
  }).catch(() => {
    ElMessage.success("取消拒绝成功")
  })

}

const goSingleChat = (friend: any) => {
  SingleMessage.receiveMessage = []
  SingleMessage.friendId = ''
  offLineMessage[Number(friend.userId)] = 0
  clearRedPoint(friend.userId)
  router.push({path: '/home/chat/single', query: {friendId: friend.userId}, state: {friend}})
}

const clearRedPoint = (friendId) => {
  $http({
    url: $http.adornUrl(`blog/redis/redPoint/clear`),
    method: 'put',
    data: $http.adornData({userId: UserStore.user?.userId, friendId: friendId}, false, 'json')
  }).then(({data}) => {
    console.log(data.data)
    ReadStore.read[friendId] = 0
  })
}

const clearRedGroupPoint = (groupId) => {
  $http({
    url: $http.adornUrl(`blog/redis/redPoint/group/clear`),
    method: 'put',
    data: $http.adornData({userId: UserStore.user?.userId, groupId: groupId}, false, 'json')
  }).then(({data}) => {
    GroupReadStore.groupRead[groupId] = 0
    console.log(data.data)
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

const getFriends = () => {
  $http({
    url: $http.adornUrl(`blog/chat/friendList/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data}: any) => {
    friendList = data.data
    friendListSize.value = friendList.length
  })
}

const getOffLineMessage = () => {
  $http({
    url: $http.adornUrl(`blog/redis/getOffline/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data}) => {
    offLineMessage = data.data
  })
}

onBeforeMount(() => {
  SingleMessage.friendId = ''
})

const groupChat = (group, groupList) => {
  GroupMessage.receiveGroupMessage = []
  GroupMessage.groupId = ''
  offLineGroupMessage[Number(group.blogGroup.groupId)] = 0
  clearRedGroupPoint(group.blogGroup.groupId)
  router.push({path: '/home/chat/group', query: {groupId: group.blogGroup.groupId}, state: {groupList}})
}


const getOffLineGroupMessage = () => {

  $http({
    url: $http.adornUrl(`blog/group/noReadGroupMessage/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data}) => {
    console.log("getOffLineGroupMessage ==> ", data.data)
    offLineGroupMessage = data.data
  })

}


const redPointExit = () => {
  $http({
    url: $http.adornUrl(`blog/redis/redPoint/exit/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data}) => {
    ReadStore.read = data.data
    console.log("redPointExit", ReadStore.read)
  })
}


const redPointGroupExit = () => {
  $http({
    url: $http.adornUrl(`blog/redis/redPoint/group/exit/${UserStore.user?.userId}`),
    method: 'get'
  }).then(({data}) => {
    GroupReadStore.groupRead = data.data
    console.log("GroupReadStore", GroupReadStore.groupRead)
  })
}

const createGroup = () => {
  router.push({path: '/home/chat/createGroup'})
}


//计算头像布局
const computedAvatar = (avatarList) => {
  if (avatarList.length > 4) {
    return "avatarItem--3"
  } else if (avatarList.length > 1) {
    return "avatarItem--2"
  } else {
    return "avatarItem--1"
  }
}

const goChatHome = () => {
  router.push({path: '/home/chat'})
}

onMounted(() => {
  ActiveIndexStore.activeIndex = '/home/chat'
  getApply()
  getFriends()
  getOffLineMessage()
  getOffLineGroupMessage()
  redPointExit()
  redPointGroupExit()
})


</script>

<template>
  <div class="padding" style="height: 10%"></div>
  <div class="chat-container">
    <el-container style="height: 99.9%">
      <el-aside width="350px">

        <el-menu class="el-menu-vertical-demo">


          <el-menu-item index="1" @click="goChatHome">
            <template #title>
              <el-icon>
                <House/>
              </el-icon>
              <span>聊天首页</span>
            </template>
          </el-menu-item>


          <el-menu-item index="2" @click="createGroup">
            <template #title>
              <el-icon>
                <Plus/>
              </el-icon>
              <span>创建群聊</span>
            </template>
          </el-menu-item>


          <el-sub-menu index="3">
            <template #title>
              <el-icon>
                <ChatRound/>
              </el-icon>
              <span>我的好友</span>
              <font-awesome-icon :icon="['fas', 'user']" style="margin-left: 51.2%"/>
              &nbsp;&nbsp;<span style="color: black">{{ friendListSize }}</span>
            </template>
            <el-menu-item :index="String(friend.userName)"
                          @click="Number(SingleMessage.friendId) !== Number(friend.userId) && goSingleChat(friend)"
                          v-for="friend in friendList" :key="friend.userId" style="height: 150px">
              <div class="friend-box">
                <div class="friend-userInfo">
                  <el-row>
                    <el-col :span="12" style="padding: 10px">
                      <el-image class="friend-img" :src="friend.userProfilePhoto"></el-image>
                    </el-col>
                    <el-col :span="12" style="text-align: center;display: flex;flex-direction: column">
                      <div class="friend-message" style="margin: auto">
                        <span style="font-weight: bolder">昵称：{{ friend.userNickname }}</span><br>
                        <span style="font-weight: 100">{{ friend.userName }}</span>
                      </div>

                      <div style="position: absolute;right: 0;top: -10px;font-weight: 100;color: red">
                        <span>
                        {{
                            ReadStore.read[Number(friend.userId)] === null || ReadStore.read[Number(friend.userId)] === undefined || ReadStore.read[Number(friend.userId)] === 0 ? '' : "未读：" + ReadStore.read[Number(friend.userId)]
                          }}
                          </span>
                        &nbsp;
                        <span>
                        {{
                            offLineMessage[Number(friend.userId)] === 0 || offLineMessage[Number(friend.userId)] === null || offLineMessage[Number(friend.userId)] === undefined ? '' : "离线：" + offLineMessage[Number(friend.userId)]
                          }}
                          </span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-menu-item>
          </el-sub-menu>


          <el-sub-menu index="4">
            <template #title>
              <el-icon>
                <ChatDotRound/>
              </el-icon>
              <span>群聊</span>
              <font-awesome-icon :icon="['fas', 'user-group']" style="margin-left: 60%"/>
              &nbsp;<span style="color: black">{{ GroupListStore.groupListSize }}</span>
            </template>
            <el-menu-item :index="String(group.blogGroup.groupName)"
                          @click="Number(GroupMessage.groupId) !== Number(group.blogGroup.groupId) && groupChat(group,groupList)"
                          v-for="group in GroupListStore.groupList" :key="group.blogGroup.groupId"
                          style="height: 150px;">
              <div class="groupList-box">
                <div class="groupList-userInfo">
                  <el-row>
                    <el-col :span="12" style="padding: 10px">
                      <div class="avatar">
                        <template v-for="(photo,index) in group.photosUrl">
                          <el-image :src="photo.photoUrl"
                                    :key="index" :class="computedAvatar(group.photosUrl)" v-if="index<9"></el-image>
                        </template>
                      </div>
                    </el-col>
                    <el-col :span="12" style="text-align: center;display: flex;flex-direction: column">
                      <div class="groupList-message" style="margin: auto">
                        <span style="font-weight: bolder">群聊号：{{ group.blogGroup.groupId }}</span><br>
                        <span style="font-weight: 100">群聊名称：{{ group.blogGroup.groupName }}</span>
                      </div>
                      <div style="position: absolute;right: 0;top: -10px;font-weight: 100;color: red">
                        <span>
                        {{
                            GroupReadStore.groupRead[Number(group.blogGroup.groupId)] === null || GroupReadStore.groupRead[Number(group.blogGroup.groupId)] === undefined || GroupReadStore.groupRead[Number(group.blogGroup.groupId)] === 0 ? '' : "未读：" + GroupReadStore.groupRead[Number(group.blogGroup.groupId)]
                          }}
                        </span>
                        &nbsp;
                        <span>
                        {{
                            offLineGroupMessage[Number(group.blogGroup.groupId)] === 0 || offLineGroupMessage[Number(group.blogGroup.groupId)] === null || offLineGroupMessage[Number(group.blogGroup.groupId)] === undefined ? '' : "离线：" + offLineGroupMessage[Number(group.blogGroup.groupId)]
                          }}
                          </span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-menu-item>
          </el-sub-menu>


          <el-sub-menu index="5">
            <template #title>
              <el-icon>
                <Star/>
              </el-icon>
              <span>好友申请</span>
              <font-awesome-icon style="margin-left: 50%;"
                                 :icon="['fas', 'message']"/>&nbsp;&nbsp;<span>{{ friendApplySize }}</span>
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
                             @click="agree(UserStore.user?.userId as any ,apply.userId as any)">
                    同意
                  </el-button>
                  <el-button size="small" style="margin-left: 70px;margin-top: 4px" type="danger"
                             @click="reject(UserStore.user?.userId  as any,apply.userId  as any)">拒绝
                  </el-button>
                </div>
              </div>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>

      </el-aside>
      <el-container style="height: auto;min-height: 100%">
        <el-header style="padding: 10px">
          <div style="text-align: center;align-items: center">
            <el-input style="width: 80%" v-model="searchId" placeholder="输入账号..."/>
            <el-button style="margin-left: 6%" type="primary" @click="judgeHaven">添加</el-button>
          </div>
        </el-header>
        <el-main style="padding: 0;margin: 0">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component"/>
            </keep-alive>
          </router-view>
        </el-main>
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
  border: #bbb0b0 solid 1px;
}

.el-header {
  border-top: #bbb0b0 solid 1px;
  border-bottom: #bbb0b0 solid 1px;
}

.parent-container {
  /* Set the parent container's size here */
  width: 400px; /* Example width */
  height: 600px; /* Example height */
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


.avatar {

  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap-reverse;
  border: rgb(187, 176, 176) 1px solid;
}


.avatarItem--1 {
  all: initial;
  width: 98%;
  height: 98%;
}

.avatarItem--2 {
  all: initial;
  width: 47%;
  height: 47%;
  margin: 1%;
}

.avatarItem--3 {
  all: initial;
  width: 32%;
  height: 30%;
  margin: 1%;
}


</style>