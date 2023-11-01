<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {userStore} from "../../stores/user.ts";

const UserStore = userStore()

let keyword = ref('')
let blogPosts = ref([
      {
        id: 1,
        authorAvatar: 'https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/%E5%93%88.jpg',
        authorUsername: 'User1',
        authorAccount: 'user1_account',
        title: 'First Blog Post',
        content: 'This is the content of the first blog post.',
        views: 100,
        likes: 20,
      },
      {
        id: 2,
        authorAvatar: 'https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/%E5%93%88.jpg',
        authorUsername: 'User2',
        authorAccount: 'user2_account',
        title: 'Second Blog Post',
        content: 'This is the content of the second blog post.',
        views: 85,
        likes: 15,
      },
    ]
)

let user = UserStore.$state.user

const search = () => {
  if (keyword.value !== '') {
    console.log("search ok")
  }
}

onMounted(() => {

})


</script>

<template>

  <div class="container">

    <div class="header">
      <el-col :span="6">
        <div class="userDetail" style="display: flex">
          <img v-bind:src="user?.userProfilePhoto" alt="">
          <div style="padding-left: 20px;align-items: center">
            <span>昵称：{{ user?.userNickname }}</span><br>
            <span>账号：{{ user?.userName }}</span><br>
            <span>level：{{ user?.userLevel }}</span>
          </div>
        </div>
      </el-col>

      <el-col :span="10">
        <div style="display: flex;align-items: center;">
          <el-input
              v-model="keyword"
              placeholder="请输入你要搜索的文章"
              prefix-icon="el-icon-search"
              style="width: 60%;padding: 5px;text-align: left"
              clearable
              @clear="search"
              @keydown.enter.native="search"></el-input>
          <el-button
              type="primary"
              @click="search"
              style="width: 15%;margin: 10px"
          >
            <el-icon style="margin:5px">
              <Search/>
            </el-icon>
            搜索
          </el-button>
        </div>
      </el-col>

      <el-col :span="8" style="height: 100%">
        <div class="nav">
          <ul id="navList">
            <li class="nav-item active">博客主页</li>
            <li class="nav-item">个人中心
            </li>
            <li class="nav-item">在线聊天</li>
            <li class="nav-item">私信回复
            </li>
            <li class="nav-item">历史记录</li>
          </ul>
        </div>
      </el-col>
    </div>

    <div class="content">
      <div class="blog-post" v-for="post in blogPosts" :key="post.id">
        <div class="author-info">
          <img class="author-avatar" :src="post.authorAvatar" alt="Author Avatar">
          <div>
            <span class="author-username">{{ post.authorUsername }}</span>
            <span> ({{ post.authorAccount }})</span>
          </div>
        </div>
        <h2 class="article-title">{{ post.title }}</h2>
        <p class="article-content">{{ post.content.substring(0, 200) }}...</p>
        <div class="article-stats">
          <span>浏览量: {{ post.views }}</span>
          <span>点赞量: {{ post.likes }}</span>
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped>

.container {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.header {
  height: 10%;
  width: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  border-radius: 30%;
}

.userDetail img {
  padding-left: 30px;
  object-fit: fill;
  width: 70px;
  height: 70px;
  border-radius: 100%;
}

.content {
  height: 90%;
  width: 100%;
  background: #eaeaea;
}


/* 导航条 */
.nav {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;

}

.nav ul {
  margin: 0;
  padding: 0;
  display: flex;
  height: 100%;
}

/* 导航链接 */
.nav li {
  cursor: pointer;
  color: black;
  font-size: 16px;
  flex: 1;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 鼠标进入时下半部分的1/4变成蓝色 */
.nav li:hover::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10%;
  /* 将下半部分的1/5设为蓝色区域 */
  background-color: rgb(54, 46, 151);
  /* 设置蓝色 */
}

/* 点击后，被点击的<li>元素下半部分的1/5常亮为橙色 */
.nav li.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10%;
  /* 将下半部分的1/5设为橙色区域 */
  background-color: rgb(251, 131, 86);
  /* 设置橙色 */
}

.content {
  padding-top: 10px;
}

.blog-post {
  border: 1px solid #ccc;
  margin: 10px;
  padding: 10px;
  width: 60%;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.author-username {
  font-weight: bold;
}

.article-title {
  font-size: 20px;
  margin: 10px 0;
}

.article-content {
  font-size: 14px;
}

.article-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

</style>