<script setup lang="ts">

import {getCurrentInstance, nextTick, onMounted, reactive, ref} from "vue";
import {userStore} from "../../stores/user.ts";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import tinymce from 'tinymce/tinymce'; //tinymce核心文件
import Editor from '@tinymce/tinymce-vue';
import 'tinymce/models/dom'; // 引入dom模块。从 Tinymce6，开始必须有此模块导入
import 'tinymce/themes/silver'; //默认主题
import 'tinymce/icons/default'; //引入编辑器图标icon，不引入则不显示对应图标
import 'tinymce/langs/zh_CN'; //引入编辑器语言包
/* 引入编辑器插件
 * 位于 ./node_modules/tinymce/plugins 目录下，版本不同，插件会有所差异。根据自己版本来导入，若不存在的，不能导入，会报错。
 */
import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/plugins/advlist'; //高级列表
import 'tinymce/plugins/anchor'; //锚点
import 'tinymce/plugins/autolink'; //自动链接
import 'tinymce/plugins/autoresize'; //编辑器高度自适应,注：plugins里引入此插件时，Init里设置的height将失效
import 'tinymce/plugins/autosave'; //自动存稿
import 'tinymce/plugins/charmap'; //特殊字符
import 'tinymce/plugins/code'; //编辑源码
import 'tinymce/plugins/codesample'; //代码示例
import 'tinymce/plugins/directionality'; //文字方向
import 'tinymce/plugins/emoticons'; //表情
import 'tinymce/plugins/fullscreen'; //全屏
import 'tinymce/plugins/image'; //插入编辑图片
import 'tinymce/plugins/importcss'; //引入css
import 'tinymce/plugins/insertdatetime'; //插入日期时间
import 'tinymce/plugins/link'; //超链接
import 'tinymce/plugins/lists'; //列表插件
import 'tinymce/plugins/nonbreaking'; //插入不间断空格
import 'tinymce/plugins/pagebreak'; //插入分页符
import 'tinymce/plugins/preview'; //预览
import 'tinymce/plugins/quickbars'; //快速工具栏
import 'tinymce/plugins/save'; //保存
import 'tinymce/plugins/searchreplace'; //查找替换
import 'tinymce/plugins/table'; //表格
import 'tinymce/plugins/template'; //内容模板
import 'tinymce/plugins/visualblocks'; //显示元素范围
import 'tinymce/plugins/visualchars'; //显示不可见字符
import 'tinymce/plugins/wordcount';
import {policy} from "../../components/upload/policy.js";
import {v4} from "uuid";
import axios from "axios";
import {activeIndexStore} from "../../stores/activeIndex.ts";
import {BlogLabels} from "../../models/blog.model.ts";
// import 'tinymce/plugins/imagetools'; //存在bug

const UserStore = userStore()
const ActiveIndexStore = activeIndexStore()
const router = useRouter()
let title = ref('')
let content = ref('')
const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties
const oss = reactive({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
})
const labelList = ref([] as any[])
const sortList = ref([])
let labelAndSort = reactive([]);
let status = history.state.articleJSON === undefined ? 'add' : 'update'

const getPolicy = () => {
  return new Promise((resolve, reject) => {
    policy(UserStore.user?.userName).then((response: any) => {
      oss.policy = response.data.policy;
      oss.signature = response.data.signature;
      oss.ossaccessKeyId = response.data.accessid;
      oss.key = response.data.dir + `${UserStore.user?.userName}:` + v4();
      oss.dir = response.data.dir;
      oss.host = response.data.host;
      resolve(true)
    }).catch((err: any) => {
      console.log(err)
      reject(false)
    })
  })
}


