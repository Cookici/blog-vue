<script setup lang="ts">
import BScroll from "better-scroll";
import {nextTick, onMounted, onUnmounted, onUpdated, ref} from "vue";
import bus from 'vue3-eventbus'

let scroll = ref(null)


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


const toSendMessage = () => {
  scroll.value.scrollTo(0, scroll.value.maxScrollY - 65, 300)
}

//不相关传值
bus.on('receiveMessageScroll',data =>{
  if(data){
    scroll.value.scrollTo(0, scroll.value.maxScrollY - 65, 300)
  }
})

//父传子
defineExpose({
  toSendMessage
})


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