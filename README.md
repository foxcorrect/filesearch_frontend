# 简历管理系统 - 前端

基于 Vue 2 + Element UI 的简历管理前端，支持 PDF 上传预览、iframe 可视化编辑简历。

## 技术栈

- **Vue 2.7** + Vue Router 3 + Vuex 3
- **Element UI 2.15** 组件库
- **Axios** HTTP 请求
- **iframe designMode** 富文本编辑
- **wangEditor 5**（已集成，备用）

## 项目结构

```
src/
├── main.js                  # 入口：注册 Element UI、Router、Vuex
├── App.vue                  # 根组件 <router-view/>
├── api/
│   ├── request.js           # Axios 实例 + 请求/响应拦截器
│   ├── auth.js              # POST /api/admin/login
│   └── resume.js            # 简历 CRUD API
├── components/
│   ├── PdfHtmlEditor.vue    # iframe designMode 编辑器（PDF 转 HTML 编辑）
│   └── RichTextEditor.vue   # wangEditor 5 富文本编辑器（备用）
├── layouts/
│   └── MainLayout.vue       # 侧边栏 + 内容区布局
├── router/
│   └── index.js             # 路由配置 + 导航守卫
├── store/
│   ├── index.js             # Vuex 根 Store
│   └── modules/
│       ├── auth.js          # 认证状态（token、login、logout）
│       └── resume.js        # 简历列表状态
├── utils/
│   └── storage.js           # localStorage JWT 读写
└── views/
    ├── Login.vue            # 登录页
    ├── ResumeList.vue       # 简历列表（表格 + 分页）
    ├── ResumeUpload.vue     # 上传简历（表单 + PDF 预览）
    └── ResumeDetail.vue     # 简历详情编辑（元数据 + 编辑器）
```

## 环境要求

- Node.js 16+
- 后端服务运行在 `http://localhost:8080`（见下方代理配置）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run serve

# 生产构建
npm run build
```

开发服务器启动后访问 `http://localhost:3000`。

## 代理配置

`vue.config.js` 将 `/api` 路径代理到后端：

```js
devServer: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

可通过 `.env` 文件配置：

```
VUE_APP_API_BASE_URL=http://localhost:8080
```

## 路由

| 路径 | 页面 | 说明 | 需要登录 |
|------|------|------|----------|
| `/login` | Login | 登录页 | 否 |
| `/` | ResumeList | 简历列表（默认首页） | 是 |
| `/upload` | ResumeUpload | 上传新简历 | 是 |
| `/resume/:id` | ResumeDetail | 编辑简历详情 | 是 |

## 认证流程

1. 用户登录 `POST /api/admin/login` → 获取 JWT 令牌
2. 令牌存储在 `localStorage`（键名 `resume_token`）+ Vuex
3. Axios 请求拦截器自动注入 `Authorization: Bearer <token>`
4. 401 响应自动清除令牌并跳转登录页
5. 路由守卫：未登录访问需认证页面 → 跳转 `/login`；已登录访问 `/login` → 跳转 `/`

## 页面功能

### 登录 (`/login`)
- 用户名 + 密码表单
- Element UI 表单验证
- 支持 Enter 键提交

### 简历列表 (`/`)
- 表格展示：姓名、年龄、工作年限
- 分页浏览
- 点击"编辑"进入详情页

### 上传简历 (`/upload`)
- 表单字段：姓名、性别、年龄、工作年限、PDF 文件
- 上传前 PDF 内嵌预览（`<embed>` 标签）
- 提交后自动调用后端 PDF 转换

### 简历编辑 (`/resume/:id`)
- 显示简历元数据
- 内嵌 `PdfHtmlEditor`：iframe `designMode` 模式编辑 HTML
- 工具栏：粗体 / 斜体 / 下划线（支持快捷键 Ctrl+B/I/U）
- 保存后 HTML 经后端 Jsoup 清洗后入库

## 核心组件

### PdfHtmlEditor
专为 PDF 转 HTML 内容设计的编辑器，使用 iframe + `designMode = 'on'` 实现：
- 通过 `srcdoc` 加载完整 HTML（保留 PDF 原始排版）
- 支持 `v-model` 双向绑定
- 内容为空时显示占位提示

### RichTextEditor（备用）
基于 wangEditor 5 的富文本编辑器，功能更丰富：
- 支持标题、列表、对齐、引用、代码块、表格、图片
- 图片自动转 base64 嵌入
- 纯文本自动转 `<p>` 标签

## 状态管理

Vuex 分两个模块：

- **auth** — `token` 的读写，`login()` / `logout()` 操作
- **resume** — `list`、`total`、`page`、`size`、`loading`，`fetchList()` 操作
