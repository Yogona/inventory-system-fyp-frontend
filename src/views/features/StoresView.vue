<script>
import Nav from "../../components/Nav.vue";
import TopBar from "../../components/TopBar.vue";
import Progress from "../../components/Progress.vue";
import Instruments from '../features/Stores/Instruments.vue';
import Assignments from "./Stores/Assignments.vue";
import RequestInstruments from '../features/Stores/RequestInstruments.vue';
import RequestExtensions from "./Stores/RequestExtensions.vue";

export default {
    components: {
        Nav,
        TopBar,
        Progress,
    },
    props: {
        "active": String,
        "user": Object,
    },
    emits: ['locationChange'],
    data() {
        return {
            isLoading: false,
            searchQuery: null,
            //Creation data
            id: null,
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

            currentTab: null,
            storeId: null,
        };
    },
    watch: {
        searchQuery(newVal, oldVal) {
            this.searchStores();
        }
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
            this.isLoading = true;

            await this.axios.get(this.api + "/stores/25").then((res) => {
                if (res.status == 200) {
                    const resData = res.data;
                    this.links = resData.data.links;
                    this.stores = resData.data.data;
                }
            }).catch((err) => {
                
            }).finally(() => {
                this.isLoading = false;
            })
        },
        async searchStores() {
            if (this.searchQuery == "") {
                this.getStores();
            } else {
                await this.axios.get(
                    this.api + "/stores/search/" + this.searchQuery 
                ).then((res) => {
                    if (res.status == 200) {
                        const resData = res.data;
                        this.stores = resData.data;
                    }
                }).catch((err) => {console.log(err)
                    const res = err.response;
                    const resData = res.data;
                    if (res.status == 404) {
                        this.stores = resData.data;
                        this.message = resData.message;
                    }
                });
                
            }
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
                    const res = err.response;
                    const resData = res.data;

                    if (res.status == 422) {
                        this.title = resData.message;
                        this.message = resData.data;
                    } else {
                        this.title = "Failed!";
                        this.message = resData.message;
                    }
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
            }
        },
        prefillForm(store) {
            this.id = store.id;
            this.name = store.name;
            this.description = store.description;
            this.location = store.location;
            this.selectedKeeper = store.store_keeper;
            this.selectedDepartment = store.department_id;
        },
        async updateStore() {
            if (this.$refs.updateStoreForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "name": this.name,
                    "description": this.description,
                    "location": this.location,
                    // "store_keeper": this.selectedKeeper,
                    "department_id": this.selectedDepartment
                };

                this.axios.put(this.api + "/stores/update/" + this.id, data).then((res) => {
                    this.title = "Succeeded!";

                    const resData = res.data;
                    this.message = resData.message;

                    this.name = null;
                    this.description = null;
                    this.location = null;
                    this.selectedKeeper = null;
                    this.selectedDepartment = null;

                    this.getStores();
                }).catch((err) => {
                    const res = err.response;
                    const resData = res.data;

                    if (res.status == 422) {
                        this.title = resData.message;
                        this.message = resData.data;
                    } else {
                        this.title = "Failed!";
                        this.message = resData.message;
                    }

                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
            }
        },
        showDeleteModalConfirmation(user) {
            this.id = user.id;
            this.deleteModal = this.Modal.getOrCreateInstance(
                document.getElementById("delete-user-modal"), { backdrop: "static", keyboard: false }
            );
            this.deleteModal.show();
        },
        async deleteStore() {
            this.isLoading = true;

            this.axios.delete(this.api + "/stores/delete/" + this.id).then((res) => {
                const resData = res.data;
                this.title = "Succeeded!";
                this.message = resData.message;
                this.getStores();
            }).catch((err) => {
                console.log(err);
                const res = err.response;
                const resData = res.data;

                this.title = "Failed!";
                this.message = resData.message;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
                this.deleteModal.hide();
            });
        },
        toggleInstruments(storeId) {
            this.currentTab = Instruments;
            this.storeId = storeId;
        },
        toggleAssignments(storeId) {
            this.currentTab = Assignments;
            this.storeId = storeId;
        },
        toggleInstrumentsReq() {
            this.currentTab = RequestInstruments;
        },
        toggleExtensions(storeId) {
            this.currentTab = RequestExtensions;
            this.storeId = storeId;
        },
        showStores() {
            this.currentTab = null;
        }
    },
    async mounted() {
        // this.toggleExtensions(1);
        this.$emit('locationChange', location.pathname);
        await this.getStoreKeepers();
        await this.getDepartments();
        await this.getStores();
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
    },   
    async created() {
        
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

    <!-- Update Store Modal -->
    <div class="modal fade" id="update-store-modal" tabindex="-1"
        aria-labelledby="createStoreLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="updateStoreLabel">Update a store</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="updateStoreForm" @submit.prevent="onSubmit">
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
                        <!-- <div class="mb-3">
                            <label for="role" class="form-label">Store Keeper</label>
                            <select placeholder="Select" v-model="selectedKeeper" class="form-control" id="role">
                                <option disabled selected>Select</option>
                                <option v-for="keeper in storeKeepers" :value="keeper.id">{{ keeper.username }}</option>
                            </select>
                        </div> -->
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
                        <button type="submit" :class="{ disabled: isLoading }" @click="updateStore()" class="btn btn-dark">
                            <span :hidden="isLoading">Update</span>
                            <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Delete section -->
    <!-- Delete User Modal -->
    <div class="modal fade" id="delete-user-modal" tabindex="-1"
        aria-labelledby="deleteDepartmentLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Delete a store!</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        Do you want to continue?
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" :class="{ disabled: isLoading }" class="btn btn-secondary"
                        data-bs-dismiss="modal">No</button>
                    <button type="submit" :class="{ disabled: isLoading }" @click="deleteStore()" class="btn btn-dark">
                        <span :hidden="isLoading">Yes</span>
                        <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <TopBar title="Stores" :user="user" />
    <div class="row">
        <Nav v-if="user.role_id == 1" class="col-md-2" :user="user" :active="active" />
        <main v-if="currentTab == null" class="col">
            <div class="row mb-3 mt-2">
                <div class="col-md-6">
                    <form class="d-flex" role="search">
                        <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                    </form>
                </div>
                <div v-if="user.role_id == 1" class="col">
                    <!-- Button trigger create store modal -->
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#create-store-modal">
                        Create Store
                    </button>
                </div>
                <div class="col">
                    <div @click="toggleInstrumentsReq()" class="row btn btn-secondary mb-2">
                        Instruments Requests
                    </div>
                </div>
            </div>
            <Progress v-if="isLoading" message="Retrieving Stores" />
            <h2 class="p-5" v-else-if="stores == null">
                {{ message }}
            </h2>
            <h2 class="p-5" v-else-if="stores.length == 0">
                {{ message }}
            </h2>
            <div v-else class="p-3 container overflow-hidden text-center">
                <div class="row gy-5">
                    <div class="col-md-6" v-for="store in stores">
                        <div class="px-5 py-3 container-bg tile-accordion">
                            <div class="row ">
                                <div class="col">
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
                                <div class="col">
                                    <div class="row">
                                        <div v-if="user.role_id != 5" @click="toggleInstruments(store.id)" class="row btn btn-secondary mb-2">
                                            Instruments 
                                        </div>
                                        <div @click="toggleAssignments(store.id)" class="row btn btn-secondary mb-2">
                                            Assignments
                                        </div>
                                        <div @click="toggleExtensions(store.id)" class="row btn btn-secondary mb-2">
                                            Requests Extensions
                                        </div>
                                        <div @click="prefillForm(store)" class="row btn btn-secondary mb-2 disabled">
                                            Impared Instruments
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr/>
                            <div v-if="user.role_id == 1" class="row">
                                <div @click="prefillForm(store)" data-bs-toggle="modal" data-bs-target="#update-store-modal" class="col text-accordion">
                                    Edit
                                </div>
                                <!-- <div @click="showDeleteModalConfirmation(store)"  data-bs-toggle="modal" class="col text-accordion">
                                    Remove
                                </div> -->
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </main>
        <component :user="user" v-else class="col" @back-clicked="()=>{showStores();}" :store-id="storeId" :is="currentTab"/>
    </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0
}
</style>