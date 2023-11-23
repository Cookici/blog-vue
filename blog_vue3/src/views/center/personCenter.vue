<script setup lang="ts">
import {getCurrentInstance, onMounted, reactive, Ref, ref, toRaw, UnwrapNestedRefs, UnwrapRef} from "vue";
import {activeIndexStore} from "../../stores/activeIndex.ts"
import {useRoute, useRouter} from "vue-router";
import {Blog} from "../../models/blog.model.ts";
import {userStore} from "../../stores/user.ts";
import {ElMessage, ElMessageBox} from "element-plus";

const route = useRoute()
const router = useRouter()
const ActiveIndexStore = activeIndexStore()
const userId = ref(route.params.userId)
const UserStore = userStore()
const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
let user: UnwrapNestedRefs<{}> = reactive({})
const likes = ref(0)
const views = ref(0)
let articleNumber = ref(0)
let articleList: Ref<UnwrapRef<any[]>> = ref([])
const friendList = ref([])
const friendListSize = ref(0)
const groupList = ref([])
const groupListSize = ref(0)

const getUserDetail = () => {

  $http({
    url: $http.adornUrl(`blog/articles/getUserDetail/${userId.value}`),
    method: 'get',
  }).then(({data}: any) => {
    console.log("data ===> ", data.data)
    articleList.value = data.data.articleList
    articleNumber.value = data.data.articleNumber
    user = data.data.user
    views.value = data.data.views
    likes.value = data.data.like
  })

}

const getFriends = () => {
  $http({
    url: $http.adornUrl(`blog/chat/friendList/${userId.value}`),
    method: 'get'
  }).then(({data}: any) => {
    if (data.data !== undefined) {
      friendList.value = data.data
      friendListSize.value = friendList.value.length
    }
  })
}

const articleDetail = (blog: any) => {
  blog = toRaw(blog)
  router.push({path: '/home/content/showArticle', query: {id: blog.articleId}, state: {blog}})
}

const getAllGroup = () => {
  $http({
    url: $http.adornUrl(`blog/group/getGroups/${userId.value}`),
    method: 'get'
  }).then(({data}: any) => {
    console.log(data.data)
    groupList.value = data.data.groups
    groupListSize.value = data.data.groupsSize
  })
}


