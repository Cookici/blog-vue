<template>
  <div class="cropper-content">
    <el-container>
      <el-main>
        <el-row>
          <el-col :span="16">
            <div class="cropper">
              <el-icon style="position: absolute;right: 10px;cursor: pointer;font-size: 25px" @click="close"><CloseBold /></el-icon>
              <vue-cropper
                  ref="cropper"
                  :img="option.img"
                  :outputSize="option.outputSize"
                  :outputType="option.outputType"
                  :info="option.info"
                  :canScale="option.canScale"
                  :autoCrop="option.autoCrop"
                  :autoCropWidth="option.autoCropWidth"
                  :autoCropHeight="option.autoCropHeight"
                  :fixed="option.fixed"
                  :fixedNumber="option.fixedNumber"
                  :full="option.full"
                  :fixedBox="option.fixedBox"
                  :canMove="option.canMove"
                  :canMoveBox="option.canMoveBox"
                  :original="option.original"
                  :centerBox="option.centerBox"
                  :height="option.height"
                  :infoTrue="option.infoTrue"
                  :maxImgSize="option.maxImgSize"
                  :enlarge="option.enlarge"
                  :mode="option.mode"
                  @realTime="realTime"
                  @imgLoad="imgLoad">
              </vue-cropper>
            </div>
          </el-col>
          <el-col :span="8">
            <!--预览效果图-->
            <div class="show-preview" >
              <div :style="previews.div" class="preview">
                <img :src="previews.url" :style="previews.img">
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>

      <el-footer>
        <div class="upload-container">
              <el-upload
                  ref="upload"
                  class="upload"
                  action="http://lrh-blog-project.oss-cn-beijing.aliyuncs.com"
                  list-type='picture'
                  :limit="1"
                  :on-exceed="handleExceed"
                  :auto-upload="false"
                  :data="oss"
                  :file-list="fileList"
                  :on-success="handleSuccess"
                  :on-change="handleChange"
                  :on-remove="handleRemove"
              >
                <template #trigger>
                  <el-button type="primary" style="margin-right: 50px">选择图片</el-button>
                </template>
                <el-button type="success" style="margin-left: 50px" @click="submitUpload" :disabled="noSubmit">
                  上传头像
                </el-button>
                <template #tip>
                  <div class="el-upload__tip text-red">
                    limit 1 file, new file will cover the old file
                  </div>
                </template>
              </el-upload>

        </div>
      </el-footer>
    </el-container>
  </div>


</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted, onUnmounted,
  onUpdated,
  reactive,
  ref, toRaw
} from 'vue'
import {ElMessage, ElMessageBox, genFileId, UploadFile} from 'element-plus'
import type {UploadInstance, UploadProps, UploadRawFile} from 'element-plus'
import {policy} from "./policy.js";
import {v4} from "uuid";
import {userStore} from "../../stores/user.ts"
import {User} from "../../models/user.model.ts";


const imgLoad = (msg: string) => {
  console.log("cropper初始化函数=====>" + msg)
  noSubmit.value = false
}


const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

const UserStore = userStore()

const previews = ref({})

const cropper = ref(null)

const cropperFile: UploadFile = ref(null)

const cropperFileName = ref('')

const cropperFileType = ref('')

const noSubmit = ref(true)

//实时预览函数
const realTime = (data: any) => {
  previews.value = data
}

const option = reactive({
  img: '',             //裁剪图片的地址
  outputSize: 1,       //裁剪生成图片的质量(可选0.1 - 1)
  outputType: 'png',  //裁剪生成图片的格式（jpeg || png || webp）
  info: true,          //图片大小信息
  canScale: true,      //图片是否允许滚轮缩放
  autoCrop: true,      //是否默认生成截图框
  autoCropWidth: 150,  //默认生成截图框宽度
  autoCropHeight: 150, //默认生成截图框高度
  fixed: true,         //是否开启截图框宽高固定比例
  fixedNumber: [1, 1], //截图框的宽高比例
  full: true,         //false按原比例裁切图片，不失真
  fixedBox: true,      //固定截图框大小，不允许改变
  canMove: true,      //上传图片是否可以移动
  canMoveBox: true,    //截图框能否拖动
  original: false,     //上传图片按照原始比例渲染
  centerBox: false,    //截图框是否被限制在图片里面
  height: true,        //是否按照设备的dpr 输出等比例图片
  infoTrue: false,     //true为展示真实输出图片宽高，false展示看到的截图框宽高
  maxImgSize: 3000,    //限制图片最大宽度和高度
  enlarge: 1,          //图片根据截图框输出比例倍数
  mode: 'contain'  //图片默认渲染方式
})


const props = defineProps({
  userName: String,
  photoUrl: String,
  canPointer: String,
  dialogVisible: Boolean
})

