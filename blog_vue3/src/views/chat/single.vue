<script setup lang="ts">


import {getCurrentInstance, onBeforeMount, onMounted, reactive, ref} from "vue";
import {User} from "../../models/user.model.ts";
import {socket} from "../../utils/websocket.js"
import ListScroll from "../../components/ListScroll.vue";
import {singleMessage} from "../../stores/singleMessage.ts";
import {userStore} from "../../stores/user.ts";
import V3Emoji from 'vue3-emoji'
import 'vue3-emoji/dist/style.css'

const SingleMessage = singleMessage()
const UserStore = userStore()
const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

let message = ref('')

let friend: User = reactive(history.state.friend);

let emoji = ref(null)
const sendMessage = () => {

  let friendName = ''

  let data = {
    type: 2,
    params: {
      message: message.value,
      toMessageId: friend.userId,
      fileType: "text",
    }
  }
  socket.send(data)

  $http({
    url: `/chat/blog/chat/getFriend/${friend.userId}`,
    method: 'get'
  }).then(({data}) => {
    console.log(data)
    friendName = data.data.userName
    let messageSelf = {
      message: message.value,
      fromUser: {
        userId: UserStore.user?.userId,
        userName: UserStore.user?.userName,
      },
      toUser: {
        userId: friend.userId,
        userName: friendName
      },
      fileType: "text",
      time: new Date()
    }
    SingleMessage.receiveMessage.push(messageSelf)
    message.value = ''
  })


}

const keyCall = (e) => {
  if (e.ctrlKey && e.keyCode == 13) {
    sendMessage()
  }
}

const appendText = (param) => {
  message.value += param.emoji
}

const getMessage = () => {
  $http({
    url: `/chat/blog/redis/getFriendSingleMessage/${UserStore.user?.userId}/${friend.userId}`,
    method: 'get'
  }).then(({data}) => {
    console.log(data)
    let messages = data.data
    let array = []
    let trueObj = {}
    for (let i = 0; i < messages.length; i++) {
      trueObj = {
        fromUser: {
          userId: data.data[i].fromId,
          userName: UserStore.user?.userName
        },
        toUser: {
          userId: data.data[i].toId,
          userName: friend.userName
        },
        message: data.data[i].infoContent,
        time: data.data[i].time
      }
      array.push(trueObj)
    }
    SingleMessage.receiveMessage = array
  })

}

onMounted(() => {
  SingleMessage.friendId = friend.userId
  getMessage()
})

</script>

<template>
  <div class="single-container">
    <el-container style="height: 100%;">
      <el-main style="background-color: #f8f8f8;height: 70%;padding: 0;margin: 0;">
        <div class="show-message" style="width: 100%;height: 100%">
          <ListScroll>
            <div class="chat-container">
              <div v-for="(message, index) in SingleMessage.receiveMessage" :key="index"
                   :class="{ 'sent-message': Number(message.fromUser.userId) === Number(UserStore.user?.userId), 'received-message': Number(message.fromUser.userId) !== Number(UserStore.user?.userId) }">
                <div v-if="Number(message.fromUser.userId) !== Number(UserStore.user?.userId)" class="avatar">
                  <el-image :src="friend.userProfilePhoto"></el-image>
                </div> <!-- Left Avatar -->
                <div class="message-bubble">
                  {{ message.message }}
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
          <div class="edit">
            <V3Emoji
                @click-emoji="appendText"
                :recent="true"
                :fulldata="true"
            />
          </div>
          <div class="send-message">
            <el-input
                v-model="message"
                placeholder="输入消息..."
                type="textarea"
                resize="none"
                :autosize="{ minRows: 4.6, maxRows: 4.6 }"
                @keyup.enter.native="keyCall"
            />
          </div>
          <div class="send-btn">
            <el-button style="position: absolute;right: 30px;" type="primary" @click="sendMessage">发送</el-button>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>

.single-container {
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


</style>