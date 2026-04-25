<template>
  <div class="login-container">
    <el-card class="login-card" header="简历管理系统 - 登录">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
        @keyup.enter.native="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      form: { username: '', password: '' },
      loading: false,
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
    };
  },
  methods: {
    handleLogin() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.loading = true;
        try {
          await this.$store.dispatch('auth/login', this.form);
          this.$message.success('登录成功');
          this.$router.push('/');
        } catch {
          // error handled by interceptor
        } finally {
          this.loading = false;
        }
      });
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 420px;
}
</style>
