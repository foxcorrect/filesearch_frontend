<template>
  <div class="resume-detail-page">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>简历详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 简历基本信息 -->
    <div v-if="resume" class="detail-header">
      <h3>{{ resume.username }} - 简历</h3>
      <div class="detail-meta">
        <span>{{ resume.gender || '' }}</span>
        <span v-if="resume.age">{{ resume.age }}岁</span>
        <span v-if="resume.workYears">{{ resume.workYears }}年经验</span>
      </div>
    </div>

    <div class="split-layout" v-loading="loading">
      <!-- 左侧：PDF 预览 -->
      <div class="pdf-panel">
        <div class="panel-title">PDF 预览</div>
        <div class="pdf-wrapper">
          <embed
            v-if="pdfUrl"
            :key="pdfUrl"
            :src="pdfUrl"
            type="application/pdf"
            class="pdf-viewer"
          />
          <div v-else class="pdf-placeholder">
            <i class="el-icon-document"></i>
            <p>正在加载 PDF...</p>
          </div>
        </div>
      </div>

      <!-- 右侧：富文本编辑器 -->
      <div class="editor-panel">
        <div class="panel-title">编辑内容</div>
        <div class="editor-wrapper">
          <RichTextEditor v-model="editorContent" />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <el-button @click="$router.push('/')">返回列表</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存
      </el-button>
    </div>
  </div>
</template>

<script>
import RichTextEditor from '@/components/RichTextEditor.vue';
import { getResumeDetail, getResumePdfContent, getResumePdfFile, updateResume } from '@/api/resume';

export default {
  name: 'ResumeDetail',
  components: { RichTextEditor },
  data() {
    return {
      resume: null,
      editorContent: '',
      pdfUrl: null,
      loading: false,
      saving: false,
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    if (id === undefined || id === null || id === '') {
      this.$message.error('参数错误');
      this.$router.push('/');
      return;
    }
    await this.loadData(id);
  },
  beforeRouteUpdate(to, from, next) {
    this.loadData(to.params.id);
    next();
  },
  methods: {
    async loadData(id) {
      this.loading = true;
      try {
        const detailRes = await getResumeDetail(id);
        this.resume = detailRes.data;
      } catch {
        this.$message.error('加载简历失败');
        this.$router.push('/');
        this.loading = false;
        return;
      }
      try {
        const contentRes = await getResumePdfContent(id);
        this.editorContent = contentRes.data || '';
      } catch {
        // Non-fatal
      }
      try {
        const pdfRes = await getResumePdfFile(id);
        if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
        this.pdfUrl = URL.createObjectURL(new Blob([pdfRes], { type: 'application/pdf' }));
      } catch {
        this.$message.warning('PDF 预览加载失败');
      }
      this.loading = false;
    },
    async handleSave() {
      if (!this.resume) return;
      this.saving = true;
      try {
        await updateResume(this.resume.id, {
          username: this.resume.username,
          workYears: this.resume.workYears,
          age: this.resume.age,
          gender: this.resume.gender || '',
          resumeContent: this.editorContent,
        });
        this.$message.success('保存成功');
        await this.refreshPdf();
      } catch {
        // error handled by interceptor
      } finally {
        this.saving = false;
      }
    },
    async refreshPdf() {
      try {
        const pdfRes = await getResumePdfFile(this.resume.id);
        if (this.pdfUrl) {
          URL.revokeObjectURL(this.pdfUrl);
        }
        this.pdfUrl = URL.createObjectURL(new Blob([pdfRes], { type: 'application/pdf' }));
      } catch {
        this.$message.warning('PDF 预览刷新失败');
      }
    },
  },
  beforeDestroy() {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
    }
  },
};
</script>

<style scoped>
.resume-detail-page {
  background: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.page-header {
  margin-bottom: 10px;
  background: #fff;
  padding: 0 24px;
  line-height: 56px;
  margin-top: 10px;
  height: 40px;
  padding-top: 25px;
  flex-shrink: 0;
}
.detail-header {
  padding: 0 24px 12px;
  flex-shrink: 0;
}
.detail-header h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #303133;
}
.detail-meta {
  font-size: 13px;
  color: #909399;
}
.detail-meta span + span::before {
  content: '|';
  margin: 0 8px;
  color: #dcdfe6;
}
.split-layout {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 0 24px;
  min-height: 0;
  overflow: hidden;
}
.pdf-panel,
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  flex-shrink: 0;
}
.pdf-wrapper {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}
.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}
.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
.pdf-placeholder i {
  font-size: 48px;
  margin-bottom: 12px;
}
.editor-wrapper {
  flex: 1;
  overflow: hidden;
}
.action-bar {
  padding: 12px 24px;
  text-align: right;
  border-top: 1px solid #e4e7ed;
  background: #fff;
  flex-shrink: 0;
  margin-top: 12px;
}
</style>
