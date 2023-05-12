<script>
import { RouterView } from 'vue-router';
export default{
  methods: {
    async checkAuthenticStatus() {
      this.axios.get(this.api + "/user").then((res) => {
        this.isLoading = true;
        if (res.status == 200) {
          this.$router.push("/stores");
        }
      }).catch((err) => {
        if (err.response.status == 401) {
          this.$router.push("/");
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
  },
  mounted() {
    this.checkAuthenticStatus();
  }
}
</script>

<template>
  <RouterView />
</template>

<style>
body{
  background-color: rgb(103, 112, 121);
  width: 100%;
  color: white;
}
</style>
