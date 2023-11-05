<script setup lang="ts">

import * as Emoji from 'quill-emoji';
import {Quill, QuillEditor} from "@vueup/vue-quill";
import 'quill-emoji/dist/quill-emoji.css';
import BlotFormatter from "quill-blot-formatter";
import {getCurrentInstance, ref} from "vue";
import {userStore} from "../../stores/user.ts";
import {ElMessage, ElMessageBox} from "element-plus";
import router from "../../router";


Quill.register('modules/emoji', Emoji);
Quill.register('modules/blotFormatter', BlotFormatter)

const editorOptions = {
  modules: {
    "emoji-toolbar": true,
    "emoji-shortname": true,
    blotFormatter: {},
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
        ["blockquote", "code-block"], // 引用
        [{'header': 1}, {'header': 2}],
        [{list: 'ordered'}, {list: 'bullet'}], // 有序、无序列表
        [{script: "sub"}, {script: "super"}], // 上标/下标
        [{indent: '-1'}, {indent: '+1'}], // 缩进
        [{direction: 'rtl'}], // 文本方向
        [{size: ['small', false, 'large', 'huge']}], // 字体大小
        [{header: [1, 2, 3, 4, 5, 6, false]}], // 标题
        [{color: []}, {background: []}], // 字体颜色、字体背景颜色
        [{font: []}], // 字体种类
        [{align: []}], // 对齐方式
        ['clean'], // 清除文本格式
        ['link', 'image'], // 链接、图片、视频
        ['emoji'],
      ],
      handlers: {
        'emoji': function () {
        },
      },
    }
  },
}


let title = ref('')

let content = ref('')

const {$http} = (getCurrentInstance() as any).appContext.config.globalProperties

const UserStore = userStore()

const submit = () => {
  ElMessageBox.confirm("提示", "是否提交博客", {}).then(() => {
    $http({
      url: `/article/blog/articles/create/${UserStore.user?.userId}`,
      method: "post",
      data: $http.adornData({title: title.value, content: content.value}, false, 'form')
    }).then(({data}: { data: any }) => {
      if (data.data === 1) {
        ElMessage.success("发表成功")
        router.push({path: "/home/content"})
      }
    })
  }).catch(() => {
    ElMessage.success("取消发表成功")
  })
}

const clearContent = () => {
  let div = document.getElementsByClassName("ql-editor");
  console.log(div)
  for (let i = 0; i < div.length; i++) {
    div[i].innerHTML = '';
  }
}


</script>

<template>


  <div class="article-container">
    <el-container style="display: flex;flex-direction: column">
      <el-header style="flex: 1">
        <div class="article-title">
          <el-input
              style="padding-top: 20px"
              v-model="title"
              autosize
              type="textarea"
              placeholder="请输入标题"
              show-word-limit
              maxlength="30"
              @keydown.enter.prevent
          />
        </div>
      </el-header>
      <el-main>
        <div class="article-content" style="flex: 1;display: flex;flex-direction: column;padding-top: 20px;">
          <div style="min-height: 400px">
            <QuillEditor style="flex: 1;" v-model:content="content" :options="editorOptions" theme="snow"
                         contentType="html"/>
          </div>
          <div class="article-bottom" style="text-align: center
;align-items: center;justify-content: center">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-button type="primary" @click="submit()" style="flex: 1;margin-top: 30px;width: 80px;">发表
                </el-button>
              </el-col>
              <el-col :span="8">
              </el-col>
              <el-col :span="8">
                <el-button type="primary" @click="clearContent" style="flex: 1;margin-top: 30px;width: 80px;">清空
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>

</template>

<style scoped>
.article-container {
  height: auto;
  min-height: 500px;
  width: 50%;
  background-color: #ffffff;
  box-shadow: 2px 2px 30px rgba(0, 0, 0, 0.05);
  align-items: center;
  border-radius: 10px;
  margin: 10% auto auto;
}


</style>