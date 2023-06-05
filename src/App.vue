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
          this.user = res.data;

          if (this.user.role_id == 1 || this.user.role_id == 2) {
            this.$router.push(this.pathname);
          } else {
            this.$router.push("/stores");
          }
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
  <RouterView @location-change="(newPath)=>{changeLocation(newPath); checkAuthenticStatus();}" :user="user"  :active="pathname" />
</template>

<style>
body{
  background-color:#F1F6F9;
  width: 100%;
  color: #F1F6F9;
  padding: 0px 0px 0px 0px;
  margin: 0px 0px 0px 0px;
}
</style>
