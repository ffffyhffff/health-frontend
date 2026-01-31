<template>
  <div class="edit">
    <el-card shadow="never">
      <template #header>发布食谱</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option label="低脂" value="lowfat" />
            <el-option label="高蛋白" value="protein" />
            <el-option label="素食" value="vegan" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="选择难度">
            <el-option label="简单" value="简单" />
            <el-option label="中等" value="中等" />
            <el-option label="困难" value="困难" />
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
        <el-form-item label="简介">
          <el-input v-model="form.desc" placeholder="一句话简介（可选）" />
        </el-form-item>
        <el-form-item label="步骤/材料" prop="content">
          <el-input v-model="form.content" type="textarea" rows="6" placeholder="请输入步骤、材料与营养信息" />
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
import { publishRecipe, uploadImage } from '@/api'
import { resolveImageUrl } from '@/utils/image'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const coverPreview = ref('')
const coverFile = ref(null)

const form = reactive({ 
  title: '', 
  category: '', 
  difficulty: '', 
  cover: '', 
  desc: '', 
  content: '' 
})

const rules = {
  title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  content: [{ required: true, message: '请输入步骤和材料', trigger: 'blur' }]
}

const handleCoverChange = async (file) => {
  try {
    loading.value = true
    const formData = new FormData()
    formData.append('file', file.raw)
    const url = await uploadImage(formData)
    coverPreview.value = resolveImageUrl(url)
    form.cover = url
    ElMessage.success('图片上传成功')
  } catch (e) {
    console.error('图片上传失败:', e)
    ElMessage.error('图片上传失败')
  } finally {
    loading.value = false
  }
}

const onSubmit = () => {
  formRef.value?.validate(async (ok) => {
    if (!ok) return
    
    try {
      loading.value = true
      
      // 不再自动填充图片，保持为空让前端显示占位图
      
      // 映射字段： desc -> description
      const data = await publishRecipe({
        title: form.title,
        category: form.category,
        difficulty: form.difficulty,
        cover: form.cover,
        description: form.desc,  // desc 映射为 description
        content: form.content
      })
      
      ElMessage.success('发布成功')
      
      // 跳转到详情页
      if (data) {
        router.push({ name: 'recipe-detail', params: { id: data } })
      } else {
        router.push({ name: 'recipes' })
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
