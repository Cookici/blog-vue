<script setup lang="ts">

import {onMounted, reactive, Ref, ref, UnwrapRef} from "vue";
import {Blog} from "../../models/blog.model.ts";
import {getCurrentInstance, toRaw} from "vue";
import {useRouter, useRoute} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {userStore} from "../../stores/user.ts";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const router = useRouter()
const route = useRoute()
const UserStore = userStore()

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

let color = ref('')

const toLike = () => {
  ElMessageBox.confirm("提示", "是否点赞该文章").then(() => {
    let isLike = localStorage.getItem(`isLike${blogAndUser.articleId}`)
    if (isLike !== `${UserStore.user?.userId}${blogAndUser.articleId}`) {
      updateLike()
      return
    }
    ElMessage.warning("你已经点过赞了")
  }).catch(() => {
    ElMessage.success("取消成功")
  })

}

const updateLike = () => {
  $http({
    url: `/article/blog/articles/addLike/${blogAndUser.articleId}`,
    method: "post",
  }).then(({data}: { data: any }) => {
    if (data.data === 1) {
      blogAndUser.articleLikeCount++
      localStorage.setItem(`isLike${blogAndUser.articleId}`, `${UserStore.user?.userId}${blogAndUser.articleId}`)
      color.value = '#ff0000'
      ElMessage.success("点赞成功")
    }else{
      ElMessage.error("未知错误")
    }
  })
}

const judgeLike = () => {
  let isLike = localStorage.getItem(`isLike${blogAndUser.articleId}`)
  if (isLike !== `${UserStore.user?.userId}${blogAndUser.articleId}`) {
    color.value = ''
  } else {
    color.value = '#ff0000'
  }
}

onMounted(() => {
  getUserDetail();
  judgeLike()
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
          {{ article.articleContent.replace(/<[^>]+>/g, '').substring(0, 20) }}...
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

      <el-link style="color: #656e70" v-if="articleList.length>4">查看所有文章</el-link>

    </div>


    <div class="article-right">
      <div class="article-title">
        <div>
          <el-row>
            <el-col :span="8"></el-col>
            <el-col :span="8"></el-col>
            <el-col :span="8" style="text-align: right">
              <font-awesome-icon :icon="['fas', 'eye']" style="font-size: 25px"/>
              {{ blogAndUser.articleViews }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <font-awesome-icon :icon="['fas', 'heart']" :style="{cursor: 'pointer',fontSize: '25px',color: color}"
                                 @click="toLike"/>
              {{ blogAndUser.articleLikeCount }}
            </el-col>
          </el-row>
        </div>
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

.user-image:hover {
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