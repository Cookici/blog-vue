<script setup lang="ts">
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {getCurrentInstance, onMounted, Ref, ref, toRaw} from "vue";
import {useRouter} from "vue-router";
import {Blog} from "../../models/blog.model.ts";
import {pageStore} from "../../stores/page.ts";
import {ElMessage} from "element-plus";
import {Delete, Search} from "@element-plus/icons-vue";
import {SortModel} from "../../models/sort.model.ts";

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const router = useRouter()
const PageStore = pageStore()

let total = ref(0)
let pageAll = ref(0)
let blogsAndItsUser: Ref<Blog[]> = ref([])
const sortList = ref([])
const hotList = ref([])

const handleCurrentChange = (val: number) => {
  PageStore.page = val
  if (PageStore.sortId === 0) {
    getPage("original")
    return
  }
  getPage(PageStore.sortId)
}

const articleDetail = (blog: any) => {
  blog = toRaw(blog)
  router.push({path: '/home/content/showArticle', query: {id: blog.articleId}, state: {blog}})
}


const getPage = (sortId: any) => {
  $http({
    url: $http.adornUrl(`blog/articles/getAll/${sortId}/${PageStore.page}?item=${PageStore.keyword}`),
    method: "get",
  }).then(({data}: { data: any }) => {
    console.log(data.data)
    blogsAndItsUser.value = data.data.data
    total.value = data.data.total
    pageAll.value = data.data.pageAll
  })

}


const getSortList = () => {
  $http({
    url: $http.adornUrl(`blog/sorts/getSortMenu`),
    method: "get",
  }).then(({data}: { data: any }) => {
    sortList.value = data.data
    console.log("sortList ==> ", sortList)
  })
}


const clearSelect = () => {
  PageStore.value = ''
  PageStore.sortId = 0
  getPage("original")
}

const changeSelect = (value: any) => {
  PageStore.sortId = value;
  getPage(PageStore.sortId)
}


const changeHandler = (value: any) => {
  PageStore.value = value
  ElMessage.success(`你正在查看${PageStore.value}相关的文章`)
}

const getHotArticle = () => {
  $http({
    url: $http.adornUrl(`blog/articles/hotArticle`),
    method: 'get'
  }).then(({data} : any) => {
    hotList.value = data.data
    console.log("hotList", hotList.value)
  })
}

const search = () => {
  getPage(PageStore.sortId)
}

const deleteKeyword = () =>{
  PageStore.keyword = ''
  getPage(PageStore.sortId)
}

onMounted(() => {
  PageStore.keyword = ''
  getPage(PageStore.sortId === 0 ? "original" : PageStore.sortId)
  getSortList()
  getHotArticle()
})

</script>

