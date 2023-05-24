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
      }
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
  },
  mounted() {
    this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
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
      <BIconBoxArrowLeft style="font-size: 2rem" @click="showLogoutModal()"  class="icon-color" />
    </div>
  </div>
  
</template>

<style></style>
