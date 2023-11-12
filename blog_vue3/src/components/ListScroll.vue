<script setup lang="ts">
import BScroll from "better-scroll";
import {nextTick, onMounted, onUnmounted, onUpdated, ref, watch} from "vue";
import {singleMessage} from "../stores/singleMessage.ts";
import {userStore} from "../stores/user.ts";
import {ElNotification} from "element-plus";

let scroll = ref(null)

const SingleMessage = singleMessage()
const UserStore = userStore()

const initScroll = () => {
  scroll.value = new BScroll(document.querySelector('.wrapper'), {
    probeType: 3,
    click: true,
    autoEndDistance: 5,
    mouseWheel: true,
  })
  scroll.value.on('scrollStart', () => {

  })
  scroll.value.on('scroll', ({y}) => {

  })
  scroll.value.on('scrollEnd', (pos) => {

  })
}

watch(
    () => SingleMessage.receiveMessage,
    (value, oldValue) => {
        scroll.value.scrollTo(0, scroll.value.maxScrollY - 65, 300)
    },
    {
      deep: true
    }
)

onMounted(() => {
  nextTick(() => {
    initScroll()
    setTimeout(() => {
      scroll.value.scrollTo(0, scroll.value.maxScrollY - 65, 300)
    }, 200)
  })
})

onUpdated(() => {
  scroll.value.refresh()
})

onUnmounted(() => {
  scroll.value.destroy()
})

</script>

<template>

  <div class="wrapper">
    <slot></slot>
  </div>

</template>

<style scoped>


.wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper::-webkit-scrollbar {

}

</style>