<script>
import Nav from "../../components/Nav.vue";
import TopBar from "../../components/TopBar.vue";

export default {
    components: {
        Nav,
        TopBar
    },
    data() {
        return {
            isLoading: false,
            //Creation data
            name: null,
            description: null,
            location: null,
            selectedKeeper: null,
            selectedDepartment: null,

            //Retrieved lists
            storeKeepers: null,
            departments: null,
            stores: null,

            //Pagination
            pagination: 25,
            links: null,

            //Feedback
            title: null,
            message: null,
            toast: null,
        };
    },
    methods: {
        async getStoreKeepers() {
            this.axios.get(this.api + "/users/role/3").then((res) => {
                if (res.status == 200) {
                    this.storeKeepers = res.data.data;
                }
            });
        },
        async getDepartments() {
            await this.axios.get(this.api + "/departments").then((res) => {
                if (res.status == 200) {
                    this.departments = res.data.data;
                }
            });
        },
        async getStores() {
            await this.axios.get(this.api + "/stores/25").then((res) => {
                if (res.status == 200) {
                    const resData = res.data;
                    this.links = resData.data.links;
                    this.stores = resData.data.data;
                }
            })
        },
        async createStore() {
            if (this.$refs.form.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "name": this.name,
                    "description": this.description,
                    "location": this.location,
                    "store_keeper": this.selectedKeeper,
                    "department_id": this.selectedDepartment
                };

                this.axios.post(this.api + "/stores/create", data).then((res) => {
                    this.title = "Succeeded";

                    if (res.status == 201) {
                        
                        this.name = null;
                        this.description = null;
                        this.location = null;
                        this.selectedKeeper = null;
                        this.selectedDepartment = null;

                        this.message = res.data.message;
                        this.getStores();
                    }
                }).catch((err) => {
                    this.message = err.response.data.message;
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
            }
        }
    },
    async mounted() {
        await this.getStoreKeepers();
        await this.getDepartments();
        await this.getStores();
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
    }   
}
</script>

<template>
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div ref="feedbackToast" id="feedbackToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <!-- <img src="..." class="rounded me-2" alt="..."> -->
          <strong class="me-auto">{{title}}</strong>
          <!-- <small>11 mins ago</small> -->
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{message}}
        </div>
      </div>
    </div>

    <!-- Create Store Modal -->
    <div class="modal fade" id="create-store-modal" tabindex="-1"
        aria-labelledby="createStoreLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Add a new store</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="form" @submit.prevent="onSubmit">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="name" class="form-label">Name</label>
                            <input type="text" v-model="name" class="form-control" id="name"
                                aria-describedby="name" required/>
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea v-model="description" class="form-control" id="description">
                    </textarea>
                        </div>
                        <div class="mb-3">
                            <label for="location" class="form-label">Location</label>
                            <input type="text" v-model="location" class="form-control" id="location" required/>
                        </div>
                        <div class="mb-3">
                            <label for="role" class="form-label">Store Keeper</label>
                            <select placeholder="Select" v-model="selectedKeeper" class="form-control" id="role">
                                <option disabled selected>Select</option>
                                <option v-for="keeper in storeKeepers" :value="keeper.id">{{ keeper.username }}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="department" class="form-label">Department</label>
                            <select  placeholder="Select" v-model="selectedDepartment" class="form-control" id="deparment">
                                <option disabled selected>Select</option>
                                <option v-for="depart in departments" :value="depart.id">{{ depart.abbr }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" :class="{disabled: isLoading}" class="btn btn-secondary"
                            data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" :class="{ disabled: isLoading }" @click="createStore" class="btn btn-dark">
                            <span :hidden="isLoading">Add</span>
                            <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <TopBar title="Stores" />
    <div class="row">
        <Nav class="col-md-2" active="stores" />
        <main class="col">
            <div class="row mb-3 mt-2">
                <div class="col-md-6">
                    <form class="d-flex" role="search">
                        <input class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                    </form>
                </div>
                <div class="col">
                    <!-- Button trigger create store modal -->
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#create-store-modal">
                        Create Store
                    </button>
                </div>
            </div>
            <h2 v-if="stores == null">No stores</h2>
            <div v-else class="container overflow-hidden text-center">
                <div class="row gy-5">
                    <div class="col-md-4" v-for="store in stores">
                        <div class="px-5 py-3 container-bg tile">
                            <div class="row">
                                Id: {{ store.id }}
                            </div>
                            <div class="row">
                                Name: {{ store.name }}
                            </div>
                            <div class="row">
                                Description: {{ store.description }}
                            </div>
                            <div class="row">
                                Location: {{ store.location }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style></style>