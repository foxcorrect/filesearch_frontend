<template>
  <div class="resume-list-page">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>简历列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-main">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="username" label="姓名" />
        <el-table-column prop="age" label="年龄" align="center" />
        <el-table-column prop="workYears" label="工作年限" align="center" />
        <el-table-column label="操作" align="center" >
          <template slot-scope="{ row }">
            <el-button type="primary" size="small" @click="openDrawer(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="size"
          :total="total"
          :current-page="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

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
    ...mapState('resume', ['list', 'loading', 'total', 'page', 'size']),
  },
  mounted() {
    this.$store.dispatch('resume/fetchList');
  },
  methods: {
    handleSizeChange(newSize) {
      this.$store.commit('resume/SET_SIZE', newSize);
      this.$store.commit('resume/SET_PAGE', 1);
      this.$store.dispatch('resume/fetchList', { page: 1, size: newSize });
    },
    handleCurrentChange(newPage) {
      this.$store.commit('resume/SET_PAGE', newPage);
      this.$store.dispatch('resume/fetchList', { page: newPage });
    },
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
  },
};
</script>

<style scoped>
.resume-list-page {
}
.page-header {
  margin-bottom: 16px;
  background: #fff;
  padding: 0 24px;
  line-height: 56px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-top: 10px;
  height: 40px;
  padding-top: 25px;
}
.page-main {
  padding: 24px;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
