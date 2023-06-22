<script>
// import { RouterView, RouterLink } from 'vue-router';
import Nav from '../../components/Nav.vue';
import TopBar from "../../components/TopBar.vue";
import Progress from '../../components/Progress.vue';
import { BIconPeople, BIconBuilding, BIconWindowStack } from 'bootstrap-icons-vue';

export default {
  props: {
    "active": String,
    "user":Object
  },
  emits: ['locationChange'],
  components: {
    Nav, TopBar, Progress, BIconPeople, BIconBuilding, BIconWindowStack
  },
  data() {
    return {
      statistics: null,
    };
  },
  methods: {
    async getStatistics() {
      this.isLoading = true;

      await this.axios.get(this.api + "/statistics").then((res) => {
        if (res.status == 200) {
          this.statistics = res.data.data;
          // let counter = 0;
          // this.departments.forEach((depart) => {
          //   depart.counter = ++counter;
          // })
        }
      }).catch((err) => {
        const resData = err.response.data;
        this.title = resData.message;
        this.message = this.title;
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  mounted(){
    this.$emit('locationChange', location.pathname);
    this.getStatistics();
  }
}
</script>

<template>
  <TopBar class="row m-auto" :user="user" title="Dashboard" />
  <div class="row" style="width: 100%;">
    <Nav  class="col-md-2" :user="user" :active="active" />
    <main class="col">
      <Progress class="text-center" v-if="isLoading" message="Retrieving statistics." />
      <h2 class="p-5" v-else-if="statistics == null">
          {{ message }}
      </h2>
      <h2 class="p-5" v-else-if="statistics.length == 0">
          {{ message }}
      </h2>
      <div v-else class="p-3 container overflow-hidden text-center">
          <div class="row gy-5 justify-content-evenly pt-5">
            <div v-if="user.role_id == 1" class="container-bg white-text col-md-4 summary">
              <div class="row justify-content-center text-center">
                <BIconPeople />
                <span>{{ statistics.users }} Users</span>
              </div>
            </div>

            <div v-if="user.role_id == 1" class="container-bg white-text col-md-4 summary">
              <div class="row justify-content-center text-center">
                <BIconBuilding />
                <span>{{ statistics.departs }} Departments</span>
              </div>
            </div>

            <div class="container-bg white-text col-md-4 summary">
              <div class="row justify-content-center text-center">
                <BIconBuilding />
                <span>{{ statistics.stores }} Stores</span>
              </div>
            </div>

            <div class="container-bg white-text col-md-4 summary">
              <div class="row justify-content-center text-center">
                <BIconWindowStack />
                <span>{{ statistics.stores }} Instruments</span>
              </div>
            </div>
          </div>
      </div>
    </main>
  </div>
</template>

<style>
.summary{
  padding: 2em;
}
</style>
