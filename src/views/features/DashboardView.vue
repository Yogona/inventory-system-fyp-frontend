<script>
import { RouterView, RouterLink } from 'vue-router';
import Nav from '../../components/Nav.vue';

export default {
  components: {
    Nav
  }
}
</script>

<template>
  <div class="d-flex">
    <Nav class="p2" />
    <main class="p2 flex-grow-1">
      Dashboard
    </main>
  </div>
</template>

<style>

</style>
