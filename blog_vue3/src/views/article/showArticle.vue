<script setup lang="ts">

import {onMounted, reactive, Ref, ref, UnwrapRef} from "vue";
import {Blog} from "../../models/blog.model.ts";
import {getCurrentInstance, toRaw} from "vue";
import {useRouter, useRoute} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {userStore} from "../../stores/user.ts";
import {likeStore} from "../../stores/like.ts";
import {
  UAnchor,
  CommentApi,
  ConfigApi,
  SubmitParamApi,
  dayjs,
  UComment,
  usePage, ReplyPageParamApi
} from 'undraw-ui'
import emoji from '../../assets/emoji.ts'
import {policy} from "../../components/upload/policy.js";
import {v4} from "uuid";
import axios from "axios";
import {pageStore} from "../../stores/page.ts";


const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const router = useRouter()
const route = useRoute()
const UserStore = userStore()
const LikeStore = likeStore()
const PageStore = pageStore()

let blogAndUser: Blog = reactive(history.state.blog);
let likes = ref(0)
let views = ref(0)
let articleNumber = ref(0)
let articleList: Ref<UnwrapRef<any[]>> = ref([])
let currentBlogId = ref(route.query.id)
let pageAll = ref(0)
let total = ref(0)
const lastId = ref(0)
const cut = ref(0)
const oss = reactive({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})

//***********************************************
const config = reactive<ConfigApi>({
  user: {
    id: UserStore.user?.userId,
    username: UserStore.user?.userNickname,
    avatar: UserStore.user?.userProfilePhoto,
    likeIds: LikeStore.commentLike
  },
  emoji: emoji,
  comments: [],
  total: 0
})

config.comments = []

// 提交评论事件
const submit = ({content, parentId, files, finish}: SubmitParamApi) => {

  if (cut.value > 0) {
    ElMessage.warning("请勿重复提交")
    return;
  }

  cut.value++

  console.log('提交评论: ' + content, parentId, files)
  console.log("have toRaw(files) --->", toRaw(files))
  /**
   * 上传文件后端返回图片访问地址，格式以'||'为分割; 如:  '/static/img/program.gif||/static/img/normal.webp'
   */
  if (files.length !== 0) {
    let file = toRaw(files)
    uploadImg(content, parentId, file[0], finish)
    file.slice(0)
    return
  }

  console.log("no toRaw(files) --->", toRaw(files))

  // let contentImg = files?.map(e => createObjectURL(e)).join('||')
  toFinishCommentUpload(content, parentId, finish)

}


// 点赞按钮事件 将评论id返回后端判断是否点赞，然后在处理点赞状态
const like = (id: string, finish: () => void) => {
  console.log('点赞: ', id)
  console.log("LikeStore.commentLike before ===> ", LikeStore.commentLike)
  if (LikeStore.commentLike.indexOf(Number(id)) !== -1) {
    ElMessage.warning("已经点赞该评论")
    return
  }


  $http({
    url: $http.adornUrl(`blog/comments/addLike`),
    method: "put",
    data: $http.adornData({commentId: id, userId: UserStore.user?.userId}, false, 'json')
  }).then(({data}: { data: any }) => {
    if (data.data === 2) {
      ElMessage.success("点赞成功")
      setTimeout(() => {
        finish()
        console.log("LikeStore.commentLike end ===> ", LikeStore.commentLike)
      }, 200)
    } else {
      ElMessage.error("未知错误")
    }
  })
}


//回复分页
const replyPage = ({parentId, pageNum, pageSize, finish}: ReplyPageParamApi) => {

  $http({
    url: $http.adornUrl(`blog/comments/page/${parentId}`),
    method: "get",
  }).then(({data}: { data: any }) => {
    console.log("getPage ==> ", data.data)
    let tmp = {
      total: data.data.total,
      list: usePage(pageNum, pageSize, data.data.list)
    }
    setTimeout(() => {
      finish(tmp)
    }, 200)
  })

}

//*********************************************************


let commentUrl = ref('')

const toFinishCommentUpload = (content: any, parentId: any, finish: any) => {
  lastId.value += 1

  const comment: CommentApi = {
    id: String(lastId.value),
    parentId: parentId,
    uid: config.user.id,
    address: '',
    content: content,
    likes: 0,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    contentImg: commentUrl.value,
    user: {
      username: config.user.username,
      avatar: config.user.avatar,
      level: UserStore.user?.userLevel,
      homeLink: ``
    },
    reply: null
  }

  addComment(comment, finish)
}

