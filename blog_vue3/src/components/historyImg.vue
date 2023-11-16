<template>
  <div style="height: 10%"></div>
  <div class="card-container">
    <div class="card-position">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>历史头像</span>
          </div>
        </template>
        <div v-for="photo in photos" :key="photo.Id" class="items">
          <el-image class="history-img"  :src="photo?.photo" fit='fill'
                    @click="loveBack(UserStore?.user?.userId,photo)"/>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, onMounted, ref, Ref} from "vue";
import {Photo} from "../models/photo.model.ts";
import {userStore} from "../stores/user.ts";
import {ElMessage, ElMessageBox} from "element-plus";
import {User} from "../models/user.model.ts";
import {useRouter} from "vue-router";

const UserStore = userStore()
const router = useRouter()
const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

let photos: Ref<Photo[]> = ref([])

const getPhotos = () => {
  $http({
    url: `/identify/blog/photo/getAllPhotos/${UserStore.user?.userId}`,
    method: "get",
  }).then(({data}: { data: any }) => {
    photos.value = data.data
  })
}


onMounted(() => {
  getPhotos()
})


const loveBack = (userId, photo) => {
  ElMessageBox.confirm("是否更改为该头像", "提示", {}).then(() => {
    $http({
      url: `/identify/blog/identify/goBackPhoto`,
      method: 'put',
      data: $http.adornData({id: userId, photoUrl: photo.photo}, false, 'json')
    }).then(({data}: { data: any }) => {
      if (data.data === 1) {
        $http({
          url: `/identify/blog/identify/get/${UserStore.user?.userName}`,
          method: "get",
        }).then(({data}: { data: any }) => {
          UserStore.setUser(data.data as User)
          router.push({path:'/home/content'}).then(()=>{
            location.reload()
            ElMessage.success('更改成功')
          })
        })
      }
    }).catch(() => {
      ElMessage.error("未知错误")
    })
  }).catch(() => {
    ElMessage.success("取消成功")
  })
}

</script>


<style>

.card-container {
  padding-top: 20px;
  padding-bottom:20px ;
  display: flex;
  height: auto;
  width: 100%;
  text-align: center;
  align-items: center;
  justify-content: center;

}

.card-position {
  overflow: hidden;
  border-radius:20px;
  border: #96969b solid 0.01rem;
  box-shadow: 2px 2px 30px rgba(4, 15, 29, 0.1);
}

.card-header {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items {
  margin: 10px;
  height: 200px;
  width: 200px;
  display: inline-block;
}

.box-card {
  overflow: auto;
  min-height: 600px;
  height: 700px;
  width: 1000px;
  background-color: #f8f8f8;

}

.history-img{
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  align-items: center;
  border-radius: 10px;
  margin: 30px 30px 30px 40px;
  width: 150px;
  height: 150px;
  cursor:pointer;
}

.history-img:hover {
  box-shadow: 2px 2px 30px rgba(4, 15, 29, 0.1);
  transform: scale(1.01);
  transition: all ease 0.1s;
}


</style>