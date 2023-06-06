<script>
export default {
  emmits: ['locationChange'],
  data() {
    return {
      username: null,
      password: null,
      isLoading: false,
      status:200,
    }
  },
  methods: {
    validate() {
      if (this.username != null && this.password != null) {
        return true;
      }

      return false;
    },
    async login() {
      if (this.validate()) {
        this.isLoading = true;

        await this.axios.get(this.origin + "/sanctum/csrf-cookie").then((res) => {
          this.status = res.status;
        }).catch((err) => {
          alert(err.response.data.message);
        });

        if (this.status == 204) {
          await this.axios.post(this.api + "/login", {
                "username": this.username,
                "password": this.password
          }).then((res) => {
            if (res.status == 202) {
              this.$emit('locationChange', '/dashboard');
            }

          }).catch((err) => {
            alert(err.response.data.message);
          }).finally(()=>{
            this.password = null;
          });
              
        }

        this.isLoading = false;
      }
    },
  },
  mounted() {
    // alert("mounted");
    // this.username = "hello";
  },
}
</script>

<template>
  <div class="text-center h2" id="topTitle">
    <span>ARDHI UNIVERSITY</span>
  </div>
  <div class="text-center h4">
    <em>Geospatial Laboratory Equipment System</em>
  </div>

  <div id="login-pane" class="container-bg white-text">
    <form @submit.prevent="onSubmit">
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input 
        type="text" v-model="username" class="form-control" id="username" aria-describedby="username" autocomplete="true" required/>
      </div>
      <div class="mb-5">
        <label for="password" class="form-label">Password</label>
        <input type="password" v-model="password" class="form-control" id="password" autocomplete="true" required/>
      </div>
      <!-- <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="exampleCheck1">
        <label class="form-check-label" for="exampleCheck1">Check me out</label>
      </div> -->
      <div class="row">
        <button type="submit" @click="login" class="btn">
          <span :hidden="isLoading">Login</span>
          <div :hidden="!isLoading" class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </button>
      </div>
    </form>
  </div>
</template>

<style>
#topTitle{
  margin-top: 3rem;
}

#login-pane{
  border-radius: 10px 10px 10px 10px;
  padding: 10px 10px 10px 10px;
}

@media(min-width:720px){
  #login-pane{
    width: 500px;
    padding: 50px 50px 50px 50px;
    position: relative;
    left: 25rem;
    top: 1rem;
  }
  /* body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 10fr 1fr;
    padding: 0 2rem;
  } */
}
  
</style>