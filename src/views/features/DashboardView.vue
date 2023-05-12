<script>
import { RouterView, RouterLink } from 'vue-router';
import Nav from '../../components/Nav.vue';
import TopBar from "../../components/TopBar.vue";

export default {
  components: {
    Nav, TopBar
  }
}
</script>

<template>
  <TopBar title="Dashboard" />
  <div class="row" style="width: 100%;">
    <Nav class="col-md-2" active="dash" />
    <main class="col">

    </main>
  </div>
</template>

<style>

</style>
