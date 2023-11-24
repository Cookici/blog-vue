<script setup lang="ts">
import {getCurrentInstance, onMounted, reactive, Ref, ref, UnwrapRef} from "vue";
import {activeIndexStore} from "../../stores/activeIndex.ts"
import {useRoute} from "vue-router";
import {User} from "../../models/user.model.ts";

const route = useRoute()
const ActiveIndexStore = activeIndexStore()
const userId = ref(route.params.userId)
const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
let user : User = reactive({})
let likes = ref(0)
let views = ref(0)
let articleNumber = ref(0)
let articleList: Ref<UnwrapRef<any[]>> = ref([])

const getUserDetail = () => {

  $http({
    url: $http.adornUrl(`blog/identify/getById?id=${userId.value}`),
    method: 'get',
    data: $http.adornParams({}, false)
  }).then(({data}: any) => {
    user = data.data
    console.log("user ==> ",user)
    $http({
      url: $http.adornUrl(`blog/articles/getUserDetail/${userId.value}`),
      method: 'get'
    }).then(({data}: any) => {
      articleList.value = data.data.articleList
      articleNumber.value = data.data.articleNumber
      views.value = data.data.views
      likes.value = data.data.like
    })
  })
}


onMounted(() => {
  ActiveIndexStore.activeIndex = '/home/personCenter'
  getUserDetail()
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
            <img class="user-image" :src="user.userProfilePhoto" alt="User Image" @click="seeCenter">
            <div class="user-info">
              <div class="user-details">
                <h3>昵称：{{ user.userNickname }}</h3>
                <p style="font-weight: 100;color: #96969b">{{ user.userName}}</p>
                <p class="colorful">level：{{user.userLevel }}</p>
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
      <el-main style="min-height: 100%;height: auto;background-color: #b3d4fc">
        <div class="all-message-container">

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

</style>