<script setup lang="ts">
import axios from "axios";
import {ref, onMounted, reactive, getCurrentInstance} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {tokenStore} from "../../stores/token.ts";
import {userStore} from "../../stores/user.ts";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const router = useRouter()
const route = useRoute()
const TokenStore = tokenStore()
const UserStore = userStore()

type stringKey = Record<string, string>

let form: stringKey = reactive({
  username: '',
  password: '',
  userKey: '',
  code: ''
})

let captcherImg = ref('')


form.username = route.query.username as string ? route.query.username as string : ''

const login = () => {

  let formData = new FormData();

  for (let key in form) {
    formData.append(key, form[key]);
  }

  axios.post('/identify/login', formData).then(response => {
    let getToken = response.headers['authorization']
    if (getToken !== undefined && getToken !== null) {
      TokenStore.setToken(getToken)
      ElMessage.success(response.data.data)
      getUser()
    } else {
      getCode()
      form.code = ''
      ElMessage.error(response.data.data)
    }
  })
}

const getUser = () => {
  $http({
    url: `identify/blog/identify/get/${form.username}`,
    method: "get",
  }).then(({data}: { data: any }) => {
    UserStore.setUser(data.data)
    router.push({path: '/home'})
  })
}

const changeCode = () => {
  getCode()
}

const getCode = () => {
  $http({
    url: '/identify/captcha',
    method: "get",
  }).then(({data}: { data: any }) => {
    form.userKey = data.data.userKey
    captcherImg.value = data.data.captcherImg
  })
}

const toRegister = () => {
  router.push({path: '/register'})
}




onMounted(() => {
  getCode()
})


</script>

<template>

  <div class="login">
    <el-form label-width="55px">
      <h1 class="title">用户登录</h1>
      <el-form-item label="用户名">
        <el-input type="text" v-model="form.username" placeholder="登录账号" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="form.password" placeholder="登录密码" autocomplete="off" show-password></el-input>
      </el-form-item>
      <el-form-item label="验证码">
        <el-input type="text" v-model="form.code" placeholder="验证码" autocomplete="off"  @keyup.enter="login()" ></el-input>
      </el-form-item>
    </el-form>
    <div>
      <div style="text-align: center;margin: 10px">
        <el-row>
          <el-col :span="12">
            <el-image :src="captcherImg"/>
          </el-col>
          <el-col :span="12">
            <el-link type="primary" style="height: 40px;width: 120px;"
                     @click="changeCode()">
              看不清,换一张试试
            </el-link>
          </el-col>
        </el-row>
      </div>
      <div style="text-align: center;margin: 30px 10px 10px;">
        <el-row>
          <el-col :span="12"> <el-button type="primary" @click="login()" style="width: 60%">登录</el-button></el-col>
          <el-col :span="12"><el-button type="primary" @click="toRegister()" style="width: 60%">注册</el-button></el-col>
        </el-row>
      </div>
      <el-row style="margin: 20px 0 0;">
        <el-link type="primary">忘记密码</el-link>
      </el-row>
    </div>

  </div>


</template>

<style>

.login {
  align-items: center;
  border-radius: 10px;
  margin: 12% auto;
  width: 350px;
  padding: 30px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  text-align: left;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
}


.title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}

</style>