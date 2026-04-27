<template>
  <div class="rich-text-editor">
    <Toolbar
      :editor="editor"
      :defaultConfig="toolbarConfig"
      class="editor-toolbar"
    />
    <Editor
      v-model="html"
      :defaultConfig="editorConfig"
      class="editor-content"
      @on-created="handleCreated"
    />
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

export default {
  name: 'RichTextEditor',
  components: { Editor, Toolbar },
  props: {
    value: { type: String, default: '' },
  },
  data() {
    return {
      editor: null,
      html: '',
      toolbarConfig: {
        toolbarKeys: [
          'headerSelect',
          'bold',
          'italic',
          'underline',
          'through',
          {
            key: 'group-list',
            title: '列表',
            menuKeys: ['bulletedList', 'numberedList'],
          },
          {
            key: 'group-align',
            title: '对齐',
            menuKeys: ['justifyLeft', 'justifyCenter', 'justifyRight'],
          },
          'blockquote',
          'codeBlock',
          'insertTable',
          'uploadImage',
          'divider',
          'undo',
          'redo',
          'clearStyle',
        ],
      },
      editorConfig: {
        placeholder: '请输入简历内容...',
        readOnly: false,
        MENU_CONF: {
          uploadImage: {
            // 自定义上传：将图片转为 base64 嵌入内容
            customUpload: (file, insertFn) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64Url = e.target.result;
                insertFn(base64Url);
              };
              reader.readAsDataURL(file);
            },
          },
        },
        hoverbarKeys: {
          text: {
            menuKeys: [
              'bold',
              'italic',
              'underline',
              'through',
              'justifyLeft',
              'justifyCenter',
              'justifyRight',
            ],
          },
        },
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        const converted = this.toHtml(val);
        if (converted !== this.html) {
          this.html = converted;
        }
      },
    },
    html(val) {
      this.$emit('input', val);
    },
  },
  methods: {
    toHtml(text) {
      if (!text) return '';
      if (
        /<(p|div|span|h[1-6]|ul|ol|li|blockquote|pre|code|br|hr|table|tr|td|th|b|i|u|s|a|img|strong|em)[\s>]/i.test(
          text
        )
      ) {
        return text;
      }
      return text
        .split('\n')
        .filter(Boolean)
        .map((line) => `<p>${line}</p>`)
        .join('');
    },
    handleCreated(editor) {
      this.editor = editor;
    },
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  },
};
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.editor-toolbar {
  border-bottom: 1px solid #dcdfe6;
  flex-shrink: 0;
}
.editor-content {
  flex: 1;
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}
.editor-content >>> .w-e-text-container {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}
.editor-content >>> .w-e-text-container .w-e-text {
  padding: 24px 32px;
  line-height: 1.8;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}
.editor-content >>> .w-e-text h1 {
  font-size: 22px;
  text-align: center;
  margin-bottom: 12px;
}
.editor-content >>> .w-e-text h2 {
  font-size: 17px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 6px;
  margin-top: 20px;
  margin-bottom: 12px;
  color: #303133;
}
.editor-content >>> .w-e-text h3 {
  font-size: 15px;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #409eff;
}
.editor-content >>> .w-e-text p {
  margin-bottom: 6px;
  text-indent: 0;
}
</style>
