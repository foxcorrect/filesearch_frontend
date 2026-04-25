<template>
  <div class="rich-text-editor">
    <quill-editor
      ref="quillEditor"
      v-model="content"
      :options="editorOptions"
      @change="onEditorChange"
    />
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.snow.css';

export default {
  name: 'RichTextEditor',
  components: { quillEditor },
  props: {
    value: { type: String, default: '' },
  },
  data() {
    return {
      content: '',
      editorOptions: {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            ['blockquote', 'code-block'],
            ['clean'],
          ],
        },
        placeholder: '请输入简历内容...',
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        const sanitized = this.sanitizeHtml(this.toHtml(val));
        if (sanitized !== this.content) {
          this.content = sanitized;
        }
      },
    },
  },
  methods: {
    toHtml(text) {
      if (!text) return '';
      // Already HTML — check for common structural tags
      if (/<(p|div|span|h[1-6]|ul|ol|li|blockquote|pre|code|br|hr|table|tr|td|th|b|i|u|s|a|img|strong|em)[\s>]/i.test(text)) {
        return text;
      }
      // Plain text — wrap lines in paragraphs
      return text
        .split('\n')
        .filter(Boolean)
        .map(line => `<p>${line}</p>`)
        .join('');
    },
    sanitizeHtml(html) {
      if (!html) return '';
      return html
        // Remove script tags and their content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        // Remove dangerous structural tags
        .replace(/<\/?(?:iframe|object|embed|link|style|meta|base)[^>]*>/gi, '')
        // Remove event handler attributes
        .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')
        // Remove javascript: URLs
        .replace(/(?:href|src)\s*=\s*["']javascript:[^"']*["']/gi, '');
    },
    cleanHtml(html) {
      if (!html) return '';
      return html
        // Remove empty paragraphs: <p><br></p> or <p></p>
        .replace(/<p><br\s*\/?><\/p>/gi, '')
        .replace(/<p>\s*<\/p>/gi, '')
        // Remove empty spans
        .replace(/<span[^>]*>\s*<\/span>/gi, '')
        // Trim the result
        .trim();
    },
    onEditorChange() {
      this.$emit('input', this.cleanHtml(this.content));
    },
  },
};
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}
.rich-text-editor >>> .quill-editor .ql-container {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}
.rich-text-editor >>> .quill-editor .ql-editor {
  min-height: 400px;
  padding: 24px 32px;
  line-height: 1.8;
}
.rich-text-editor >>> .quill-editor .ql-editor h1 {
  font-size: 22px;
  text-align: center;
  margin-bottom: 12px;
}
.rich-text-editor >>> .quill-editor .ql-editor h2 {
  font-size: 17px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 6px;
  margin-top: 20px;
  margin-bottom: 12px;
  color: #303133;
}
.rich-text-editor >>> .quill-editor .ql-editor h3 {
  font-size: 15px;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #409eff;
}
.rich-text-editor >>> .quill-editor .ql-editor p {
  margin-bottom: 6px;
  text-indent: 0;
}
</style>