const deleteArticle = (article: any) => {
  console.log("article ==> ", article)
  ElMessageBox.confirm("是否删除", "提示", {}).then(() => {
    $http({
      url: $http.adornUrl(`blog/articles/delete/${article.articleId}/${UserStore.user?.userName}`),
      method: 'delete'
    }).then(({data}: any) => {
      if (data.data === true) {
        ElMessage.success("删除成功")
        setTimeout(() => {
          window.location.reload()
        }, 200)
      }
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })

}

const updateArticle = (article: any) => {
  console.log("article ==> ", article)
  ElMessageBox.confirm("是否修改", "提示", {}).then(() => {
    let articleJSON = JSON.stringify(article);
    router.push({path: '/home/subArticle', state: {articleJSON}})
  }).catch(() => {
    ElMessage.success("取消成功")
  })

}


const deleteFriend = (friend: any) => {
  console.log("friend ==> ", friend)
  ElMessageBox.confirm("是否删除", "提示", {}).then(() => {
    $http({
      url: $http.adornUrl(`blog/chat/delete/${UserStore.user?.userName}`),
      method: 'delete',
      data: $http.adornData({userId: userId.value, friendId: friend.userId})
    }).then(({data}: any) => {
      if (data.data === 2) {
        ElMessage.success("删除成功")
        setTimeout(() => {
          window.location.reload()
        }, 200)
      }
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })

}

const deleteGroup = (group: any) => {
  console.log("group ==> ", group.blogGroup.groupId)
  ElMessageBox.confirm("是否解散", "提示", {}).then(() => {
    $http({
      url: $http.adornUrl(`blog/group/deleteGroup/${group.blogGroup.groupId}/${UserStore.user?.userName}`),
      method: 'delete',
    }).then(({data}: any) => {
      ElMessage.success("删除成功")
      setTimeout(() => {
        window.location.reload()
      }, 200)
    })
  }).catch(() => {
    ElMessage.success("取消删除")
  })
}


const computedAvatar = (avatarList: any) => {
  if (avatarList.length > 4) {
    return "avatarItem--3"
  } else if (avatarList.length > 1) {
    return "avatarItem--2"
  } else {
    return "avatarItem--1"
  }
}

onMounted(() => {
  ActiveIndexStore.activeIndex = '/home/personCenter'
  getUserDetail()
  getFriends()
  getAllGroup()
})

</script>

<template>
  <div class="padding" style="height: 10%"></div>
  <div class="personCenter-container">
    <el-container style="width: 100%;min-height: 100%;
    height: auto;margin: auto;  text-align: center;">
      <el-header style="height:auto;width:100%;">
        <div class="user-message-container">
          <div class="user-card">
            <font-awesome-icon :icon="['fas', 'user']" style="position: relative;margin-right: auto "/>
            <img class="user-image" :src="user.userProfilePhoto" alt="User Image">
            <div class="user-info">
              <div class="user-details">
                <h3>昵称：{{ user.userNickname }}</h3>
                <p style="font-weight: 100;color: #96969b">{{ user.userName }}</p>
                <p class="colorful">level：{{ user.userLevel }}</p>
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
        </div>
      </el-header>
      <el-main style="min-height: 100%;height: auto;">
        <div class="all-message-container">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="blog-post" style="justify-items:center;text-align: center;width: 70%"
                   v-for="blog in (articleList as Blog[])"
                   :key="blog.articleId">
                <div class="author-info" @click="articleDetail(blog)">
                  <img class="author-avatar" :src="blog.blogUsers.userProfilePhoto" alt="Author Avatar">
                  <div>
                    <span class="author-username">{{ blog.blogUsers.userNickname }}</span><br>
                    <span style="font-weight: 100;color: #96969b"> {{ blog.blogUsers.userName }}</span><br>
                    <span class="user-level colorful">level: {{ blog.blogUsers.userLevel }}</span>
                  </div>
                  <div class="post-time">
                    <font-awesome-icon :icon="['far', 'calendar']"/>
                    {{ blog.articleDate.replace(new RegExp('T'), " ") }}
                  </div>
                </div>
                <h2 class="article-title">{{ blog.articleTitle }}</h2>
                <p class="article-content">{{ blog.articleContent.replace(/<[^>]+>/g, '').substring(0, 50) }}...</p>
                <div class="article-stats-info">
          <span>
            <font-awesome-icon :icon="['fas', 'eye']"/>&nbsp;{{ blog.articleViews }}
          </span>
                  <el-button type="danger" v-if="Number(UserStore.user?.userId) === Number(userId)"
                             @click="deleteArticle(blog)">删除
                  </el-button>
                  <el-button type="warning" v-if="Number(UserStore.user?.userId) === Number(userId)"
                             @click="updateArticle(blog)">修改
                  </el-button>
                  <span>
            <font-awesome-icon :icon="['fas', 'heart']" style="color: #fd2008;"/>&nbsp;{{ blog.articleLikeCount }}
          </span>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="blog-post" style="justify-items:center;text-align: center;width: 70%"
                   v-for="friend in friendList" :key="friend.id">
                <div class="author-info">
                  <img class="author-avatar" :src="friend.userProfilePhoto" alt="Author Avatar">
                  <div>
                    <span class="author-username">{{ friend.userNickname }}</span><br>
                    <span style="font-weight: 100;color: #96969b"> {{ friend.userName }}</span><br>
                    <span class="user-level colorful">level: {{ friend.userLevel }}</span>
                  </div>
                  <el-button style="margin: auto" type="danger"
                             v-if="Number(UserStore.user?.userId) === Number(userId)"
                             @click="deleteFriend(friend)"
                  >删除
                  </el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="blog-post" style="justify-items:center;text-align: center;width: 75%"
                   v-for="group in groupList" :key="group.blogGroup.groupId"
              >
                <div class="author-info" style="justify-content: space-between">
                  <div class="avatar" style="width: 100px;height: 100px">
                    <template v-for="(photo,index) in group.photosUrl">
                      <el-image :src="photo.photoUrl"
                                :key="index" :class="computedAvatar(group.photosUrl)" v-if="index<9"></el-image>
                    </template>
                  </div>
                  <div>
                    <span>群聊号：{{ group.blogGroup.groupId }}</span><br>
                    <span style="font-weight: 100;color: #96969b">群聊名称：{{ group.blogGroup.groupName }}</span>
                  </div>
                </div>
                <div>
                  <el-button type="danger" style="margin-top:15px "
                             v-if="Number(UserStore.user?.userId) === Number(userId)"
                             @click="deleteGroup(group)"
                  >解散
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>


<style scoped>

.personCenter-container {
  margin-top: 10px;
  width: 100%;
  height: 100%;
}

.user-message-container {
  text-align: center;
  justify-content: center;
  justify-items: center;
  align-items: center;
}

.user-card {
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  margin: 10px;
  padding: 15px;
  width: auto;
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

.blog-post {
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  margin: 30px 10px 30px 40px;
  width: 85%;
  cursor: pointer;
}

.author-info {
  display: flex;
  align-items: center;
  /* Other styles for author-info */
  text-align: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.blog-post:hover {
  box-shadow: 2px 2px 30px rgba(4, 15, 29, 0.1);
  transform: scale(1.01);
  transition: all ease 0.1s;
}

.post-time {
  font-size: 14px; /* 设置时间元素的字体大小 */
  color: #555;
  margin-left: auto; /* 将时间元素推到右侧 */
}

.article-title {
  font-size: 20px;
  margin: 10px 0;
}

.article-content {
  font-size: 14px;
}

.article-stats-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.avatarItem--1 {
  all: initial;
  width: 98%;
  height: 98%;
}

.avatarItem--2 {
  all: initial;
  width: 47%;
  height: 47%;
  margin: 1%;
}

.avatarItem--3 {
  all: initial;
  width: 32%;
  height: 30%;
  margin: 1%;
}

.avatar {
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap-reverse;
  border: rgb(187, 176, 176) 1px solid;
}

</style>