const emit = defineEmits(['update:canPointer','update:dialogVisible'])
const close:() => void = () => {
  emit('update:canPointer',  canPointer = 'none')
  emit('update:dialogVisible',dialogVisible = !dialogVisible)
}

let canPointer = computed(()=>{
  return props?.canPointer
})

let dialogVisible = computed(()=>{
  return props?.dialogVisible
})

const imageUrl = computed(() => {
  return props?.photoUrl
})

const imageName = computed(() => {
  if (props?.photoUrl != null && props?.photoUrl !== '') {
    return props?.photoUrl.substring(props?.photoUrl.lastIndexOf("/") + 1);
  } else {
    return null;
  }
})


const fileList = computed<UploadRawFile[]>(() => {
  return [{
    name: imageName,
    url: imageUrl
  }]
})


const upload = ref<UploadInstance>()


const oss = reactive({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})


const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  cropperFileName.value = file.name.substring(0, file.name.lastIndexOf("."))
  cropperFileType.value = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length)
  upload.value!.handleStart(file)
}


const submitUpload = () => {
  upload.value!.clearFiles()
  cropper.value.getCropBlob((data: Blob) => {
    cropperFile.value = new window.File([data], +cropperFileName.value + '.' + cropperFileType.value, {type: `image/${cropperFileType.value}`})
    cropperFile.value.uid = genFileId()
    fileList.value.push(cropperFile)
    data.name = cropperFileName.value + "." + cropperFileType.value
    upload.value!.handleStart(data)
  })


  ElMessageBox.confirm("<div style='flex-direction: column;display: flex;align-content: center;justify-content: center;text-align: center'>" +
      "<div style='flex: 1;'>是否修改头像为：</div>" +
      "<img src=" + previews.value.url + " style='height:150px;width:150px;margin-left:30%' />" +
      "</div>", "提示", {
    dangerouslyUseHTMLString: true,
    customClass: 'messageBox_class',
    confirmButtonText: "确定",
    showCancelButton: false,
  }).then(() => {
    getPolicy().then(() => {
      upload.value!.submit()
    }).then(() => {
      (UserStore.user as User).userProfilePhoto = oss.host + "/" + oss.key
    })
  }).catch(() => {
    ElMessage.success("已取消修改")
  })
}


const handleRemove = () => {
  option.img = ''
  noSubmit.value = true
}


const updatePhoto = () => {
  $http({
    url: '/identify/blog/identify/updateUserPhoto',
    method: 'put',
    data: $http.adornData({id: (UserStore.user as User).userId as number, photoUrl: (UserStore.user as User).userProfilePhoto as string}, false, 'form')
  }).then(({data}: { data: any }) => {
    if (data.data === 1) {
      ElMessage.success("更新成功")
    } else {
      ElMessage.error("更新无效")
    }
  }).catch((error) => {
    ElMessage.error("未知错误")
  })
}

const handleChange = (uploadFile: UploadFile) => {
  noSubmit.value = true
  option.img = uploadFile.url
  cropperFileName.value = uploadFile.name.substring(0, uploadFile.name.lastIndexOf("."))
  cropperFileType.value = uploadFile.name.substring(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length)
}

const handleSuccess = (response: any, uploadFile: UploadFile) => {
  if (uploadFile.status === 'success') {
    updatePhoto()
    setTimeout(() => {
      location.reload()
    }, 200)
  } else {
    ElMessage.error("上传失败,请重试")
  }
}

const getPolicy = () => {
  return new Promise((resolve, reject) => {
    policy(props.userName).then(response => {
      oss.policy = response.data.policy;
      oss.signature = response.data.signature;
      oss.ossaccessKeyId = response.data.accessid;
      oss.key = response.data.dir + `${props.userName}:` + v4() + `.${cropperFileType.value}`;
      oss.dir = response.data.dir;
      oss.host = response.data.host;
      console.log("响应的数据 ===> ", response);
      resolve(true)
    }).catch((err: any) => {
      console.log(err)
      reject(false)
    })
  })
}

</script>

<style>
.cropper-content {

  background-color: #f8f8f8;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  border: #6c7b88 solid 2px;
  width: 400px;
  height: 400px;

  &:hover {
    box-shadow: 2px 2px 30px rgba(4, 15, 29, 0.1);
    transform: scale(1.01);
    transition: all ease 0.1s;
  }


  .cropper{
    width: 380px;
    height: 380px;
  }


  .show-preview{
    padding-top: 50%;
    flex: 1;
    justify-content: center;
    display: flex;

    .preview{
      overflow: hidden;
      border:1px solid #67c23a;
      background-color: #757575;
    }
  }


  .upload-container{
    text-align: center;
    align-items: center;
    justify-content: center;
    justify-items: center;

  }





}
</style>