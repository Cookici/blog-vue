<script setup lang="ts">

import {getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {socket} from "../../utils/websocket.js";
import V3Emoji from "vue3-emoji";
import 'vue3-emoji/dist/style.css'
import {useRouter} from "vue-router";
import {groupMessage} from "../../stores/groupMessage.ts";
import ListScroll from "../../components/ListScroll.vue";
import {groupListStore} from "../../stores/groupList.ts";
import {userStore} from "../../stores/user.ts";
import {User} from "../../models/user.model.ts";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
let message = ref('')
const router = useRouter()
const UserStore = userStore()
const GroupMessage = groupMessage()
const GroupListStore = groupListStore()
const ListScrollRef: any = ref(null)
const placeholder = `你现在正在${router.currentRoute.value.query.groupId}群聊里聊天,请输入内容...`
const sendMessage = () => {

  let data = {
    type: 4,
    params: {
      message: message.value,
      toMessageId: router.currentRoute.value.query.groupId,
      fileType: 'text'
    }
  }
  socket.send(data)

  let messageSelf = {
    message: message.value,
    fromUser: {
      userId: UserStore.user?.userId,
      userName: UserStore.user?.userName,
    },
    groupId: GroupMessage.groupId,
    fileType: "text",
    time: new Date()
  }
  message.value = ''
  GroupMessage.receiveGroupMessage.push(messageSelf)
  ListScrollRef.value.toSendMessage()
}

const keyCall = (e: any) => {
  if (e.ctrlKey && e.keyCode == 13) {
    sendMessage()
  }
}

const appendText = (param: any) => {
  message.value += param.emoji
}

const getGroupAllMessage = (grouId: any) => {
  $http({
    url: $http.adornUrl(`blog/redis/allGroupMessage/${grouId}`),
    method: 'get',
  }).then(({data}: any) => {
    let messages = data.data
    let array = []
    let trueObj = {}
    for (let i = 0; i < messages.length; i++) {
      trueObj = {
        fromUser: {
          userId: data.data[i].fromId,
          userName: UserStore.user?.userName
        },
        groupId: data.data[i].groupId,
        message: data.data[i].infoContent,
        time: data.data[i].time,
        fileType: "text",
      }
      array.push(trueObj)
    }
    GroupMessage.receiveGroupMessage = array
  })
}

const clearOffLineMessage = (groupId: any) => {
  $http({
    url: $http.adornUrl(`blog/redis/group/setBitmap/${groupId}/${UserStore.user?.userId}`),
    method: 'post',
    data: $http.adornData({}, false, 'json')
  }).then(({data}) => {
    console.log(data.data)
  })
}

const users: User[] = ref([])

const getUsersByGroupId = (groupId: any) => {
  $http({
    url: $http.adornUrl(`blog/group/getGroupUser/${groupId}`),
    method: 'get',
  }).then(({data}) => {
    users.value = data.data
    console.log("getUsersByGroupId ==> ", users)
  })
}


onBeforeUnmount(() => {
  GroupMessage.groupId = ''
})

onMounted(() => {
  GroupMessage.groupId = router.currentRoute.value.query.groupId
  clearOffLineMessage(router.currentRoute.value.query.groupId)
  getGroupAllMessage(router.currentRoute.value.query.groupId)
  getUsersByGroupId(router.currentRoute.value.query.groupId)
})

function findPhoto(id: any) {
  let currentGroup;
  for (let i = 0; i < GroupListStore.groupListSize; i++) {
    if (Number(GroupListStore.groupList[i].blogGroup.groupId) === Number(router.currentRoute.value.query.groupId)) {
      currentGroup = GroupListStore.groupList[i] as any
      for (let i = 0; i < currentGroup.photosUrl.length; i++) {
        if (Number(currentGroup.photosUrl[i].id) === Number(id)) {
          return currentGroup.photosUrl[i].photoUrl
        }
      }
    }
  }
}


</script>

<template>
  <div class="group-container">
    <el-container style="height: 100%;">
      <el-main style="background-color: #f8f8f8;height: 70%;padding: 0;margin: 0;">
        <div class="show-message" style="width: 100%;height: 100%">
          <ListScroll ref="ListScrollRef">
            <div class="chat-container">
              <div v-for="(message, index) in GroupMessage.receiveGroupMessage as any[]" :key="index"
                   :class="{ 'sent-message': Number(message.fromUser.userId) === Number(UserStore.user?.userId), 'received-message': Number(message.fromUser.userId) !== Number(UserStore.user?.userId) }">
                <div v-if="Number(message.fromUser.userId) !== Number(UserStore.user?.userId)" class="avatar">
                  <el-image :src="findPhoto(message.fromUser.userId)"></el-image>
                </div> <!-- Left Avatar -->
                <div class="message-bubble">
                  <span style="color: #7a9fc0">{{ users[Number(message.fromUser.userId)] }}:</span><br> {{ message.message }}
                </div>
                <div v-if="Number(message.fromUser.userId) === Number(UserStore.user?.userId)" class="avatar">
                  <el-image :src="UserStore.user?.userProfilePhoto"></el-image>
                </div>
              </div>
            </div>
          </ListScroll>

        </div>
      </el-main>
      <el-footer style="padding: 0;margin: 0;background-color: #f8f8f8;height: 30%;border-top: #bbb0b0 solid 1px;">
        <div class="message" style="height: 100%;width: 100%;display: flex;flex-direction: column">
          <div class="edit" style="display: flex;">
            <V3Emoji
                :recent="true"
                :fulldata="true"
                @click-emoji="appendText"
            />
          </div>
          <div class="send-message">
            <el-input
                v-model="message"
                :placeholder=placeholder
                type="textarea"
                resize="none"
                :autosize="{ minRows: 4.6, maxRows: 4.6 }"
                @keyup.enter.native="keyCall"
            />
          </div>
          <div class="send-btn">
            <el-button style="position: absolute;right: 30px;" type="primary" @keyup.enter.native="keyCall"
                       @click="sendMessage">发送
            </el-button>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.group-container {
  width: 100%;
  height: 100%;
}

.edit {
  border-bottom: #bbb0b0 solid 1px;
  width: 100%;
  height: 15%;
}

.send-message {
  background-color: white;
  width: 100%;
  height: 65%;
  position: relative;
}

.send-btn {
  background-color: white;
  width: 100%;
  height: 20%;
}

.chat-container {
  display: flex;
  flex-direction: column;
}

.sent-message {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 5px;
}

.received-message {
  display: flex;
  align-items: center;
  margin: 5px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ccc; /* Placeholder color, replace with your avatar styling */
  margin: 0 10px;
}

.message-bubble {
  max-width: 70%; /* Adjust as needed */
  padding: 8px;
  border-radius: 8px;
  background-color: #e0e0e0; /* Replace with your message bubble color */
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
}

.send-message {
  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 0 var(--el-input-border-color, var(--el-border-color)) inset;
    resize: none;
    cursor: default;
  }
}

:deep(.emoji-container) {

  height: 100%;
  align-items: center;
}
</style>