<template style="height: 100%">

  <div class="padding-class" style="height: 10%"></div>
  <div class="home-content">
    <div style="width: 100%;text-align: center;padding-top: 20px">
      <el-input
          v-model="PageStore.keyword"
          placeholder="请输入你要搜索的文章"
          :prefix-icon="Search"
          style="width: 70%;text-align: left">
      </el-input>
      <el-button
          type="primary"
          @click="search"
          style="width: 75px;margin: 10px 10px 10px 15px;"
      >
        <el-icon style="margin-right:3px">
          <Search/>
        </el-icon>
        搜索
      </el-button>
      <el-button
          type="primary"
          @click="deleteKeyword"
          style="width: 75px;margin: 10px"
      >
        <el-icon style="margin-right:3px">
          <Delete/>
        </el-icon>
        清空
      </el-button>
    </div>
    <el-row>
      <el-col :span="16">
        <div class="left-content-article">
          <div class="blog-post" v-for="blog in blogsAndItsUser" :key="blog.articleId" @click="articleDetail(blog)">
            <div class="author-info">
              <img class="author-avatar" :src="blog.blogUsers.userProfilePhoto" alt="Author Avatar">
              <div>
                <span class="author-username">{{ blog.blogUsers.userNickname }}</span><br>
                <span style="font-weight: 100;color: #96969b"> {{ blog.blogUsers.userName }}</span><br>
                <span class="user-level colorful">level: {{ blog.blogUsers.userLevel }}</span>
              </div>
              <div class="article-label" style="margin-left: 50px">
                <font-awesome-icon :icon=blog.blogLabels.labelAlias />&nbsp;{{ blog.blogLabels.labelName }}
              </div>
              <div class="article-sort-label" style="margin-left: 50px">
                <font-awesome-icon :icon="['far', 'bookmark']"/>&nbsp;{{ blog.blogSorts.sortAlias }}
              </div>
              <div class="post-time">
                <font-awesome-icon :icon="['far', 'calendar']" />
                {{ blog.articleDate.replace(new RegExp('T'), " ") }}
              </div>
            </div>
            <h2 class="article-title">{{ blog.articleTitle }}</h2>
            <p class="article-content">{{
                blog.articleContent.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;|&amp;nbsp;/g, '').substring(0, 50)
              }}...</p>
            <div class="article-stats">
          <span>
            <font-awesome-icon :icon="['fas', 'eye']"/>&nbsp;{{ blog.articleViews }}
          </span>
              <span>
            <font-awesome-icon :icon="['fas', 'heart']" style="color: #fd2008;"/>&nbsp;{{ blog.articleLikeCount }}
          </span>
            </div>
          </div>
        </div>

        <div class="demo-pagination-block">
          <el-pagination
              v-if="pageAll > 1"
              style="margin: 30px 30px 30px 40px;justify-content: center;"
              v-model:current-page="PageStore.page"
              v-model:page-count="pageAll"
              :small="false"
              background layout="prev, pager, next, jumper"
              :total="total"
              :pager-count="5"
              @current-change="handleCurrentChange"
          />
        </div>
      </el-col>


      <el-col :span="8">
        <div class="right-content-container">
          <div class="article-sorts">
            <div class="sorts-introduce">
              <span style="font-weight: bolder;font-size: larger;color: #acbfd7">文章种类</span>
            </div>
            <el-select class="sorts-select" v-model="PageStore.value"
                       placeholder="选择种类" placement="bottom"
                       @change="changeHandler"
            >
              <el-option-group
                  v-for="sort in (sortList as SortModel[])"
                  :key="sort.sortId"
                  :label="sort.sortName"
              >
                <el-option
                    v-for="item in (sort.children as any)"
                    :key="item.sortId"
                    :label="item.sortName"
                    :value="item.sortName"
                    @click="changeSelect(item.sortId)"
                />
              </el-option-group>
            </el-select>
            <div>
              <el-button type="primary" @click="clearSelect" style="width: 90%">还原</el-button>
            </div>
          </div>
          <div class="hot-article">
            <div class="sorts-introduce">
              <span class="sort-title">热门文章Top5</span>
            </div>
            <div class="blog-post" style="justify-items:center;text-align: center;width: 70%" v-for="blog in (hotList as Blog[])"
                 :key="blog.articleId" @click="articleDetail(blog)">
              <div class="author-info">
                <img class="author-avatar" :src="blog.blogUsers.userProfilePhoto" alt="Author Avatar">
                <div>
                  <span class="author-username">{{ blog.blogUsers.userNickname }}</span><br>
                  <span style="font-weight: 100;color: #96969b"> {{ blog.blogUsers.userName }}</span><br>
                  <span class="user-level colorful">level: {{ blog.blogUsers.userLevel }}</span>
                </div>
                <div class="post-time">
                  <font-awesome-icon :icon="['far', 'calendar']" />
                  {{ blog.articleDate.replace(new RegExp('T'), " ") }}
                </div>
              </div>
              <h2 class="article-title">{{ blog.articleTitle }}</h2>
              <p class="article-content">{{ blog.articleContent.replace(/<[^>]+>/g, '').substring(0, 50) }}...</p>
              <div class="article-stats">
          <span>
            <font-awesome-icon :icon="['fas', 'eye']"/>&nbsp;{{ blog.articleViews }}
          </span>
                <span>
            <font-awesome-icon :icon="['fas', 'heart']" style="color: #fd2008;"/>&nbsp;{{ blog.articleLikeCount }}
          </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>

</template>

<style scoped>

.right-content-container {
  min-height: 95%;
  max-height: 95%;
  display: flex;
  flex-direction: column;
}

.sort-title {
  font-weight: bolder;
  font-size: larger;
  color: #acbfd7
}

.hot-article {
  height: 590px;
  width: 90%;
  margin: 30px 30px 30px 5px;
  background-color: white;
  text-align: center;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.sorts-select {
  height: 75%;
  width: 90%;
  margin-top: 10px;
}


.sorts-introduce {
  height: 10%;
  width: 100%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.article-sorts {
  margin: 30px 30px 30px 5px;
  width: 90%;
  height: 480px;
  background-color: white;
  text-align: center;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.colorful {
  background: linear-gradient(to bottom, #96969b, #6c7b88, #484d52);
  -webkit-background-clip: text;
  color: transparent;
}

.demo-pagination-block {
  width: 100%;
}

.home-content {
  min-height: 100%;
  height: auto;
  width: 100%;
}

.left-content-article {
  min-height: 80%;
  height: auto;
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

.article-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>