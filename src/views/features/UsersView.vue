<script>
import Nav from '../../components/Nav.vue';
import TopBar from '../../components/TopBar.vue';
import Progress from '../../components/Progress.vue';
import { BIconPenFill, BIconTrash } from 'bootstrap-icons-vue';

export default {
    components: {
        Nav, TopBar, Progress, BIconPenFill, BIconTrash
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
            file: null,
            id: null,
            firstName: null,
            lastName: null,
            username: null,
            gender: null,
            email: null,
            phone: null,
            selectedRole: "all",
            selectedDepartment: null,
            // password: null,
            // confirmPass: null,
            passError: null,
            roles: null,
            departments: null,
            users: null,

            //Pagination
            pagination: 10,
            links: null,
            from: null,
            to: null,
            total: null,
            currentPage: 1,
            firstPageUrl: null,
            lastPageUrl: null,
            lastPage: null,
            prevPageUrl: null,
            nextPageUrl: null,

            //Toast dialog
            toast: null,
            title: null,
            message: null,
        };
    },
    watch: {
        searchQuery(newVal, oldVal) {
            this.searchUsers(this.currentPage);
        }
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
        fetchResponseData(res) {            
            const data = res.data.data;
            this.users = data.data;
            let counter = 0;
            this.users.forEach((user) => {
                user.counter = ++counter;
            })
            this.links = data.links;
            this.from = data.from;
            this.to = data.to;
            this.total = data.total;
            this.currentPage = data.current_page;
            this.firstPageUrl = data.first_page_url;
            this.lastPageurl = data.last_page_url;
            this.lastPage = data.last_page;
            this.prevPageUrl = data.prev_page_url;
            this.lastPageUrl = data.next_page_url;

            //Removes laravel useless prev and next labels
            let tempLinks = [];
            var index = 0;
            this.links.forEach((val) => {
                if (!(index == 0 || index == (this.links.length-1))) {
                    tempLinks.push(val);
                } 
                ++index;
            });
            this.links = tempLinks;
        },
        async getUsers(page = 1) {
            this.isLoading = true;

            await this.axios.get(
                this.api + "/users/role/" + this.selectedRole + "/records/" + this.pagination+"?page="+page
            ).then((res) => {
                if (res.status == 200) {
                    this.fetchResponseData(res);
                }  
            }).finally(() => {
                this.isLoading = false;
            });
        },
        async searchUsers(page = 1) {
            if (this.searchQuery == "") {
                this.getUsers(this.currentPage);
            } else {
                await this.axios.get(
                    this.api + "/users/role/" + this.selectedRole+"/search/"+this.searchQuery + "/records/" + this.pagination + "?page=" + page
                ).then((res) => {
                    if (res.status == 200) {
                        this.fetchResponseData(res);
    
                    }
                }).catch((err) => {
                    const res = err.response;
                    const resData = res.data;
                    if (res.status == 404) {
                        this.users = resData.data;
                        this.message = resData.message;
                    }
                });
                
            }
        },
        clearFields() {
            this.firstName = null;
            this.lastName = null;
            this.username = null;
            this.gender = null;
            this.email = null;
            this.phone = null;
            this.selectedDepartment = null;
        },
        async createUser() {
            if (this.$refs.form.checkValidity()) {
                //We clear these fields because it avoids interlace of requests feedbacks
                this.title = null;
                this.message = null;
    
                // if (this.password != this.confirmPass) {
                //     this.passError = "**Passwords do not match.*";
                // } else if (this.$refs.form.checkValidity()) {
                // }
                this.isLoading = true;
    
                const data = {
                    "first_name": this.firstName,
                    "last_name": this.lastName,
                    "username": this.username,
                    "gender": this.gender,
                    "email": this.email,
                    "phone": this.phone,
                    "role_id": this.selectedRole,
                    "department_id": this.selectedDepartment
                };
    
                await this.axios.post(this.api + "/users/create", data).then((res) => {
                    const resData = res.data;
                    this.title = "Succeeded";
                    this.message = resData.message;
    
                    //Clears create user form fields
                    this.clearFields();
    
                    this.getUsers();
                }).catch((err) => {
                    const res = err.response;
                    const resData = res.data;
    
                    if (res.status == 422) {
                        this.title = resData.message;
                        this.message = resData.data;
                    } else {
                        this.title = "Failed";
                        this.message = resData.message;
                    }
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
                
            }
        },
        getAttachedFile(event) {
            this.file = event.target.files[0];
        },
        async uploadUsersFile() {
            if (this.$refs.fileUploadForm.checkValidity()) {
                this.isLoading = true;
    
                //We clear because we don't want to mix processes feedbacks
                this.title = null;
                this.message = null;
    
                let formData = new FormData();
                formData.append("users", this.file);
    
                await this.axios.post(this.api + "/users/upload", formData).then((res) => {
                    const resData = res.data;
                    this.title = resData.message;
                    this.getUsers();
                }).catch((err) => {console.log(err)
                    const resData = err.response.data;
                    this.title = resData.message;
                    this.message = resData.data;
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
                
            }
        },
        preFillUpdatingFields(user) {
            this.id = user.id;
            this.firstName = user.first_name;
            this.lastName = user.last_name;
            this.username = user.username;
            this.email = user.email;
            this.phone = user.phone;
            this.gender = user.gender;
            this.selectedRole = user.role_id.id;
            const depart = user.department_id;
            
            this.selectedDepartment = (depart==null)?null:depart.id;
        },
        async updateProfile() {
            if (this.$refs.updateProfileForm.checkValidity()) {
                this.isLoading = true;
    
                const data = {
                    "first_name": this.firstName,
                    "last_name": this.lastName,
                    "gender": this.gender,
                    "role_id": this.selectedRole,
                    "department_id": this.selectedDepartment
                };
    
                await this.axios.put(this.api + "/users/update/" + this.id, data).then((res) => {
                    const resData = res.data;
                    this.title = "Succeeded!";
                    this.message = resData.message;
    
                    this.id = null;
                    this.firstName = null;
                    this.lastName = null;
                    this.gender = null;
                    this.selectedRole = "all";
                    this.selectedDepartment = null;

                    this.getUsers();
                }).catch((err) => {
                    console.log(err);
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
        async changeUsername() {
            if (this.$refs.changeUsernameForm.checkValidity()) {
                this.isLoading = true;
    
                const data = {
                    "username": this.username,
                };
    
                this.axios.patch(this.api + "/users/change-username/" + this.id, data).then((res) => {
                    const resData = res.data;
                    this.title = "Succeeded!";
                    this.message = resData.message;
                    this.getUsers();
                }).catch((err) => {
                    console.log(err);
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
        async changeEmail() {
            if (this.$refs.changeEmailForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "email": this.email,
                };

                this.axios.patch(this.api + "/users/change-email/" + this.id, data).then((res) => {
                    const resData = res.data;
                    this.title = "Succeeded!";
                    this.message = resData.message;
                    this.getUsers();
                }).catch((err) => {
                    console.log(err);
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
        async changePhone() {
            if (this.$refs.changePhoneForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "phone": this.phone,
                };

                this.axios.patch(this.api + "/users/change-phone/" + this.id, data).then((res) => {
                    const resData = res.data;
                    this.title = "Succeeded!";
                    this.message = resData.message;
                    this.getUsers();
                }).catch((err) => {
                    console.log(err);
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
        async deleteUser() {
            this.isLoading = true;

            this.axios.delete(this.api + "/users/delete/" + this.id).then((res) => {
                const resData = res.data;
                this.title = "Succeeded!";
                this.message = resData.message;
                this.getUsers();
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
        }
    },
    async mounted() {
        this.$emit('locationChange', location.pathname);
        await this.getRoles();
        await this.getDepartments();
        await this.getUsers();
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
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

    <!-- Create User Modal -->
    <div class="modal fade" id="create-user-modal" tabindex="-1" aria-labelledby="createUserLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content container-bg">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="createUserLabel">Add a new user</h1>
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
                                <option v-for="depart in departments" :value="depart.id">{{ depart.abbr }}</option>
                            </select>
                        </div>
                        <!-- <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" v-model="password" class="form-control" id="password" autocomplete="true" required/>
                    </div>
                    <div class="mb-3">
                        <label for="confirmPass" class="form-label">Confirm Password</label>
                        <input type="password" v-model="confirmPass" class="form-control" id="confirmPass" autocomplete="true" required/>
                    </div>
                    <span class="error">{{ passError }}</span> -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" @click="createUser()" class="btn btn-dark">
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

    <!-- Edit section -->
    <!-- Update Profile Modal -->
    <div class="modal" id="update-profile-modal" tabindex="-1"
        aria-labelledby="updateProfileLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content container-bg">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="updateProfileLabel">Update a user profile</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="updateProfileForm" @submit.prevent="onSubmit">
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
                            <label for="gender" class="form-label">Gender</label>
                            <select placeholder="Select" v-model="gender" class="form-control" id="gender">
                                <option disabled selected>Select</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
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
                                <option value="null">No department</option>
                                <option v-for="depart in departments" :value="depart.id">{{ depart.abbr }}</option>
                            </select>
                        </div>
                        <div class="row">
                            <button type="button" class="btn btn-primary mb-2"  data-bs-target="#change-username-modal" data-bs-toggle="modal">Change username</button>
                            <button type="button" class="btn btn-primary mb-2"  data-bs-target="#change-email-modal" data-bs-toggle="modal">Change email</button>
                            <button type="button" class="btn btn-primary mb-2"  data-bs-target="#change-phone-modal" data-bs-toggle="modal">Change phone</button>
                            <button type="button" class="btn btn-primary mb-2 disabled"  data-bs-target="#change-phone-modal" data-bs-toggle="modal">Reset password</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" :class="{ disabled: isLoading }" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" :class="{ disabled: isLoading }" @click="updateProfile()" class="btn btn-dark">
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

    <!-- Change Username Modal -->
    <div class="modal fade" id="change-username-modal" tabindex="-1"
            aria-labelledby="changeUsernameLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content container-bg">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="changeUsernameLabel">Change username</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="changeUsernameForm" @submit.prevent="onSubmit">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" v-model="username" class="form-control" id="username" autocomplete="true" required/>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <!-- <button type="button" class="btn btn-secondary" data-bs-target="#update-profile-modal" data-bs-toggle="modal">Back</button> -->
                        <button type="submit" @click="changeUsername()" class="btn btn-dark">
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

    <!-- Change Email Modal -->
    <div class="modal fade" id="change-email-modal" tabindex="-1"
            aria-labelledby="changeEmailLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content container-bg">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="changeUsernameLabel">Change email</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="changeEmailForm" @submit.prevent="onSubmit">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="username" class="form-label">Email</label>
                            <input type="email" v-model="email" class="form-control" id="email" autocomplete="true" required/>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <!-- <button type="button" class="btn btn-secondary" data-bs-target="#update-profile-modal" data-bs-toggle="modal">Back</button> -->
                        <button type="submit" :class="{disabled: isLoading}" @click="changeEmail()" class="btn btn-dark">
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

     <!-- Change Phone Modal -->
    <div class="modal fade" id="change-phone-modal" tabindex="-1"
            aria-labelledby="changePhoneLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content container-bg">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="changeUsernameLabel">Change phone</h1>
                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <form ref="changePhoneForm" @submit.prevent="onSubmit">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone</label>
                            <input type="tel" v-model="phone" class="form-control" id="phone" autocomplete="true" required/>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <!-- <button type="button" class="btn btn-secondary" data-bs-target="#update-profile-modal" data-bs-toggle="modal">Back</button> -->
                        <button type="submit" :class="{ disabled: isLoading }" @click="changePhone()" class="btn btn-dark">
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

    <!-- Delete section -->
    <!-- Delete User Modal -->
    <div class="modal fade" id="delete-user-modal" tabindex="-1"
        aria-labelledby="deleteDepartmentLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content container-bg">
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
                    <button type="button" :class="{disabled: isLoading}" class="btn btn-secondary"
                        data-bs-dismiss="modal">No</button>
                    <button type="submit" :class="{ disabled: isLoading }" @click="deleteUser()" class="btn btn-dark">
                        <span :hidden="isLoading">Yes</span>
                        <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <TopBar :user="user" title="Users" />
    
    <div class="row">
        <Nav class="col-md-2" :user="user" :active="active" />
        <main class="col-md-10">
            <div class="row mb-1 mt-2">
                <div class="col-md-4">
                    <form class="d-flex" role="search">
                        <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                    </form>
                </div>
                <div class="col">
                    <select v-model="selectedRole" @change="getUsers()" class="form-control">
                        <option disabled>Select role</option>
                        <option value="all">All</option>
                        <option value="1">Admin</option>
                        <option value="2">Manager</option>
                        <option value="3">Store keeper</option>
                        <option value="4">Lecturer</option>
                        <option value="5">CR</option>
                    </select>
                </div>
                <div class="col">
                    <!-- Button trigger create user modal -->
                    <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#create-user-modal">
                        Create User
                    </button>
                </div>
                <div class="col">
                    <form ref="fileUploadForm" @submit.prevent="onSubmit">
                        <input @change="getAttachedFile($event)" placeholder="Select users file" type="file" accept=".xls,.xlsx" class="form-control mb-2" required />
                        <button class="btn btn-dark" type="submit" @click="uploadUsersFile()">
                            <span :hidden="isLoading">Upload Users</span>
                            <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </button>
                    </form>
                </div>
            </div>

            <div class="row justify-content-center">
                <Progress v-if="isLoading" message="Retrieving Users" />

                <h2 class="p-5" v-else-if="users == null">
                    {{ message }}
                </h2>
                <h2 class="p-5" v-else-if="users.length == 0">
                    {{ message }}
                </h2>
                <table v-else class="table table-hover">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>First name</th>
                            <th>Last name</th>
                            <th>Username</th>
                            <th>Gender</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users">
                            <td>{{ user.counter }}</td>
                            <td>{{ user.first_name }}</td>
                            <td>{{ user.last_name }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.gender }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.phone }}</td>
                            <td>{{ user.role_id.name }}</td>
                            <td v-if="user.department_id">{{ user.department_id.abbr }}</td>
                            <td v-else>NULL</td>
                            <td>
                                <div class="row gx-3">
                                    <div class="col">
                                        <BIconPenFill @click="preFillUpdatingFields(user)" class="icon-color" data-bs-toggle="modal" data-bs-target="#update-profile-modal" />
                                    </div>
                                    <div class="col">
                                        <BIconTrash class="icon-color" @click="showDeleteModalConfirmation(user)" data-bs-toggle="modal" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3">
                                <select v-model="pagination" @change="getUsers()" class="form-control">
                                    <option value="5">5</option>
                                    <option value="10" selected>10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                users per page
                            </td>
                            <td>Showing {{ from }} - {{ to }} of {{ total }}</td>
                            <td colspan="7">
    
                                <nav  aria-label="...">
                                    <ul class="pagination justify-content-end">
                                        <li class="page-item" :class="{disabled:firstPageUrl == null}"> 
                                            <span v-if="firstPageUrl == null" class="page-link">First</span>
                                            <a v-else class="page-link" @click="getUsers(1)">First</a>
                                        </li>
                                        <li class="page-item" :class="{disabled:prevPageUrl==null}">
                                            <span v-if="prevPageUrl == null" class="page-link">Previous</span>
                                            <a v-else class="page-link" @click="getUsers(--currentPage)">Previous</a>
                                        </li>
                                        <li class="page-item" :class="{active:link.active}" :aria-current="{page:link.active}" v-for="link in links">
                                            <span v-if="link.active" class="page-link">{{ link.label }}</span>
                                            <a v-else class="page-link" @click="getUsers()">{{ link.label }}</a>
                                        </li>
                                        <li class="page-item " :class="{ disabled: prevPageUrl == null }">
                                            <span v-if="prevPageUrl == null" class="page-link">Next</span>
                                            <a v-else class="page-link" @click="getUsers(++currentPage)">Next</a>
                                        </li>
                                        <li class="page-item " :class="{ disabled: lastPageUrl == null }"> 
                                            <span v-if="lastPageUrl == null" class="page-link">Last</span>
                                            <a v-else class="page-link" @click="getUsers(lastPage)">Last</a>
                                        </li>
                                    </ul>
                                </nav>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </main>
    </div>
</template>
<style></style>