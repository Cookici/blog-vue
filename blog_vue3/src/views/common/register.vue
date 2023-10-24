<script>

import {v4} from 'uuid';
import {useRouter} from "vue-router";
import {ref, reactive, getCurrentInstance} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";

export default {


  name: 'Register',


  setup() {


    const router = new useRouter()
    const {$http} = getCurrentInstance().appContext.config.globalProperties

    let canSubmit = ref(true)
    let surePassword = ref('')
    let blogUser = reactive({
      userName: '',
      userNickname: '',
      userPassword: '',
      userEmail: '',
      userProfilePhoto: 'https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/%E5%93%88.jpg',
      userBirthday: '',
      userTelephoneNumber: '',
    })


    function doRegister() {
      ElMessageBox.confirm(`你的账号为${blogUser.userName},点击确定进行注册`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() =>
          $http({
            url: '/identify/blog/identify/register',
            method: 'post',
            data: $http.adornData(blogUser, false)
          }).then(({data}) => {
                if (data.code === 200) {
                  ElMessage.success({message: "注册成功"})
                  router.push({path: '/login', query: {username: blogUser.userName}})
                }
              }
          )).catch((error) => {
        ElMessage.error({message: "注册失败"})
      })
    }


    function productUsername() {
      blogUser.userName = v4();
      blogUser.userName = blogUser.userName.replace(/[a-zA-Z]+/g, "")
      blogUser.userName = blogUser.userName.replace(/-+/g, '')
      blogUser.userName = blogUser.userName.substring(0, 9)
    }


    return {
      canSubmit,
      surePassword,
      blogUser,
      doRegister,
      productUsername
    }

  }

  ,


  mounted() {

    this.productUsername()

  }
  ,


}

</script>

<template>

  <el-form ref="form" :model="blogUser" label-width="80px">
    <el-form-item label="昵称">
      <el-input v-model="blogUser.userNickname"></el-input>
    </el-form-item>
    <el-form-item label="账号">
      <el-input v-model="blogUser.userName" readonly></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="blogUser.userPassword" show-password></el-input>
    </el-form-item>
    <el-form-item label="确认密码">
      <el-input v-model="surePassword" :type="'password'"></el-input>
    </el-form-item>
    <el-form-item label="生日">
      <el-date-picker type="date" placeholder="选择日期" v-model="blogUser.userBirthday"
                      style="width: 100%;"></el-date-picker>
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="blogUser.userEmail"></el-input>
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="blogUser.userTelephoneNumber"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" round @click="doRegister">提交</el-button>
    </el-form-item>
  </el-form>

</template>

<style scoped>

</style>