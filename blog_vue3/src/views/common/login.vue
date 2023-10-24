<script>
import axios from "axios";
import {ref, reactive, getCurrentInstance} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {useStore} from "vuex"

export default {


  name: 'Login',

  setup() {

    const {$http} = getCurrentInstance().appContext.config.globalProperties
    const router = useRouter()
    const route = useRoute()
    const store = new useStore()

    let form = reactive({
      username: '',
      password: '',
      userKey: '',
      code: ''
    })

    let captcherImg = ref('')


    form.username = route.query.username ? route.query.username : ''


    function login() {

      let formData = new FormData();

      for (let key in form) {
        formData.append(key, form[key]);
      }

      axios.post('/identify/login', formData).then(response => {
        let getToken = response.headers['authorization']
        if (getToken !== undefined && getToken !== null) {
          store.commit('identify/SET_TOKEN', getToken)
          ElMessage.success(response.data.data)
          router.push({path: '/home', query: {username: route.query.username}})
        } else {
          getCode()
          ElMessage.error(response.data.data)
        }
      })
    }

    function changeCode() {
      getCode()
    }


    function getCode() {
      $http({
        url: '/identify/captcha',
        method: "get",
      }).then(({data}) => {
        form.userKey = data.data.userKey
        captcherImg.value = data.data.captcherImg
      })
    }

    function toRegister() {
      router.push({path: '/register'})
    }


    return {
      form,
      captcherImg,
      login,
      changeCode,
      getCode,
      toRegister
    }

  },


  mounted() {
    this.getCode()
  },


}

</script>

<template>


  <el-form
      :label-position="'left'"
      label-width="100px"
      style="max-width: 460px"
  >
    <el-form-item label="账号" name="username">
      <el-input v-model="form.username"/>
    </el-form-item>
    <el-form-item label="密码" name="password">
      <el-input v-model="form.password" show-password/>
    </el-form-item>
    <el-form-item label="验证码" name="code">
      <el-input v-model="form.code"/>
    </el-form-item>
    <img :src="captcherImg" @click="changeCode" alt="显示错误">
    <el-form-item>
      <el-button type="primary" round @click="login">登录</el-button>
      <el-button type="primary" round @click="toRegister">注册</el-button>
    </el-form-item>
  </el-form>


</template>

<style scoped>

</style>