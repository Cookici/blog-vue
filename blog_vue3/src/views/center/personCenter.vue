<script setup lang="ts">

import {onMounted} from "vue";
import {activeIndexStore} from "../../stores/activeIndex.ts";

const ActiveIndexStore = activeIndexStore()

onMounted(() => {
  ActiveIndexStore.activeIndex = '/home/personCenter'

})

</script>

<template>
  <div class="padding" style="height: 10%"></div>

</template>


<style scoped>

</style>