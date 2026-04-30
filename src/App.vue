<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}
.page-header {
  background: #fff;
  padding: 0 24px;
  line-height: 56px;
  margin-top: 10px;
  height: 40px;
  padding-top: 25px;
}
</style>
