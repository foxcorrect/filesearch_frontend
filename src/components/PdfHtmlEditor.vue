<template>
  <div class="pdf-html-editor">
    <div class="editor-toolbar">
      <button
        title="加粗 (Ctrl+B)"
        @mousedown.prevent="exec('bold')"
      ><b>B</b></button>
      <button
        title="斜体 (Ctrl+I)"
        @mousedown.prevent="exec('italic')"
      ><i>I</i></button>
      <button
        title="下划线 (Ctrl+U)"
        @mousedown.prevent="exec('underline')"
      ><u>U</u></button>
      <span class="toolbar-hint">
        点击文字块直接编辑 · 排版和样式完整保留
      </span>
    </div>
    <div class="frame-wrapper">
      <div v-if="!srcdoc" class="editor-placeholder">
        <i class="el-icon-document"></i>
        <p>暂无内容</p>
      </div>
      <iframe
        v-show="srcdoc"
        ref="frame"
        class="editor-frame"
        :srcdoc="srcdoc"
        sandbox="allow-same-origin allow-scripts"
        @load="onFrameLoad"
      />
      <div v-if="srcdoc && !ready" class="editor-overlay">
        <i class="el-icon-loading"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfHtmlEditor',
  props: {
    value: { type: String, default: '' },
  },
  data() {
    return {
      srcdoc: '',
      ready: false,
      setupError: false,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.buildSrcdoc(val || '');
      },
    },
  },
  beforeDestroy() {
    this.ready = false;
  },
  methods: {
    buildSrcdoc(html) {
      this.ready = false;
      this.setupError = false;
      if (!html) {
        this.srcdoc = '';
        return;
      }
      this.srcdoc = this.sanitizeHtml(html);
    },
    sanitizeHtml(html) {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('script, noscript').forEach((el) => el.remove());
        doc.querySelectorAll('*').forEach((el) => {
          Array.from(el.attributes).forEach((attr) => {
            if (/^on\w+/i.test(attr.name)) {
              el.removeAttribute(attr.name);
            }
          });
        });
        return doc.documentElement.outerHTML;
      } catch {
        return html;
      }
    },
    onFrameLoad() {
      const doc = this.getFrameDoc();
      if (!doc || !doc.body) {
        this.setupError = true;
        return;
      }
      this.enableEditing(doc);
    },
    enableEditing(doc) {
      try {
        doc.designMode = 'on';

        const style = doc.createElement('style');
        style.id = '__editor_fixes__';
        style.textContent = `
          *{-webkit-user-select:text!important;user-select:text!important;}
          .t:hover{outline:1px dashed rgba(64,158,255,0.4)!important;}
          .t:focus,.t:active{outline:none!important;background-color:rgba(64,158,255,0.06)!important;}
        `;
        doc.head.appendChild(style);

        doc.addEventListener('keydown', (e) => {
          if (e.ctrlKey && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
            e.preventDefault();
            const map = { b: 'bold', i: 'italic', u: 'underline' };
            this.exec(map[e.key]);
          }
        });

        this.ready = true;
        this.setupError = false;
        this.$emit('ready');
      } catch (err) {
        this.setupError = true;
      }
    },
    exec(command) {
      // document.execCommand is deprecated but remains the only practical API
      // for contentEditable formatting in most browsers as of 2026.
      const doc = this.getFrameDoc();
      if (!doc) return;
      doc.execCommand(command, false, null);
      // Restore focus to the iframe
      try {
        this.$refs.frame.contentWindow.focus();
      } catch (e) { /* ignore */ }
    },
    getFrameDoc() {
      try {
        const frame = this.$refs.frame;
        if (!frame || !frame.contentDocument) return null;
        return frame.contentDocument;
      } catch (e) {
        return null;
      }
    },
    getContent() {
      // Return the original HTML value to avoid storing injected style element
      // Since contentEditable only modifies textContent of .t divs, the original
      // srcdoc + text modifications represent the actual saved content.
      // However we need to capture the live DOM changes. Let's get the HTML and
      // strip our injected fix style.
      const doc = this.getFrameDoc();
      if (!doc) return this.value || '';

      // Remove injected style before serializing
      const fixStyle = doc.getElementById('__editor_fixes__');
      if (fixStyle) fixStyle.remove();

      const html = doc.documentElement.outerHTML;

      // Restore the fix style for continued editing
      if (fixStyle) doc.head.appendChild(fixStyle);

      return html;
    },
  },
};
</script>

<style scoped>
.pdf-html-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}
.editor-toolbar {
  flex-shrink: 0;
  padding: 6px 10px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 4px;
}
.editor-toolbar button {
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #606266;
}
.editor-toolbar button:hover {
  background: #ecf5ff;
  border-color: #c6e2ff;
}
.toolbar-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #c0c4cc;
}
.frame-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.editor-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}
.editor-placeholder,
.editor-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #f5f7fa;
}
.editor-placeholder i,
.editor-overlay i {
  font-size: 48px;
  margin-bottom: 12px;
}
</style>
