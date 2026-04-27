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
        <div v-if="pdfRendered" ref="pdfContainer" class="pdf-wrapper pdf-scroll">
        </div>
        <div v-else class="pdf-wrapper">
          <div class="pdf-placeholder">
            <i class="el-icon-document"></i>
            <p>{{ loading ? '正在加载 PDF...' : '暂无 PDF' }}</p>
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
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker via Webpack 5 asset modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).href;

export default {
  name: 'ResumeDetail',
  components: { RichTextEditor },
  data() {
    return {
      resume: null,
      editorContent: '',
      pdfDoc: null,
      pdfRendered: false,
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
      this.pdfRendered = false;
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
        const loadingTask = pdfjsLib.getDocument({ data: pdfRes });
        this.pdfDoc = await loadingTask.promise;
        this.pdfRendered = true;
        await this.$nextTick();
        await this.renderPdf();
      } catch {
        this.$message.warning('PDF 预览加载失败');
      }
      this.loading = false;
    },
    async handleSave() {
      if (!this.resume) return;
      this.loading = true;
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
        this.loading = false;
      }
    },
    async renderPdf() {
      const container = this.$refs.pdfContainer;
      if (!container || !this.pdfDoc) return;
      container.innerHTML = '';

      const dpr = window.devicePixelRatio || 1;

      for (let i = 1; i <= this.pdfDoc.numPages; i++) {
        const page = await this.pdfDoc.getPage(i);
        const viewport1 = page.getViewport({ scale: 1 });
        const scale = container.clientWidth / viewport1.width;
        const viewport = page.getViewport({ scale: scale * dpr });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.cssText = 'width:100%;height:auto;display:block';
        if (i > 1) {
          canvas.style.marginTop = '4px';
        }
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    },
    async refreshPdf() {
      if (this.pdfDoc) {
        this.pdfDoc.destroy();
        this.pdfDoc = null;
      }
      this.pdfRendered = false;
      await this.loadPdfContent(this.resume.id);
    },
    async loadPdfContent(id) {
      try {
        const pdfRes = await getResumePdfFile(id);
        const loadingTask = pdfjsLib.getDocument({ data: pdfRes });
        this.pdfDoc = await loadingTask.promise;
        this.pdfRendered = true;
        await this.$nextTick();
        await this.renderPdf();
      } catch {
        this.$message.warning('PDF 预览刷新失败');
      }
    },
  },
  beforeDestroy() {
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }
  },
};
</script>

<style scoped>
.resume-detail-page {
  background: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.pdf-scroll {
  overflow-y: auto;
  padding: 8px;
}
.pdf-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
