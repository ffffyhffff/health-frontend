<template>
  <div class="edit">
    <el-card shadow="never">
      <template #header>发布资讯</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option label="有氧运动" value="aerobic" />
            <el-option label="健康晨跑" value="run" />
            <el-option label="睡眠健康" value="sleep" />
            <el-option label="心理健康" value="mind" />
            <el-option label="饮食指南" value="diet" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleCoverChange"
            accept="image/*"
          >
            <img v-if="coverPreview" :src="coverPreview" class="cover-preview" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传图片（可选）</div>
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" rows="6" placeholder="请输入正文内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">发布</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { publishNews, uploadImage } from '@/api'
import { resolveImageUrl } from '@/utils/image'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const coverPreview = ref('')
const coverFile = ref(null)

const form = reactive({ 
  title: '', 
  category: '', 
  cover: '', 
  content: '' 
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }]
}

const handleCoverChange = async (file) => {
  try {
    loading.value = true
    
    // 上传图片到服务器
    const formData = new FormData()
    formData.append('file', file.raw)
    
    const url = await uploadImage(formData)
    coverPreview.value = resolveImageUrl(url)
    form.cover = url
    
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    loading.value = false
  }
}

const onSubmit = () => {
  formRef.value?.validate(async (ok) => {
    if (!ok) return
    
    try { loading.value = true
      
      // 不再自动填充图片，保持为空让前端显示占位图
      
      const newsId = await publishNews(form)
      ElMessage.success('发布成功')
      
      // 跳转到详情页
      if (newsId) {
        router.push({ name: 'news-detail', params: { id: newsId } })
      } else {
        router.push({ name: 'news' })
      }
    } catch (error) {
      console.error('发布失败:', error)
      ElMessage.error('发布失败: ' + error.message)
    } finally {
      loading.value = false
    }
  })
}

const onReset = () => {
  formRef.value?.resetFields()
  coverPreview.value = ''
  coverFile.value = null
}
</script>

<style scoped>
.edit { padding: 16px; max-width: 800px; margin: 0 auto; }

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.cover-preview {
  width: 178px;
  height: 178px;
  object-fit: cover;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

:deep(.el-upload) {
  display: block;
}
</style>