const init = {
  selector: 'textarea',
  language: 'zh_CN',
  promotion: false, //Upgrade是否开启
  branding: false, //tiny技术支持信息是否显示
  plugins: ['autoresize', 'fullscreen', 'quickbars', 'emoticons', 'codesample', 'preview', 'searchreplace', 'autolink', 'directionality', 'visualblocks', 'visualchars', 'image', 'link', 'template', 'pagebreak', 'nonbreaking', 'anchor', 'wordcount', 'autosave', 'table', 'lists', 'advlist', 'insertdatetime'], //引入工具插件
  toolbar: 'hr autoresize fullscreen emoticons preview codesample code forecolor backcolor styles directionality fontfamily fontsize searchreplace image link alignleft aligncenter alignright template table charmap pagebreak nonbreaking anchorinsertdatetime bullist numlist  wordcount insertdatetime autosave', //工具栏显示
  line_height_formats: '1 1.2 1.4 1.6 2', //行高
  font_size_formats: '12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 48px 56px 72px', //字体大小
  font_family_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
  emoticons_database_url: '/js/emojis.js',
  quickbars_insert_toolbar: 'quickimage quicktable',
  skin_url: '/skins/ui/oxide',
  content_css: '/skins/content/default/content.css',
  min_height: 450,
  image_caption: true,
  images_upload_handler: (blobInfo: any, progress: any) =>
      new Promise((resolve, reject) => {
        getPolicy().then(() => {
          let filename = blobInfo.filename()
          let index = filename.lastIndexOf('.')
          let suffix = filename.substring(index + 1, filename.length)
          let formData = new FormData()
          formData.append('policy', oss.policy)
          formData.append('signature', oss.signature)
          formData.append('key', `${oss.key}.${suffix}`)
          formData.append('ossaccessKeyId', oss.ossaccessKeyId)
          formData.append('dir', oss.dir)
          formData.append('host', oss.host)
          formData.append('file', blobInfo.blob());
          let headers = {
            "Content-Type": "multipart/form-data",
          }
          axios.post("https://lrh-blog-project.oss-cn-beijing.aliyuncs.com", formData, headers as any).then((response: any) => {
            resolve(`https://lrh-blog-project.oss-cn-beijing.aliyuncs.com/${oss.key}.${suffix}`)
            console.log(progress)
            console.log(response)
            ElMessage.success("上传成功")
          }).catch((error) => {
            reject(error)
            ElMessage.success("请求错误")
          })
        }).catch((error) => {
          reject(error)
          ElMessage.success("未知错误")
        })
      }),
  setup: function (editor: any) {
    editor.on('KeyDown', function (e: any) {
      if ((e.keyCode == 8 || e.keyCode == 46) && editor.selection) { // delete & backspace keys
        let selectedNode = editor.selection.getNode(); // get the selected node (element) in the editor
        if (selectedNode && selectedNode.nodeName == 'IMG') {
          let fileUrl = selectedNode.getAttribute("src")
          deleteFileFromServer(fileUrl)
        }
      }
    });
  },
  placeholder: '请输入内容...'
}


const deleteFileFromServer = (fileUrl: string) => {
  $http({
    url: $http.adornUrl(`blog/oss/deleteFile`),
    method: "delete",
    data: $http.adornData({userName: UserStore.user?.userName, photoUrl: fileUrl}, false, 'json')
  }).then(({data}: { data: any }) => {
    if (data.code !== 200) {
      ElMessage.error(data.message)
    } else {
      ElMessage.success(data.message)
    }
  })
}


const submit = () => {
  if (labelAndSort.length === 0) {
    ElMessage.error("标签和种类未选")
    return;
  }
  if (title.value === null || title.value === undefined || title.value === '') {
    ElMessage.error("标题不能为空")
    return;
  } else if (content.value === null || content.value === undefined || content.value === '') {
    ElMessage.error("内容不能为空")
    return;
  }
  ElMessageBox.confirm("是否提交文章", "提示", {}).then(() => {
    $http({
      url: $http.adornUrl(`blog/articles/create/${UserStore.user?.userId}/${UserStore.user?.userName}`),
      method: "post",
      data: $http.adornData({title: title.value, content: content.value, labelId: labelAndSort[0], sortId: labelAndSort[2]}, false, 'json')
    }).then(({data}: { data: any }) => {
      if (data.data === 3) {
        ElMessage.success("发表成功")
        router.push({path: "/home/content"}).then(() => {
          nextTick(() => {
            window.location.reload()
          })
        })
      }
    })
  }).catch(() => {
    ElMessage.success("取消发表成功")
  })
}

const clearContent = () => {
  ElMessageBox.confirm("是否清空?不会保存初稿!!!", "提示", {}).then(() => {
    content.value = ''
    ElMessage.success("清空成功")
  }).catch(() => {
    ElMessage.success("取消成功")
  })
}


const getLabels = () => {
  $http({
    url: $http.adornUrl(`blog/label/getLabels`),
    method: 'get'
  }).then(({data}: any) => {
    labelList.value = data.data
    labelList.value = labelList.value.map((item: BlogLabels) => {
      return {
        sortId: item.labelId as number,
        sortName: item.labelName as string,
        sortAlias: item.labelAlias as string,
        sortDescription: item.labelDescription as string
      }
    }) as any
    console.log("getLabels ==> ", labelList.value)
    getSortList()
  })
}


