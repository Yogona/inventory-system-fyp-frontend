<script>
import { RouterLink } from 'vue-router';
import { BIconBoxArrowLeft } from 'bootstrap-icons-vue';

export default {
  props: [
    "title"
  ],
  components: {
    RouterLink,
    BIconBoxArrowLeft,
  },
  methods: {
    async logout() {
      await this.axios.post(this.api + "/logout").then((res) => {
        this.$router.push("/");
      }).catch((err) => {
        console.log(err);
      }).finally(() => {

      });
    },
  }
}
</script>

<template>
  <div class="row bg-dark">
    <div class="col">
      <h2>
        <RouterLink class="navbar-brand white-text" to="/dashboard">
          Inventory System
        </RouterLink>
      </h2>
    </div>
    <div class="col-8">
      <h3>{{ title }}</h3>
    </div>
    <div class="col">
      <BIconBoxArrowLeft style="font-size: 2rem" @click="logout()"  class="icon-color" />
    </div>
  </div>
  
</template>

<style></style>
