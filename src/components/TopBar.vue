<script>
import { RouterLink } from 'vue-router';
import { BIconBoxArrowLeft, BIconPersonBadgeFill } from 'bootstrap-icons-vue';
import UserIcon from './icons/UserIcon.vue';

export default {
  props: [
    "title", "user"
  ],
  components: {
    RouterLink, BIconBoxArrowLeft, BIconPersonBadgeFill
  },
  data() {
    return {
      isLoading: false,

      feedBack: {
        title: null,
        message: null,
      },

      toast: null,

      modals: {
        logoutModal: null,
      },
      role: null,
    };
  },
  methods: {
    showLogoutModal() {
      this.modals.logoutModal = this.Modal.getOrCreateInstance(
        document.getElementById("logout-modal"), { backdrop: "static", keyboard: false }
      );
      this.modals.logoutModal.show();
    },
    async logout() {
      this.isLoading = true;

      await this.axios.post(this.api + "/logout").then((res) => {
        // this.modals.logoutModal.hide();
        this.$router.push("/");
      }).catch((err) => {
        this.feedBack.title = "Error occured!";
        this.feedBack.message = err.response.data.message;
      }).finally(() => {
        this.isLoading = false;
        this.toast.show();
        this.modals.logoutModal.hide();
      });
    },
    async getRole() {
      await this.axios.get(this.api+"/roles/" + this.user.role_id).then((res) => {
        this.role = res.data.data;
      }).catch((err) => {

      });
    }
  },
  async mounted() {
    this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
     await this.getRole();
  },
  async created() {
    
  }
}
</script>

<template>
   <!-- Toast -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref="feedbackToast" id="feedbackToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <!-- <img src="..." class="rounded me-2" alt="..."> -->
            <strong class="me-auto">{{ feedBack.title }}</strong>
            <!-- <small>11 mins ago</small> -->
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            {{ feedBack.message }}
        </div>
        </div>
    </div>

  <!-- Logout Modal -->
  <div ref="logoutModal" class="modal fade" id="logout-modal" tabindex="-1"
      aria-labelledby="logoutLabel" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content bg-dark">
              <div class="modal-header">
                  <h1 class="modal-title fs-5" id="logoutLabel">Logout!</h1>
                  <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                      aria-label="Close"></button>
              </div>
              <div class="modal-body">
                  <div class="mb-3">
                      Do you want to proceed?
                  </div>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-secondary"
                      data-bs-dismiss="modal">No</button>
                  <button type="submit" @click="logout()" class="btn btn-dark">
                      <span :hidden="isLoading">Yes</span>
                      <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                          <span class="visually-hidden">Loading...</span>
                      </div>
                  </button>
              </div>
          </div>
      </div>
  </div>

  <div class="row bg-dark">
    <div class="col text-center">
      <h2>
        <RouterLink class="navbar-brand white-text" to="/dashboard">
          AIMS
        </RouterLink>
      </h2>
    </div>
    <div class="col-md-8">
      <h3>{{ title }}</h3>
    </div>
    <div class="col">
      <ul class="navbar-nav">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <BIconPersonBadgeFill style="font-size: 3rem;" />
            {{ user.first_name }} {{ user.last_name }}
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item disabled" href="#">Profile</a></li>
            <li><a class="dropdown-item disabled" href="#">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" @click="showLogoutModal()">
                <BIconBoxArrowLeft style="font-size: 2rem; color: black;" />
                Logout
              </a>
            </li>
          </ul>
        </li>

      </ul>
    </div>
  </div>
  
</template>

<style>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown:hover .dropdown-menu {display: block;}

a.dropdown-item{
  color: black;
}
</style>