const getSortList = () => {
  $http({
    url: $http.adornUrl(`blog/sorts/getSortMenu`),
    method: "get",
  }).then(({data}: { data: any }) => {
    sortList.value = data.data
    console.log("getSortList ==> ", sortList.value)
    for (let i = 0; i < labelList.value.length; i++) {
      let children = {children: sortList.value}
      let key = 'children'
      labelList.value[i][key] = children.children;
    }
    console.log("labelList ==> ", labelList.value)
  })
}


const labelAndSortHandle = (val: any) => {
  labelAndSort = val
  console.log("labelAndSortHandle --> ", labelAndSort)
}

const judgeStatus = () => {
  if (status === 'update') {
    let article = JSON.parse(history.state.articleJSON)
    console.log("article json ==> ", article)
    content.value = article.articleContent
    title.value = article.articleTitle
    getLabelAndSort(article.articleId)
  }
}

const getLabelAndSort = (articleId) => {
  $http({
    url: $http.adornUrl(`blog/articles/get/labelAndSort/${articleId}`),
    method: 'get'
  }).then(({data}: any) => {
    console.log("getLabelAndSort ===> ", data.data)
    labelAndSort.push(data.data.labelId)
    labelAndSort.push(data.data.sortParentId)
    labelAndSort.push(data.data.sortId)
    console.log("labelAndSort ===> ", labelAndSort)
  })
}

const updateArticle = () => {
  let article = JSON.parse(history.state.articleJSON)
  $http({
    url: $http.adornUrl(`blog/articles/update/${article.articleId}/${UserStore.user?.userName}`),
    method: 'put',
    data: $http.adornData({title: title.value, content: content.value, labelId: labelAndSort[0], sortId: labelAndSort[2]}, false, 'json')
  }).then(({data}: any) => {
    if (data.data === 3) {
      ElMessage.success("更新成功")
      labelAndSort = []
      title.value = ''
      content.value = ''
      router.push({path: '/home/content'}).then(() => {
        ActiveIndexStore.activeIndex = '/home/content'
      })
    }
  }).catch(() => {
    labelAndSort = []
    title.value = ''
    content.value = ''
  })

}

const props = {
  expandTrigger: 'hover' as const,
  label: 'sortName',
  value: 'sortId',
}

onMounted(() => {
  tinymce.init({}) // 初始化富文本
  ActiveIndexStore.activeIndex = '/home/subArticle'
  judgeStatus()
  getLabels()
})


</script>

<template>

  <div class="padding" style="height: 10%"></div>
  <div class="sub-article-container">
    <el-container style="display: flex;flex-direction: column">
      <el-header style="flex: 1">
        <div class="article-cascader" style="padding-top: 25px;width: 100%">
          <el-cascader
              style="width: 100%"
              v-model="labelAndSort"
              :options="labelList"
              :props="props"
              popper-class="article-cascader-popper"
              placeholder="选择标签和文章类型"
              @change="labelAndSortHandle"
          >
            <template #default="{ node, data }">
              <span>{{ data.sortName }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </div>
        <div class="container-article-title">
          <el-input
              style="padding-top: 25px;"
              v-model="title"
              autosize
              type="textarea"
              placeholder="请输入标题..."
              show-word-limit
              maxlength="50"
              resize="none"
              @keydown.enter.prevent
          />
        </div>
      </el-header>
      <el-main>
        <div class="article-content" style="flex: 1;display: flex;flex-direction: column;padding-top: 20px;">
          <div style="height: auto">
            <Editor id="tinymce"
                    :init="init"
                    v-model="content"></Editor>
          </div>
          <div class="article-bottom" style="text-align: center
;align-items: center;justify-content: center">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-button type="primary" v-if="status === 'add'" @click="submit()"
                           style="flex: 1;margin-top: 30px;width: 80px;">发表
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="primary" v-if="status === 'update'" @click="updateArticle()"
                           style="flex: 1;margin-top: 30px;width: 80px;">更新
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="primary" v-if="status === 'add'" @click="clearContent"
                           style="flex: 1;margin-top: 30px;width: 80px;">清空
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>

</template>

<style>
.sub-article-container {
  height: auto;
  min-height: 500px;
  width: 90%;
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  align-items: center;
  border-radius: 10px;
  margin: 20px auto;
}


.article-cascader-popper {
  width: 85%;
  display: flex
}

.el-cascader-panel {
  width: 100%;
}

.el-scrollbar {
  flex: 1;
}


</style>