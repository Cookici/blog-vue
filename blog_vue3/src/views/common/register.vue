<script setup lang="ts">

import {v4} from 'uuid';
import {useRouter} from "vue-router";
import {ref, reactive, getCurrentInstance, onMounted} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {isEmail, isLegalNickname, isMobile, isPassword, isSame} from "../../utils/validate.js";


const router = useRouter()
const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

let canSubmit = ref(false)
let surePassword = ref('')
let blogUser = reactive({
  userName: '',
  userNickname: '',
  userPassword: '',
  userEmail: '',
  userProfilePhoto: 'https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/defalut.jpg',
  userBirthday: '',
  userTelephoneNumber: '',
})


const validate = () => {

  if (!isLegalNickname(blogUser.userNickname)) {
    ElMessage.error("用户名限制在5到7位之间")
    return;
  } else if (!isPassword(blogUser.userPassword)) {
    ElMessage.error("密码长度应由字母和数字组成,且不低于8位不超过15位")
    return;
  } else if (!isSame(blogUser.userPassword, surePassword.value)) {
    ElMessage.error("两次密码不相同")
    return;
  } else if (!(blogUser.userBirthday !== '' && blogUser.userBirthday !== null)) {
    ElMessage.error("生日不能为空")
    return;
  } else if (!isEmail(blogUser.userEmail)) {
    ElMessage.error("邮件不合法")
    return;
  } else if (!isMobile(blogUser.userTelephoneNumber)) {
    ElMessage.error("手机号不合法")
    return;
  }

  canSubmit.value = true;

}


const doRegister = () => {

  validate()

  if (canSubmit.value === true) {
    ElMessageBox.confirm(`你的账号为${blogUser.userName},点击确定进行注册`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() =>
        $http({
          url: $http.adornUrl(`/blog/identify/register`),
          method: 'post',
          data: $http.adornData(blogUser, false)
        }).then(({data}: { data: any }) => {
              if (data.code === 200) {
                ElMessage.success({message: "注册成功"})
                router.push({path: '/login', query: {username: blogUser.userName}})
              }
            }
        )).catch(() => {
      ElMessage.error({message: "注册失败"})
    })
  }
}

const goBack = () => {
  router.push({path: '/login'})
}

const productUsername = () => {
  blogUser.userName = v4();
  blogUser.userName = blogUser.userName.replace(/[a-zA-Z]+/g, "")
  blogUser.userName = blogUser.userName.replace(/-+/g, '')
  blogUser.userName = blogUser.userName.substring(0, 9)
}


onMounted(() => {
  productUsername()
})


</script>

<template>

  <div class="register">
    <el-form ref="form" :model="blogUser" label-width="70px" class="register-container">
      <h1 class="title">用户注册</h1>
      <el-form-item label="昵称">
        <el-input v-model="blogUser.userNickname" placeholder="用户名限制在5-7位"></el-input>
      </el-form-item>
      <el-form-item label="账号">
        <el-input v-model="blogUser.userName" readonly></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="blogUser.userPassword" show-password placeholder="密码由8-15位的数字和字母组成"></el-input>
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
    </el-form>
    <div  style="text-align: center;margin: 10px">
      <el-row>
        <el-col :span="12">
          <el-button type="primary" round @click="doRegister" style="width: 100px;">提交</el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" round @click="goBack" style="width: 100px;">返回</el-button>
        </el-col>
      </el-row>
    </div>
  </div>

</template>

<style>

.register {
  align-items: center;
  border-radius: 10px;
  margin: 12% auto;
  width: 380px;
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