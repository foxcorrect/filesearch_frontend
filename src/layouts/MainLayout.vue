<template>
  <div class="layout-container">
    <!-- 左侧导航 -->
    <aside class="layout-sidebar">
      <div class="sidebar-header">简历管理系统</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/">
          <i class="el-icon-document"></i>
          <span slot="title">简历列表</span>
        </el-menu-item>
        <el-menu-item index="/upload">
          <i class="el-icon-upload2"></i>
          <span slot="title">简历上传</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-button type="text" class="logout-btn" @click="handleLogout">退出登录</el-button>
      </div>
    </aside>

    <!-- 右侧内容 -->
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  computed: {
    activeMenu() {
      return this.$route.path;
    },
  },
  methods: {
    handleLogout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.layout-sidebar {
  width: 220px;
  background: #304156;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  height: 56px;
  line-height: 56px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-menu {
  flex: 1;
  border-right: none;
}
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}
.logout-btn {
  color: #bfcbd9;
  font-size: 14px;
}
.logout-btn:hover {
  color: #409eff;
}
.layout-main {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}
</style>
