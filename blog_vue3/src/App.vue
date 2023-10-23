<template>
  <router-view></router-view>
</template>

<script>
import Login from "./views/common/login.vue";

export default {
  name: 'App',
  components: {
    Login,
  }
}
</script>
