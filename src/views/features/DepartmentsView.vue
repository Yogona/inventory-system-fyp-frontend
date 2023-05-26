<script>
import Nav from '../../components/Nav.vue';
import TopBar from '../../components/TopBar.vue';
import Progress from '../../components/Progress.vue';

import { BIconPenFill, BIconTrash } from 'bootstrap-icons-vue';

export default {
    props: {
        "active": String,
        "user": Object,
    },
    components: {
        Nav, TopBar, Progress,
        BIconPenFill, BIconTrash
    },
    data() {
        return {
            isLoading: false,
            searchQuery: null,
            id: null,
            name: null,
            description: null,
            abbr: null,
            departments: null,

            //Toast
            title: null,
            message: null,
            toast: null,

            //Delete modal
            deleteModal: null,
        };
    },
    emits: ['locationChange'],
    watch: {
        searchQuery(newVal, oldVal) {
            this.searchDepartments();
        }
    },
    methods: {
        async createDepartment() {
            if (this.$refs.createForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "name": this.name,
                    "description": this.description,
                    "abbr": this.abbr
                };

                //Clear title and message because we don't want them interfering with next feedbacks
                this.title = null;
                this.message = null;

                await this.axios.post(this.api + "/departments/create", data).then((res) => {
                    if (res.status == 201) {
                        this.title = res.data.message;
                        this.name = null;
                        this.description = null;
                        this.abbr = null;
                        this.getDepartments();
                    }
                }).catch((err) => {
                    const resData = err.response.data;
                    this.title = resData.message;
                    this.message = resData.data;
                }).finally(() => {
                    this.isLoading = false;
                    this.Toast.getOrCreateInstance(this.$refs.feedbackToast).show();
                });
            }
        },
        async preFillUpdatingFields(depart) {
            this.id = depart.id;
            this.name = depart.name;
            this.description = depart.description;
            this.abbr = depart.abbr;
        },
        async updateDepartment() {
            this.isLoading = true;

            //We set null because avoids prec notification to be shown on next notification
            this.title = null;
            this.message = null;


            const data = {
                "name": this.name,
                "description": this.description,
                // "abbr": this.abbr
            };

            this.axios.put(this.api + "/departments/update/" + this.id, data).then((res) => {
                this.title = res.data.message;
                this.getDepartments();
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.messsage;
                this.message = resData.data;
            }).finally(() => {
                this.isLoading = false;
                this.Toast.getOrCreateInstance(this.$refs.feedbackToast).show();
            });
        },
        showDeleteModalConfirmation(depart) {
            this.id = depart.id;
            this.deleteModal = this.Modal.getOrCreateInstance(
                document.getElementById("delete-depart-modal"), { backdrop: "static", keyboard: false }
            );
            this.deleteModal.show();
        },
        async deleteDepartment() {
            this.isLoading = true;
        
            await this.axios.delete(this.api + "/departments/delete/" + this.id).then((res) => {
                this.title = res.data.message;
                this.message = res.data.data;
                this.getDepartments();
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.message;
                this.message = resData.data;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
                this.deleteModal.hide();
            });
        },
        async getDepartments() {
            this.isLoading = true;

            await this.axios.get(this.api + "/departments").then((res) => {
                if (res.status == 200) {
                    this.departments = res.data.data;
                }
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.message;
                this.message = this.title;
            }).finally(() => {
                this.isLoading = false;
            });
        },
        async searchDepartments() {
            if (this.searchQuery == "") {
                this.getDepartments();
            } else {
                await this.axios.get(this.api + "/departments/search/" + this.searchQuery).then((res) => {
                    const resData = res.data;
                    this.departments = resData.data;
                }).catch((err) => {
                    const resData = err.response.data;
                    this.departments = null;
                    this.message = resData.message;
                });
            }
        }
    },
    async mounted() {
        this.$emit('locationChange', location.pathname);
        this.getDepartments();
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
    },
    computed: {
    }
}
</script>
<template>
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref="feedbackToast" id="feedbackToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <!-- <img src="..." class="rounded me-2" alt="..."> -->
            <strong class="me-auto">{{ title }}</strong>
            <!-- <small>11 mins ago</small> -->
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            {{ message }}
        </div>
        </div>
    </div>

    <!-- Create Department Modal -->
    <div class="modal fade" id="create-depart-modal" tabindex="-1"
        aria-labelledby="createDepartmentLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Add a new department</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="createForm" @submit.prevent="onSubmit">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="name" class="form-label">Name</label>
                            <input type="text" v-model="name" class="form-control" id="name"
                                aria-describedby="name" required maxlength="50"/>
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea v-model="description" class="form-control" id="description">
                        </textarea>
                        </div>
                        <div class="mb-3">
                            <label for="abbr" class="form-label">Abbreviation</label>
                            <input type="text" v-model="abbr" class="form-control" id="abbr"
                                autocomplete="true" required minlength="3" maxlength="5"/>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary"
                            data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" @click="createDepartment" class="btn btn-dark">
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

    <TopBar :user="user" title="Departments" />
    <div class="row">
        <Nav class="col-md-2" :user="user" :active="active" />
        <main class="col">
            <div class="row mb-3 mt-2">
                <div class="col-md-6">
                    <form class="d-flex" role="search">
                        <input  v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                    </form>
                </div>
                <div class="col">
                    <!-- Button trigger create department modal -->
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#create-depart-modal">
                        Create Department
                    </button>
                </div>
            </div>

            <div class="row justify-content-center">
                <Progress v-if="isLoading" message="Retrieving Departments" />
                <h2 class="p-5" v-else-if="departments == null">
                    {{ message }}
                </h2>
                <h2 class="p-5" v-else-if="departments.length == 0">
                    {{ message }}
                </h2>
                <table v-else class="table table-dark table-hover">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Abbreviation</th>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="depart in departments">
                            <td>{{depart.id}}</td>
                            <td>{{depart.name}}</td>
                            <td>{{ depart.description }}</td>
                            <td>{{ depart.abbr }}</td>
                            <td>
                                <div class="row gx-3">
                                    <div class="col">
                                        <BIconPenFill @click="preFillUpdatingFields(depart)" class="icon-color" data-bs-toggle="modal" data-bs-target="#update-depart-modal" />
                                        <!-- Modal -->
                                        <div class="modal fade" id="update-depart-modal" tabindex="-1"
                                            aria-labelledby="updateDepartmentLabel" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content bg-dark">
                                                    <div class="modal-header">
                                                        <h1 class="modal-title fs-5" id="exampleModalLabel">Update a department</h1>
                                                        <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                                                            aria-label="Close"></button>
                                                    </div>
                                                    <form ref="updateForm" @submit.prevent="onSubmit">
                                                        <div class="modal-body"><span>{{ id }}</span>
                                                            <div class="mb-3">
                                                                <label for="name" class="form-label">Name</label>
                                                                <input type="text" v-model="name" class="form-control" id="name"
                                                                    aria-describedby="name" required maxlength="50"/>
                                                            </div>
                                                            <div class="mb-3">
                                                                <label for="description" class="form-label">Description</label>
                                                                <textarea v-model="description" class="form-control" id="description">
                                                                </textarea>
                                                            </div>
                                                            <div class="mb-3 visually-hidden" hidden="true">
                                                                <label for="abbr" class="form-label">Abbreviation</label>
                                                                <input type="text" v-model="abbr" class="form-control" id="abbr"
                                                                    autocomplete="true" required minlength="3" maxlength="5"/>
                                                            </div>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" class="btn btn-secondary"
                                                                data-bs-dismiss="modal">Cancel</button>
                                                            <button type="submit" @click="updateDepartment" class="btn btn-dark">
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
                                    </div>
                                    <div class="col">
                                        <BIconTrash class="icon-color" @click="showDeleteModalConfirmation(depart)" data-bs-toggle="modal" />
                                        <!-- Modal -->
                                        <div ref="deleteModal" class="modal fade" id="delete-depart-modal" tabindex="-1"
                                            aria-labelledby="deleteDepartmentLabel" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content bg-dark">
                                                    <div class="modal-header">
                                                        <h1 class="modal-title fs-5" id="exampleModalLabel">Delete a department!</h1>
                                                        <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                                                            aria-label="Close"></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <div class="mb-3">
                                                            Do you want to continue?
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary"
                                                            data-bs-dismiss="modal">No</button>
                                                        <button type="submit" @click="deleteDepartment()" class="btn btn-dark">
                                                            <span :hidden="isLoading">Yes</span>
                                                            <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                                                                <span class="visually-hidden">Loading...</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        
                    </tbody>
                </table>
            </div>
        </main>
</div></template>
<style></style>