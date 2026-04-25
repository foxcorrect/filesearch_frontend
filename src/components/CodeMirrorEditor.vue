<template>
  <div class="codemirror-editor">
    <textarea ref="editor" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';

export default {
  name: 'CodeMirrorEditor',
  props: {
    value: { type: String, default: '' },
    options: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      editor: null,
    };
  },
  watch: {
    value(val) {
      if (this.editor && val !== this.editor.getValue()) {
        this.editor.setValue(val);
      }
    },
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(this.$refs.editor, {
      mode: { name: 'javascript', json: true },
      theme: 'material',
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      ...this.options,
    });
    this.editor.setValue(this.value);
    this.editor.on('change', () => {
      this.$emit('input', this.editor.getValue());
    });
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
  },
};
</script>

<style scoped>
.codemirror-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.codemirror-editor >>> .CodeMirror {
  height: auto;
  min-height: 400px;
}
</style>
