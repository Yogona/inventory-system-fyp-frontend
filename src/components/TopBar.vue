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

      oldPassword: null,
      newPassword: null,
      confirmPassword: null,

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
    },
    clearFields() {
      this.oldPassword = null;
      this.newPassword = null;
      this.confirmPassword = null;
    },
    async changePassword() {
      if (this.$refs.changePasswordForm.checkValidity()) {
        this.isLoading = true;

        const data = {
          "oldPassword": this.oldPassword,
          "newPassword": this.newPassword,
          "confirmPassword": this.confirmPassword
        };

        await this.axios.post(this.api + "/change-password", data).then((res) => {
          const resData = res.data;
          this.feedBack.title = "Succeeded";
          this.feedBack.message = resData.message;

          //Clears create user form fields
          this.clearFields();
        }).catch((err) => {
          const res = err.response;
          const resData = res.data;

          if (res.status == 422) {
            this.feedBack.title = resData.message;
            this.feedBack.message = resData.data;
          } else {
            this.feedBack.title = "Failed";
            this.feedBack.message = resData.message;
          }
        }).finally(() => {
          this.isLoading = false;
          this.toast.show();
        });


      }
    }
  },
  async mounted() {
    this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
     await this.getRole();
  },
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
          <div class="modal-content container-bg">
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

  <!-- Profile Modal -->
  <div ref="profileModal" class="modal fade" id="profile-modal" tabindex="-1"
      aria-labelledby="profileLabel" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content container-bg">
              <div class="modal-header">
                  <h1 class="modal-title fs-5" id="profileLabel">User Profile</h1>
                  <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                      aria-label="Close"></button>
              </div>
              <div class="modal-body">
                  <div class="row mb-3">
                      <div class="col">
                        First name:
                      </div>
                      <div class="col">
                        {{ user.first_name }}
                      </div>
                  </div>

                  <div class="row mb-3">
                      <div class="col">
                        Last name:
                      </div>
                      <div class="col">
                        {{ user.last_name }}
                      </div>
                  </div>
                  <div class="row mb-3">
                      <div class="col">
                        Username:
                      </div>
                      <div class="col">
                        {{ user.username }}
                      </div>
                  </div>
                  <div class="row mb-3">
                      <div class="col">
                        Gender:
                      </div>
                      <div class="col">
                        {{ user.gender }}
                      </div>
                  </div>
                  <div class="row mb-3">
                      <div class="col">
                        Email:
                      </div>
                      <div class="col">
                        {{ user.email }}
                      </div>
                  </div>
                  <div class="row mb-3">
                      <div class="col">
                        Phone:
                      </div>
                      <div class="col">
                        {{ user.phone }}
                      </div>
                  </div>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-secondary"
                      data-bs-dismiss="modal">Close</button>
              </div>
          </div>
      </div>
  </div>

  <!-- Change password Modal -->
  <div class="modal fade" id="change-password-modal" tabindex="-1"
      aria-labelledby="changePasswordLabel" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content container-bg">
              <div class="modal-header">
                  <h1 class="modal-title fs-5" id="changePasswordLabel">Change Password</h1>
                  <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                      aria-label="Close"></button>
              </div>
              <form ref="changePasswordForm" @submit.default="onSubmit">
                <div class="modal-body">
                    <div class="row mb-3">
                        <label for="oldPassword">Old Password</label>
                        <input type="password" v-model="oldPassword" class="form-control" id="oldPassword" autocomplete="true" required/>
                    </div>
  
                    <div class="row mb-3">
                        <label for="oldPassword">New Password</label>
                        <input type="password" v-model="newPassword" class="form-control" id="newPassword" autocomplete="true" required/>
                    </div>
  
                    <div class="row mb-3">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" v-model="confirmPassword" class="form-control" id="confirmPassword" autocomplete="true" required/>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                        data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" @click="logout()" class="btn btn-dark">
                        <span :hidden="isLoading">Change</span>
                        <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </button>
                </div>

              </form>
          </div>
      </div>
  </div>

  <div class="row top-bar">
    <div class="col text-center">
      <h2>
        <RouterLink class="navbar-brand" to="/dashboard">
          Geo Lab System
        </RouterLink>
      </h2>
    </div>
    <div class="col-md-7">
      <h3>{{ title }}</h3>
    </div>
    <div class="col">
      <ul class="navbar-nav">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <BIconPersonBadgeFill style="font-size: 2rem;" />
            {{ user.first_name }} {{ user.last_name }}
          </a>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#profile-modal">
                Profile
              </a>
            </li>
            <li>
              <a class="dropdown-item" data-bs-target="#change-password-modal" data-bs-toggle="modal">
                Password
              </a>
            </li>
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

a:hover{
  cursor: pointer;
}

.top-bar{
  background-color: #394867;
}
</style>
