<script>
import Nav from '../../components/Nav.vue';
import TopBar from '../../components/TopBar.vue';

export default {
    components: {
        Nav, TopBar
    },
    data() {
        return {
            isLoading: false,
            name: null,
            description: null,
            abbr: null,
            departments: null,
        };
    },
    methods: {
        async createDepartment() {
            if (this.$refs.form.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "name": this.name,
                    "description": this.description,
                    "abbr": this.abbr
                };

                await this.axios.post(this.api + "/departments/create", data).then((res) => {
                    if (res.status == 201) {
                        alert(res.data.message);
                        this.name = null;
                        this.description = null;
                        this.abbr = null;
                    }
                }).catch((err) => {
                    alert(err.response.data.message);
                }).finally(() => {
                    this.isLoading = false;
                });
            }
        },
        async getDepartments() {
            await this.axios.get(this.api + "/departments").then((res) => {
                if (res.status == 200) {
                    this.departments = res.data.data;
                }
            }).catch((err) => {

            });
        }
    },
    async mounted() {
        this.getDepartments();
    }
}
</script>
<template>
    <div class="d-flex">
        <Nav class="p2" />
        <main class="p2 flex-grow-1">
            <div class="d-flex">
                <TopBar />
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <form class="d-flex" role="search">
                        <input class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                    </form>
                </div>
                <div class="col">
                    <!-- Button trigger create user modal -->
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#create-depart-modal">
                        Create Department
                    </button>

                    <!-- Modal -->
                    <div style="background-color: rgb(29, 53, 88);" class="modal" id="create-depart-modal" tabindex="-1"
                        aria-labelledby="createDepartmentLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content bg-dark">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="exampleModalLabel">Add a new department</h1>
                                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                                </div>
                                <form ref="form" @submit.prevent="onSubmit">
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
                </div>
            </div>

            <table class="table table-dark table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Abbreviation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="depart in departments">
                        <td>{{depart.id}}</td>
                        <td>{{depart.name}}</td>
                        <td>{{ depart.description }}</td>
                        <td>{{ depart.abbr }}</td>
                    </tr>
                </tbody>
            </table>
        </main>
</div></template>
<style></style>