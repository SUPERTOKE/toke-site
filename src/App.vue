<script setup>

</script>

<template>
  <router-view />
</template>

<style>
body {
  overflow-x: clip;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  position: relative;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: clip;
  position: relative;
}

* {
  box-sizing: border-box;
}
</style>