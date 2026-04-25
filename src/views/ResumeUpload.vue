<template>
  <div class="resume-upload-page">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>简历上传</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="upload-layout">
      <el-card class="upload-card">
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="right"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" maxlength="50" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="年龄" prop="age">
            <el-input v-model.number="form.age" type="number" placeholder="请输入年龄" min="1" max="150" />
          </el-form-item>

          <el-form-item label="工作年限" prop="workYears">
            <el-input v-model.number="form.workYears" type="number" placeholder="请输入工作年限" min="0" max="60" />
          </el-form-item>

          <el-form-item label="简历文件" prop="file">
            <el-upload
              ref="upload"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
              :file-list="fileList"
              accept=".pdf,application/pdf"
            >
              <el-button slot="trigger" size="small" type="primary">
                选择文件
              </el-button>
              <div slot="tip" class="upload-tip">仅支持 PDF 格式文件</div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              提交
            </el-button>
            <el-button
              :disabled="!form.file || previewLoading"
              :loading="previewLoading"
              @click="handlePreview"
            >
              简历预览
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card
        v-if="previewUrl || previewLoading"
        v-loading="previewLoading"
        class="preview-card"
        element-loading-text="正在加载 PDF..."
      >
        <div slot="header">
          <span>简历预览</span>
        </div>
        <div class="preview-info">
          <p><strong>姓名：</strong>{{ form.name || '未填写' }}</p>
          <p><strong>性别：</strong>{{ form.gender === 1 ? '男' : form.gender === 2 ? '女' : '未填写' }}</p>
          <p><strong>年龄：</strong>{{ form.age || '未填写' }}</p>
          <p><strong>工作年限：</strong>{{ form.workYears ?? '未填写' }}</p>
        </div>
        <embed
          v-if="previewUrl"
          :src="previewUrl"
          type="application/pdf"
          class="pdf-viewer"
        />
      </el-card>
    </div>
  </div>
</template>

<script>
import { uploadResume } from '@/api/resume';

export default {
  name: 'ResumeUpload',
  data() {
    return {
      form: {
        name: '',
        gender: null,
        age: null,
        workYears: null,
        file: null,
      },
      fileList: [],
      submitting: false,
      previewUrl: null,
      previewLoading: false,
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
        workYears: [{ required: true, message: '请输入工作年限', trigger: 'blur' }],
        file: [{ required: true, message: '请上传简历文件', trigger: 'change' }],
      },
    };
  },
  methods: {
    handleFileChange(file) {
      this.revokePreviewUrl();
      this.form.file = file.raw;
      this.fileList = [file];
      this.$refs.form.clearValidate('file');
      this.previewUrl = null;
      this.previewLoading = false;
    },
    beforeUpload(file) {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        this.$message.error('仅支持 PDF 格式文件');
      }
      return isPDF;
    },
    handlePreview() {
      if (!this.form.file) return;

      this.revokePreviewUrl();
      this.previewLoading = true;
      this.previewUrl = null;

      // 延迟生成 blob URL 让 loading 状态能渲染出来
      this.$nextTick(() => {
        this.previewUrl = URL.createObjectURL(this.form.file);
        this.previewLoading = false;
      });
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        if (!this.form.file) {
          this.$message.error('请上传简历文件');
          return;
        }

        this.submitting = true;
        try {
          const formData = new FormData();
          formData.append('username', this.form.name);
          formData.append('gender', this.form.gender);
          formData.append('age', this.form.age);
          formData.append('workYears', this.form.workYears);
          formData.append('file', this.form.file);

          await uploadResume(formData);
          this.$message.success('上传成功');
          this.resetForm();
        } catch {
          // error handled by interceptor
        } finally {
          this.submitting = false;
        }
      });
    },
    resetForm() {
      this.revokePreviewUrl();
      this.$refs.form.resetFields();
      this.fileList = [];
      this.form.file = null;
      this.previewUrl = null;
      this.previewLoading = false;
      this.$refs.upload.clearFiles();
    },
    revokePreviewUrl() {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
    },
  },
  beforeDestroy() {
    this.revokePreviewUrl();
  },
};
</script>

<style scoped>
.resume-upload-page {
  background: #fff;
  min-height: 100%;
}
.page-header {
  margin-bottom: 16px;
  background: #fff;
  padding: 0 24px;
  line-height: 56px;
  border-bottom: 1px solid #eee;
  margin-top: 10px;
  height: 40px;
  padding-top: 25px;
}
.upload-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
}
.upload-card {
  width: 520px;
  flex-shrink: 0;
}
.preview-card {
  flex: 1;
  min-width: 0;
}
.preview-info {
  margin-bottom: 12px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.preview-info p {
  margin: 0;
  font-size: 14px;
}
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.pdf-viewer {
  width: 100%;
  height: 80vh;
  border: none;
}
</style>
