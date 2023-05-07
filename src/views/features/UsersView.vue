<script>
import Nav from '../../components/Nav.vue';
import TopBar from '../../components/TopBar.vue';

export default {
    components: {
        Nav, TopBar
    },
    data() {
        return {
            firstName: null,
            lastName: null,
            username: null,
            gender: null,
            email: null,
            phone: null,
            selectedRole: null,
            selectedDepartment: null,
            roles: null,
            departments: null,
        };
    },
    methods: {
        async getRoles() {
            await this.axios.get(this.api + "/roles").then((res) => {
                if (res.status == 200) {
                    this.roles = res.data.data;
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
        async createUser() {
            if (this.$refs.form.checkValidity()) {
                const data = {
                    "first_name": this.firstName,
                    "last_name": this.lastName,
                    "username": this.username,
                    "gender": this.gender,
                    "email": this.email,
                    "phone": this.phone,
                    "role": this.selectedRole
                };
            }
        }
    },
    async mounted() {
        await this.getRoles();
        await this.getDepartments();
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
            <div class="row">
                <div class="col-md-6">
                    <form class="d-flex" role="search">
                        <input class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                    </form>
                </div>
                <div class="col">
                    <!-- Button trigger create user modal -->
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#create-user-modal">
                        Create User
                    </button>

                    <!-- Modal -->
                    <div style="background-color: rgb(29, 53, 88);" class="modal" id="create-user-modal" tabindex="-1" aria-labelledby="createUserLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content bg-dark">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="exampleModalLabel">Add a new user</h1>
                                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <form ref="form" @submit.prevent="onSubmit">
                                    <div class="modal-body">
                                        <div class="mb-3">
                                            <label for="first-name" class="form-label">First Name</label>
                                            <input type="text" v-model="firstName" class="form-control" id="first-name" aria-describedby="first-name" autocomplete="true" required/>
                                        </div>
                                        <div class="mb-3">
                                            <label for="last-name" class="form-label">Last Name</label>
                                            <input type="text" v-model="lastName" class="form-control" id="last-name" autocomplete="true" required/>
                                        </div>
                                        <div class="mb-3">
                                            <label for="username" class="form-label">Username</label>
                                            <input type="text" v-model="username" class="form-control" id="username" autocomplete="true" required/>
                                        </div>
                                        <div class="mb-3">
                                            <label for="gender" class="form-label">Gender</label>
                                            <select placeholder="Select" v-model="gender" class="form-control" id="gender">
                                                <option disabled selected>Select</option>
                                                <option value="M">Male</option>
                                                <option value="F">Female</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="email" class="form-label">Email</label>
                                            <input type="email" v-model="email" class="form-control" id="email" autocomplete="true" required/>
                                        </div>
                                        <div class="mb-3">
                                            <label for="phone" class="form-label">Phone</label>
                                            <input type="tel" v-model="phone" class="form-control" id="phone" autocomplete="true" required/>
                                        </div>
                                        <div class="mb-3">
                                            <label for="role" class="form-label">Role</label>
                                            <select placeholder="Select" v-model="selectedRole" class="form-control" id="role">
                                                <option disabled selected>Select</option>
                                                <option v-for="role in roles" :value="role.id">{{ role.name }}</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="department" class="form-label">Department</label>
                                            <select  placeholder="Select" v-model="selectedDepartment" class="form-control" id="deparment">
                                                <option disabled selected>Select</option>
                                                <option v-for="depart in departments" :value="depart.id">{{depart.abbr}}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                        <button type="submit" @click="createUser" class="btn btn-dark">Add</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <form>
                        <input type="file" class="mb-2"/>
                        <button class="btn btn-dark" type="submit">Upload Users</button>
                    </form>
                </div>
            </div>

            <table class="table table-dark table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Username</th>
                        <th>Gender</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                
                </tbody>
            </table>
        </main>
    </div>
</template>
<style></style>