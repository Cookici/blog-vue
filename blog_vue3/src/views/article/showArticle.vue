<script setup lang="ts">

import {onMounted, reactive, Ref, ref, UnwrapRef} from "vue";
import {Blog} from "../../models/blog.model.ts";
import {getCurrentInstance, toRaw} from "vue";
import {useRouter, useRoute} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const router = useRouter()
const route = useRoute()

let blogAndUser: Blog = reactive(history.state.blog);
let likes = ref(0)
let views = ref(0)
let articleNumber = ref(0)
let articleList: Ref<UnwrapRef<any[]>> = ref([])
let currentBlogId = ref(route.query.id)

const addFriend = () => {
  ElMessageBox.confirm(`是否添加${blogAndUser.blogUsers.userName}为好友`, "提示", {}).then(() => {
    ElMessage.success("添加成功")
  }).catch(() => {
    ElMessage.success("取消成功")
  })
}

const getUserDetail = () => {
  $http({
    url: `/article/blog/articles/getUserDetail/${blogAndUser.blogUsers.userId}`,
    method: "get",
  }).then(({data}: { data: any }) => {
    likes.value = data.data.like
    views.value = data.data.views
    articleNumber.value = data.data.articleNumber
    articleList.value = data.data.articleList
    document.getElementById('article-content').innerHTML = blogAndUser.articleContent
  })

}

const articleDetail = (blog: Blog) => {
  blog = toRaw(blog)
  blog.blogUsers = toRaw(blogAndUser.blogUsers)
  router.replace({path: '/home/content/showArticle', query: {id: blog.articleId}, state: {blog}})
}

onMounted(() => {
  getUserDetail();
})

</script>

<template>

  <div class="article">

    <div class="user-left">
      <div class="user-card">
          <font-awesome-icon :icon="['fas', 'user']" style="position: relative;margin-right: auto "/>
        <img class="user-image" :src="blogAndUser.blogUsers.userProfilePhoto" alt="User Image" @click="addFriend">
        <div class="user-info">
          <div class="user-details">
            <h3>昵称：{{ blogAndUser.blogUsers.userNickname }}</h3>
            <p style="font-weight: 100;color: #96969b">{{ blogAndUser.blogUsers.userName }}</p>
            <p class="colorful">level：{{ blogAndUser.blogUsers.userLevel }}</p>
          </div>
        </div>
        <div class="user-stats">
          <div class="article-stats">
            <p>文章总数</p>
            <p>
              <font-awesome-icon :icon="['far', 'newspaper']"/>
              {{ articleNumber }}
            </p>
          </div>
          <div class="view-stats">
            <p>总浏览量</p>
            <p>
              <font-awesome-icon :icon="['fas', 'eye']"/>
              {{ views }}
            </p>
          </div>
          <div class="likes-stats">
            <p>总获赞量</p>
            <p>
              <font-awesome-icon :icon="['fas', 'heart']" style="color: #ff0000;"/>
              {{ likes }}
            </p>
          </div>
        </div>
      </div>

      <h2 style="color: #718da6">他其他的文章</h2>

      <div class="blog-card" v-for="article  in articleList.slice(0,5)" :key="article.articleId"
           @click="articleDetail(article)" v-show="parseInt(article.articleId) !== parseInt(<string>currentBlogId)">
        <div class="blog-name">
          {{ article.articleTitle }}
        </div>
        <div class="blog-content">
          {{ article.articleContent.substring(0, 20) }}...
        </div>
        <div class="view-like-stats">
          <div class="data-time">
            <font-awesome-icon :icon="['far', 'calendar']"/>
            {{ article.articleDate.substring(0, 10) }}
          </div>
          <div class="views">
            <font-awesome-icon :icon="['fas', 'eye']"/>
            {{ article.articleViews }}
          </div>
          <div class="likes">
            <font-awesome-icon :icon="['fas', 'heart']" style="color: #ff0000;"/>
            {{ article.articleLikeCount }}
          </div>
        </div>
      </div>

      <el-link style="color: #656e70">查看所有文章</el-link>

    </div>


    <div class="article-right">
      <div class="article-title">
        <h1>{{ blogAndUser.articleTitle }}</h1>

      </div>
      <div class="article-content" id="article-content">

      </div>
    </div>

  </div>

</template>

<style scoped>

.colorful {
  background: linear-gradient(to bottom, #96969b, #6c7b88, #484d52);
  -webkit-background-clip: text;
  color: transparent;
}

/* 博客文章页面容器 */
.article {
  padding-top: 8%;
  height: auto;
  display: flex;
  overflow: auto;
}

/* 左半部分（用户信息） */
.user-left {
  width: 25%;
  padding: 10px;
  height: auto;
  background-color: #f1f1f1;
  display: flex;
  margin-left: 5%;
  margin-right: 10px;
  margin-bottom: 60px;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  text-align: center;

}


.user-card {
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 10px;
  margin: 30px 30px 30px 40px;
  width: 80%;
}

.user-image {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  object-fit: cover;
  cursor: pointer;
}

.user-image:hover{
  box-shadow: 2px 2px 30px rgba(4, 15, 29, 0.1);
  transform: scale(1.01);
  transition: all ease 0.1s;
}

.user-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  align-items: center;
  width: 100%;
}


/* 右半部分（文章内容） */
.article-right {
  width: 75%;
  padding: 20px;
  background-color: #f1f1f1;
  margin-right: 5%;
  height: auto;
  margin-left: 10px;
  margin-bottom: 60px;
  flex-direction: column;
  word-wrap: break-word;
  word-break: normal;
}

.article-title {
  position: relative;
  left: 2px;
  text-align: center;
}

.blog-card {
  border: 1px solid #ccc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  width: 80%;
  cursor: pointer;
}

.blog-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.blog-content {
  margin-bottom: 10px;
}

.view-like-stats {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

</style>