const getPolicy = () => {
  return new Promise((resolve, reject) => {
    policy(UserStore.user?.userName).then(response => {
      oss.policy = response.data.policy;
      oss.signature = response.data.signature;
      oss.ossaccessKeyId = response.data.accessid;
      oss.key = response.data.dir + `${UserStore.user?.userName}:` + v4();
      oss.dir = response.data.dir;
      oss.host = response.data.host;
      resolve(true)
    }).catch((err: any) => {
      reject(false)
    })
  })
}

const uploadImg = (content: any, parentId: any, file: any, finish: any) => {
  getPolicy().then(() => {
    let filename = file.name
    let index = filename.lastIndexOf('.')
    let suffix = filename.substring(index + 1, filename.length)
    let formData = new FormData()
    formData.append('policy', oss.policy)
    formData.append('signature', oss.signature)
    formData.append('key', `${oss.key}.${suffix}`)
    formData.append('ossaccessKeyId', oss.ossaccessKeyId)
    formData.append('dir', oss.dir)
    formData.append('host', oss.host)
    formData.append('file', file);
    let headers = {
      "Content-Type": "multipart/form-data",
    }
    axios.post("https://lrh-blog-project.oss-cn-beijing.aliyuncs.com", formData, headers as any).then((response: any) => {
      commentUrl.value = `https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/${oss.key}.${suffix}`
      toFinishCommentUpload(content, parentId, finish)
    }).catch((error) => {
      console.log(error)
      ElMessage.success("请求错误")
    })
  }).catch((error) => {
    console.log(error)
    ElMessage.success("未知错误")
  })
}

const addComment = (comment: any, finish: any) => {
  $http({
    url: $http.adornUrl(`blog/comments/add/${blogAndUser.articleId}`),
    method: "post",
    data: $http.adornData(comment, false, 'json')
  }).then(({data}: any) => {
    if (data.data) {
      setTimeout(() => {
        finish(comment)
        console.log("config.comments ==> " + config.comments)
        commentUrl.value = '';
        cut.value = 0
      }, 200)
      ElMessage.success("发表成功")
    }
  })
}

const getLastCommentId = () => {
  $http({
    url: $http.adornUrl(`blog/comments/lastId`),
    method: "get",
  }).then(({data}: any) => {
    lastId.value = data.data
    console.log("lastId ==> ", lastId.value)
  })
}

const seeCenter = (userId: any) => {
  ElMessageBox.confirm(`是否查看${blogAndUser.blogUsers.userName}的个人中心`, "提示", {}).then(() => {
    router.push({path: `/home/personCenter/${userId}`})
  }).catch(() => {
    ElMessage.success("取消成功")
  })
}

const getUserDetail = () => {
  $http({
    url: $http.adornUrl(`blog/articles/getUserDetail/${blogAndUser.blogUsers.userId}`),
    method: "get",
  }).then(({data}: any) => {
    likes.value = data.data.like
    views.value = data.data.views
    articleNumber.value = data.data.articleNumber
    articleList.value = data.data.articleList as any
    (document.getElementById('article-content') as any).innerHTML = blogAndUser.articleContent
  })

}

const articleDetail = (blog: any) => {
  blog = toRaw(blog)
  blog.blogUsers = toRaw(blogAndUser.blogUsers)
  router.replace({path: '/home/content/showArticle', query: {id: blog.articleId}, state: {blog}})
}

let color = ref('')


const getUserLikeComments = () => {
  $http({
    url: $http.adornUrl(`blog/comment-like/getCommentList/${UserStore.user?.userId}`),
    method: "get",
  }).then(({data}: { data: any }) => {
    LikeStore.commentLike = data.data
    config.user.likeIds = data.data
    console.log("commentLike ==> ", LikeStore.commentLike)
    console.log("getUserLikeComments config.user.likeIds ==> ", config.user.likeIds)
  })
}

const updateLike = () => {
  $http({
    url: $http.adornUrl(`blog/articles/addLike`),
    method: "put",
    data: $http.adornData({articleId: blogAndUser.articleId, userId: UserStore.user?.userId}, false, 'json')
  }).then(({data}: { data: any }) => {
    if (data.data === 2) {
      blogAndUser.articleLikeCount++
      color.value = '#ff0000'
      ElMessage.success("点赞成功")
      LikeStore.articleLike.push(blogAndUser.articleId)
    } else {
      ElMessage.error("未知错误")
    }
  })
}

const getUserLikeArticle = () => {
  $http({
    url: $http.adornUrl(`blog/articles-like/getLikeList/${UserStore.user?.userId}`),
    method: "get",
  }).then(({data}: { data: any }) => {
    LikeStore.articleLike = data.data
    if (LikeStore.articleLike.indexOf(blogAndUser.articleId) !== -1) {
      color.value = '#ff0000'
    }
  })
}

