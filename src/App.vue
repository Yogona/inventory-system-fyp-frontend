<script>
import { RouterView } from 'vue-router';

export default {
  data() {
    return { 
      pathname: "/",
      user: null,
    };
  },
  methods: {
    async checkAuthenticStatus() {
      this.axios.get(this.api + "/user").then((res) => {
        this.isLoading = true;
        if (res.status == 200) {
          this.$router.push(this.pathname);
          this.user = res.data;console.log(this.user)
        }
      }).catch((err) => {
        if (err.response.status == 401) {
          this.$router.push("/");
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    changeLocation(path) {
      this.pathname = path;
    }
  },
  mounted() {
    this.pathname = location.pathname;
    this.checkAuthenticStatus();
  }
}
</script>

<template>
  <RouterView @location-change="(newPath)=>{changeLocation(newPath)}" :user="user"  :active="pathname" />
</template>

<style>
body{
  background-color: rgb(103, 112, 121);
  width: 100%;
  color: white;
}
</style>
