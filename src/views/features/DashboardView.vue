<script>
// import { RouterView, RouterLink } from 'vue-router';
import Nav from '../../components/Nav.vue';
import TopBar from "../../components/TopBar.vue";

export default {
  props: {
    "active": String,
    "user":Object
  },
  emits: ['locationChange'],
  components: {
    Nav, TopBar
  },
  data() {
    return {

    };
  },
  mounted(){
    this.$emit('locationChange', location.pathname);
  }
}
</script>

<template>
  <TopBar class="row m-auto" :user="user" title="Dashboard" />
  <div class="row" style="width: 100%;">
    <Nav  class="col-md-2" :user="user" :active="active" />
    <main class="col">

    </main>
  </div>
</template>

<style>

</style>
