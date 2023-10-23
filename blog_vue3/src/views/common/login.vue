<script>
import axios from "axios";

export default {

  name: 'Login',

  data() {
    return {
      form: {
        username: '',
        password: '',
        userKey: '',
        code: '',
      },
      captcherImg: ''

    }
  },


  methods: {

    login() {
      let formData = new FormData();
      for (let key in this.form) {
        formData.append(key, this.form[key]);
      }
      axios.post('/api/login', formData).then(response => {
        let getToken = response.headers['authorization']
        if (getToken !== undefined && getToken !== null) {
          this.$store.commit('identify/SET_TOKEN', getToken)
          this.$message.info("登录成功")
          this.$router.push({path: '/home'})
        }
      })
    },

    changeCode() {
      this.getCode()
    },

    getCode() {
      this.$http({
        url: this.$http.adornUrl('/blog/identify/captcha'),
        method: "get",
      }).then(({data}) => {
        this.form.userKey = data.data.userKey
        this.captcherImg = data.data.captcherImg
      })
    }


  },

  mounted() {
    this.getCode()
  },

  computed: {}


}

</script>

<template>


  <el-form
      :label-position="'left'"
      label-width="100px"
      style="max-width: 460px"
  >
    <el-form-item label="username" name="username">
      <el-input v-model="form.username"/>
    </el-form-item>
    <el-form-item label="password" name="password">
      <el-input v-model="form.password"/>
    </el-form-item>
    <el-form-item label="code" name="code">
      <el-input v-model="form.code"/>
    </el-form-item>
    <img :src="this.captcherImg" @click="changeCode" alt="显示错误">
    <el-form-item>
      <el-button type="primary" round @click="login">登录</el-button>
    </el-form-item>
  </el-form>


</template>

<style scoped>

</style>