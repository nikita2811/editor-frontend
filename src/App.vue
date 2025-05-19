<template>
  <div class="app">
    <h1>Code Editor</h1>
    <HelloWorld />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  components: {HelloWorld},
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  height: 100vh;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

h1 {
  padding: 20px;
  margin: 0;
  background: #2d2d2d;
  color: white;
}
</style>