const toLike = () => {
  if (LikeStore.articleLike.indexOf(blogAndUser.articleId) !== -1) {
    ElMessage.warning("你已经点赞过该文章了")
  } else {
    updateLike()
  }
}


const upDateView = () => {
  $http({
    url: $http.adornUrl(`blog/articles/addView/${blogAndUser.articleId}`),
    method: "post",
  }).then(({data}: { data: any }) => {
    console.log(data.data)
  })
}

const getComments = () => {
  $http({
    url: $http.adornUrl(`blog/comments/getAllComments/${blogAndUser.articleId}/${PageStore.commentPage}`),
    method: "get",
  }).then(({data}: { data: any }) => {
    console.log("getComments data ===>", data.data)
    if (data.data === null) {
      config.comments = []
      return
    }
    config.comments = data.data.comments
    pageAll.value = data.data.pageAll
    total.value = data.data.total
  })
}

const handleCommentCurrentChange = (val: number) => {
  PageStore.commentPage = val
  getComments()
}

const comment = ref(false)


onMounted(() => {
  getUserDetail();
  upDateView()
  getComments()
  getUserLikeArticle()
  getLastCommentId()
  getUserLikeComments()
})

</script>

<template>
  <div class="padding" style="height: 10%"></div>
  <div class="article">
    <div class="user-left">
      <div class="user-card">
        <font-awesome-icon :icon="['fas', 'user']" style="position: relative;margin-right: auto "/>
        <img class="user-image" :src="blogAndUser.blogUsers.userProfilePhoto" alt="User Image"
             @click="seeCenter(blogAndUser.blogUsers.userId)">
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

      <div class="blog-card" v-for="article  in (articleList as Blog[]).slice(0,5)" :key="article.articleId"
           @click="articleDetail(article)"
           v-show="parseInt(String(article.articleId)) !== parseInt(<string>currentBlogId)">
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
      <div class="content-article-show-nice">
        <div style="padding:40px">
          <el-row>
            <el-col :span="17" id="total-article-container">
              <el-row>
                <el-col :span="24" style="text-align: left">
                  <font-awesome-icon :icon="['fas', 'eye']" style="font-size: 25px"/>
                  {{ blogAndUser.articleViews }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <font-awesome-icon :icon="['fas', 'heart']"
                                     :style="{cursor: 'pointer',fontSize: '25px',color:  color}"
                                     @click="toLike"/>
                  {{ blogAndUser.articleLikeCount }}
                </el-col>
              </el-row>
              <div class="article-listened" id="article-listened">
                <div class="article-title">
                  <h1>{{ blogAndUser.articleTitle }}</h1>
                </div>
                <div class="article-content" id="article-content">

                </div>
              </div>
            </el-col>
            <el-col :span="1" style="border-right: rgb(241,241,241) solid 2px;"></el-col>
            <el-col :span="6">
              <div class="article-catalog">
                <u-anchor container="#article-listened"
                          style="position: fixed;pointer-events: none;margin-left: 20px"
                          target=".article-content">
                </u-anchor>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <el-link class="detail-comment" @click="comment = true">查看评论</el-link>
      <el-drawer
          v-model="comment"
          title="评论详情"
          direction="rtl"
          size="45%">
        <u-comment
            style="margin-top: -20px"
            :config="config" page upload @submit="submit"
            @like="like" relative-time @reply-page="replyPage"
        >
          <!-- <div>导航栏卡槽</div> -->
          <!-- <template #header>头部卡槽</template> -->
          <!-- <template #info>用户信息卡槽</template> -->
          <!-- <template #card>用户信息卡片卡槽</template> -->
          <!-- <template #opearte>操作栏卡槽</template> -->
          <!-- <template #func>功能区域卡槽</template> -->
        </u-comment>
        <el-pagination
            v-if="pageAll > 1"
            style="margin: 30px 30px 30px 30px"
            v-model:current-page="PageStore.commentPage"
            v-model:page-count="pageAll"
            :small="false"
            background layout="prev, pager, next, jumper"
            :total="total"
            :pager-count="5"
            @current-change="handleCommentCurrentChange"
        />
      </el-drawer>

    </div>
  </div>

</template>

<style scoped>


.article-catalog {
  width: 15%;
}

.content-article-show-nice {
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.detail-comment {
  position: absolute;
  bottom: 0;
  left: 83.5%;
  transform: translate(-50%, -50%);
  color: rgb(141, 151, 156);
  z-index: 1;
  font-size: large;
  font-weight: bold;
}

.colorful {
  background: linear-gradient(to bottom, #96969b, #6c7b88, #484d52);
  -webkit-background-clip: text;
  color: transparent;
}

/* 博客文章页面容器 */
.article {
  padding-top: 40px;
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
  margin: 10px 30px 30px 40px;
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