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
            <el-button type="primary" size="small" @click="goDetail(row.id)">
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
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ResumeList',
  data() {
    return {};
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
    goDetail(id) {
      this.$router.push(`/resume/${id}`);
    },
  },
};
</script>

<style scoped>
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
</style>
