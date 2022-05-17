<template>
  <div class="global-upload">
    <el-upload
      ref="uploadCom"
      :class="{'avatar-uploader': listType === 'picture'}"
      :file-list="fileList"
      :drag="listType === 'text' && drag"
      :show-file-list="listType !== 'picture'"
      action=""
      :limit="listType !== 'picture' ? limit : undefined"
      :before-upload="beforeUpload"
      :http-request="uploadFile"
      :list-type="listType"
      :on-exceed="onExceed"
      :on-success="onSuccess"
      :on-error="onError"
      :on-change="handleChange"
      :on-remove="handleRemove"
    >
      <template v-if="listType === 'picture'">
        <el-image
          v-if="fileList && fileList[0]"
          class="avatar"
          :src="fileList[0].url"
          :preview-src-list="fileList.map(f=>f.url)"
        />
        <i v-else class="el-icon-plus avatar-uploader-icon" />
      </template>
      <template v-if="listType==='text' && !drag">
        <el-button size="small" type="primary">点击上传</el-button>
      </template>
      <template v-if="listType === 'text' && drag">
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </template>
      <template v-if="tips">
        <div slot="tip" class="upload-tip">{{ tips }}</div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import axios from 'axios'
import {clone} from 'xe-utils'
export default {
  name: 'GlobalUpload',
  props: {
    drag: { type: Boolean, default: false },
    tips: { type: String, default: '' },
    getUploadUrlFn: Function,
    limit: { type: Number, default: 1 },
    kbLimit: { type: Number, default: 0 },
    uploadType: { type: String, default: 'image' }, // image / file
    fileTypes: { type: Array, default: () => (['image']) }
  },
  data() {
    return {
      fileList: []
    }
  },
  computed: {
    listType() {
      switch (this.uploadType) {
        case 'image' :
          return this.limit > 1 ? 'picture-card' : 'picture'
        case 'file':
          return 'text'
      }
      return 'text'
    }
  },
  methods: {
    initFileList(args = '') {
      if (typeof args === 'string') {
        this.fileList = args ? [{ name: '', url: args }] : []
      } else if (Object.prototype.toString.call(args) === '[object Array]') {
        this.fileList = clone(args,true).map(item => {
          return typeof item === 'string' ? { name: '', url: item } : { name: item.name || '', url: item.url }
        })
      }
    },
    beforeUpload(file) {
      if (!this.fileTypes.some(type => file.type.includes(type)) && !this.fileTypes.some(type => file.name.includes(type))) {
        this.$msg.warning('格式错误，请重新上传')
        return false
      }
      const fileKb = file.size / 1024
      if (this.kbLimit && fileKb > this.kbLimit) {
        this.$msg.warning('文件过大')
        return false
      }
      return true
    },
    onExceed() {
      this.$msg.warning(`仅支持上传${this.limit}个文件`)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList.slice(-this.limit)
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-this.limit)
    },
    async uploadFile(params) {
      const { file } = params
      const { status, upload_url } = await this.getUploadUrlFn()
      if (status.code !== 0) {
        return params.onError('获取上传地址失败')
      }
      await axios.put(upload_url.upload_url, file, {
        headers: upload_url.headers
      })
      const url = upload_url.upload_url.split('?')[0]
      if (!url) {
        return params.onError('获取上传地址失败')
      }

      params.onSuccess(url)
    },
    onSuccess(url) {
      if (!url) return
      this.$msg.success('上传成功')
      this.$emit('onAfterUpload', { code: 1, url, fileList: clone(this.fileList,true) })
    },
    onError(err) {
      this.$msg.warning(err || '上传失败')
      this.$emit('onAfterUpload', { code: 0 })
    }
  }
}
</script>

<style lang="scss">
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  &:hover {
    border-color: #409EFF;
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
.upload-tip {
  font-size: 12px;
  line-height: 12px;
  color: #784c4c;
}
</style>
