<template>
  <div class="resume-list-page">
    <!-- 顶部导航 -->
    <el-header class="page-header">
      <span class="page-title">简历列表</span>
      <el-button type="text" @click="handleLogout">退出登录</el-button>
    </el-header>

    <!-- 简历表格 -->
    <el-main class="page-main">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="age" label="年龄" width="100" />
        <el-table-column prop="workYears" label="工作年限" width="120" />
        <el-table-column label="操作" width="150">
          <template slot-scope="{ row }">
            <el-button type="primary" size="small" @click="openDrawer(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <!-- Drawer 抽屉 -->
    <el-drawer
      :visible.sync="drawerVisible"
      :before-close="handleCloseDrawer"
      title="编辑简历"
      size="50%"
    >
      <div class="drawer-body" v-loading="detailLoading">
        <div v-if="currentResume" class="detail-header">
          <h3>{{ currentResume.name }} - 简历详情</h3>
        </div>

        <!-- CodeMirror 编辑器 -->
        <CodeMirrorEditor v-model="editorContent" />

        <div class="drawer-footer">
          <el-button @click="handleCloseDrawer">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">
            保存
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue';

export default {
  name: 'ResumeList',
  components: { CodeMirrorEditor },
  data() {
    return {
      drawerVisible: false,
      currentResume: null,
      detailLoading: false,
      editorContent: '',
      saving: false,
    };
  },
  computed: {
    ...mapState('resume', ['list', 'loading']),
  },
  mounted() {
    this.$store.dispatch('resume/fetchList');
  },
  methods: {
    async openDrawer(resume) {
      this.currentResume = resume;
      this.drawerVisible = true;
      this.detailLoading = true;
      try {
        const res = await this.$store.dispatch('resume/fetchDetail', resume.id);
        const detail = this.$store.state.resume.detail;
        this.editorContent = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
      } catch {
        this.editorContent = '';
      } finally {
        this.detailLoading = false;
      }
    },
    async handleSave() {
      if (!this.currentResume) return;
      this.saving = true;
      try {
        const payload = this.parseContent(this.editorContent);
        await this.$store.dispatch('resume/updateDetail', {
          id: this.currentResume.id,
          data: payload,
        });
        this.$message.success('保存成功');
        this.drawerVisible = false;
        this.$store.dispatch('resume/fetchList');
      } catch {
        // error handled by interceptor
      } finally {
        this.saving = false;
      }
    },
    parseContent(content) {
      try {
        return JSON.parse(content);
      } catch {
        // 如果不是合法 JSON，按原始字符串提交
        return { content };
      }
    },
    handleCloseDrawer(done) {
      if (this.editorContent) {
        this.$confirm('内容尚未保存，确认关闭吗？', '提示', {
          type: 'warning',
        })
          .then(() => {
            this.drawerVisible = false;
            this.currentResume = null;
            this.editorContent = '';
            done && done();
          })
          .catch(() => {});
      } else {
        this.drawerVisible = false;
        this.currentResume = null;
        this.editorContent = '';
        done && done();
      }
    },
    handleLogout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.resume-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.page-title {
  font-size: 18px;
  font-weight: 600;
}
.page-main {
  padding: 24px;
}
.drawer-body {
  padding: 0 20px 20px;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
}
.detail-header h3 {
  margin: 0 0 16px;
}
.drawer-footer {
  margin-top: 16px;
  text-align: right;
}
</style>
