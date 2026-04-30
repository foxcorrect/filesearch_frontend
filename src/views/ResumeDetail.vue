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
        <span>{{ genderLabel }}</span>
        <span v-if="resume.age">{{ resume.age }}岁</span>
        <span v-if="resume.workYears">{{ resume.workYears }}年经验</span>
      </div>
    </div>

    <!-- 原地编辑：pdf2htmlEX HTML 直接渲染，点击文字块即可编辑 -->
    <div class="editor-area" v-loading="loading">
      <PdfHtmlEditor
        ref="editor"
        v-model="editorContent"
        @ready="onEditorReady"
      />
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
import PdfHtmlEditor from '@/components/PdfHtmlEditor.vue';
import { getResumeDetail, getResumePdfContent, updateResume } from '@/api/resume';

export default {
  name: 'ResumeDetail',
  components: { PdfHtmlEditor },
  data() {
    return {
      resume: null,
      editorContent: '',
      originalContent: '',
      loading: false,
      saving: false,
    };
  },
  computed: {
    genderLabel() {
      const g = this.resume?.gender;
      if (g === 1 || g === '1' || g === '男') return '男';
      if (g === 2 || g === '2' || g === '女') return '女';
      return g != null ? String(g) : '';
    },
  },
  async mounted() {
    const id = this.$route.params.id;
    if (!id) {
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
        this.originalContent = this.editorContent;
      } catch {
        this.$message.warning('简历内容加载失败，编辑器将以空白状态启动');
      } finally {
        this.loading = false;
      }
    },
    onEditorReady() {
      // Editor iframe has loaded and contenteditable is active
    },
    async handleSave() {
      if (!this.resume) return;
      const content = this.$refs.editor
        ? this.$refs.editor.getContent()
        : this.editorContent;
      if (content === this.originalContent) {
        this.$message.info('内容未变更，无需保存');
        return;
      }
      this.saving = true;
      try {
        await updateResume(this.resume.id, {
          username: this.resume.username,
          workYears: this.resume.workYears,
          age: this.resume.age,
          gender: this.resume.gender || '',
          resumeContent: content,
        });
        this.$message.success('保存成功');
        this.originalContent = content;
      } catch {
        this.$message.error('保存失败，请重试');
      } finally {
        this.saving = false;
      }
    },
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
.editor-area {
  flex: 1;
  padding: 0 24px;
  min-height: 0;
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
