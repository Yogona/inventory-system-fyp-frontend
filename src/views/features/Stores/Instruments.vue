<script>
import { BIconPenFill, BIconTrash } from 'bootstrap-icons-vue';
import Progress from '../../../components/Progress.vue';

export default {
    emits: ['backClicked'],
    props: ['storeId', "user"],
    components: {
        BIconPenFill, BIconTrash, Progress,
    },
    data() {
        return {
            isLoading: false,
            searchQuery: null,

            //Instrument data
            id: null,
            name: null,
            description: null,
            code: null,
            quantity: null,

            //Collections
            instruments: null,

            //Pagination
            records: 10,
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

            //Feedback
            title: null,
            message: null,
            toast: null,
        };
    },
    watch: {
        searchQuery(newVal, oldVal) {
            if (newVal == "") {
                this.getInstruments(this.currentPage);
            } else {
                this.searchInstruments();
            }
        }
    },
    methods: {
        fetchResponseData(res) {
            const data = res.data.data;
            this.instruments = data.data;
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
                if (!(index == 0 || index == (this.links.length - 1))) {
                    tempLinks.push(val);
                }
                ++index;
            });
            this.links = tempLinks;
        },
        async getInstruments() {
            // this.isLoading = true;

            await this.axios.get(
                this.api + "/instruments/store/" + this.storeId + "/records/" + this.records
            ).then((res) => {
                if (res.status == 200) {
                    this.instruments = res.data.data;
                }console.log(res)
            }).catch((err) => {console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.instruments = resData.data;
                    this.message = resData.message;
                }
            }).finally(() => {
                // this.isLoading = false;
            });
        },
        async getInstruments(page) {
            this.isLoading = true;

            await this.axios.get(this.api + "/instruments/store/" + this.storeId + "/records/" + this.records + "?page"+page)
            .then((res) => {
                if (res.status == 200) {
                    this.fetchResponseData(res);
                } 
            }).catch((err) => {
                console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.instruments = resData.data;
                    this.message = resData.message;
                }
            }).finally(() => {
                this.isLoading = false;
            });
        },
        async searchInstruments() {
            await this.axios.get(
                this.api + "/instruments/store/" + this.storeId + "/search/" + this.searchQuery
                + "/records/" + this.records + "?page=" + this.currentPage
            ).then((res) => {
                if (res.status == 200) {
                    this.fetchResponseData(res);
                }
            }).catch((err) => {console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.instruments = resData.data;
                    this.message = resData.message;
                }
            });
        },
        async registerInstrument() {
            if (this.$refs.registerInstrumentsForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "name": this.name,
                    "description": this.description,
                    "code": this.code,
                    "quantity": this.quantity,
                    "store_id": this.storeId
                };

                this.axios.post(this.api + "/instruments/create", data).then((res) => {
                    this.title = "Succeeded";

                    if (res.status == 201) {

                        this.name = null;
                        this.description = null;
                        this.code = null;
                        this.quantity = null;

                        this.message = res.data.message;
                        this.getInstruments();
                    }
                }).catch((err) => {
                    this.title = "Failed!";
                    this.message = err.response.data.message;
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
            }
        },
        preFillUpdatingFields(instrument) {
            this.id = instrument.id;
            this.name = instrument.name;
            this.description = instrument.description;
        },
        async updateInstrument() {
            if (this.$refs.updateForm.checkValidity()) {
                this.isLoading = true;
    
                //We set null because avoids prec notification to be shown on next notification
                this.title = null;
                this.message = null;
    
    
                const data = {
                    "name": this.name,
                    "description": this.description,
                };
    
                this.axios.put(this.api + "/instruments/update/" + this.id, data).then((res) => {
                    this.message = res.data.message;
                    this.title = "Succeeded!";
                    this.getInstruments();
                }).catch((err) => {console.log(err)
                    const resData = err.response.data;
                    this.title = resData.messsage;
                    this.message = resData.data;
                }).finally(() => {
                    this.isLoading = false;
                    this.Toast.getOrCreateInstance(this.$refs.feedbackToast).show();
                });
                
            }
        },
        showDeleteModalConfirmation(instrument) {
            this.id = instrument.id;
            this.deleteModal = this.Modal.getOrCreateInstance(
                document.getElementById("delete-instrument-modal"), { backdrop: "static", keyboard: false }
            );
            this.deleteModal.show();
        },
        async deleteInstrument() {
            this.isLoading = true;

            this.axios.delete(this.api + "/instruments/delete/" + this.id).then((res) => {
                const resData = res.data;
                this.title = "Succeeded!";
                this.message = resData.message;
                this.getInstruments();
            }).catch((err) => {
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
    },
    computed: {
        
    },
    async mounted() {
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
        await this.getInstruments();
    }
};
</script>

<template>
    <div class="row">
        <!-- Toast -->
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

        <!-- Update Instrument Modal -->
        <div class="modal fade" id="update-instrument-modal" tabindex="-1"
            aria-labelledby="updateInstrumentLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content container-bg">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="updateInstrumentLabel">Update an instrument</h1>
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
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" @click="updateInstrument()" class="btn btn-dark">
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

        <!-- Delete Instrument Modal -->
        <div ref="deleteModal" class="modal fade" id="delete-instrument-modal" tabindex="-1"
            aria-labelledby="deleteInstrumentLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content container-bg">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="deleteInstrumentLabel">Delete an instrument!</h1>
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
                        <button type="submit" @click="deleteInstrument()" class="btn btn-dark">
                            <span :hidden="isLoading">Yes</span>
                            <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-3 mt-2">
             <div class="col">
                <button @click="$emit('backClicked')" class="btn btn-secondary">Go to stores</button>
            </div>
            <div class="col">
                <h3>Instruments: </h3>
            </div>
    
            <div class="col-md-5">
                <form class="d-flex" role="search">
                    <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search"
                        aria-label="Search">
                </form>
            </div>
            <div v-if="(user.role_id == 1 || user.role_id == 3)" class="col">
                <!-- Button trigger create user modal -->
                <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#register-instruments-modal">
                    Register
                </button>
    
                <!-- Request Instruments Modal -->
                <div class="modal fade" id="register-instruments-modal" tabindex="-1" aria-labelledby="registerInstrumentsLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content container-bg">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="registerInstrumentsLabel">Register Instrument</h1>
                                <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <form ref="registerInstrumentsForm" @submit.prevent="onSubmit">
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <label for="name" class="form-label">Name</label>
                                        <input type="text" v-model="name" class="form-control" id="name" aria-describedby="name"
                                            required/>
                                    </div>
                                    <div class="mb-3">
                                        <label for="description" class="form-label">Description</label>
                                        <textarea v-model="description" class="form-control" id="description" required>
                                        </textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label for="code" class="form-label">Item Code</label>
                                        <input type="text" v-model="code" class="form-control" id="code" autocomplete="true"
                                            required minlength="3" maxlength="5" />
                                    </div>
                                    <div class="mb-3">
                                        <label for="quantity" class="form-label">Quantity</label>
                                        <input type="number" v-model="quantity" class="form-control" id="quantity" autocomplete="true"
                                            required min="1" />
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" @click="registerInstrument()" class="btn btn-dark">
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
        <div class="row justify-content-center">
            <Progress v-if="isLoading" message="Retrieving Instruments" />
            <h2 class="p-5" v-else-if="instruments == null">
                {{ message }}
            </h2>
            <h2 class="p-5" v-else-if="instruments.length == 0">
                {{ message }}
            </h2>
            <table v-else class="table table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Code</th>
                        <th>Added by</th>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="instrument in instruments">
                        <td>{{ instrument.id }}</td>
                        <td>{{ instrument.name }}</td>
                        <td>{{ instrument.description }}</td>
                        <td>{{ instrument.quantity }}</td>
                        <td>{{ instrument.code }}</td>
                        <td>{{ instrument.added_by }}</td>
                        <td>
                            <div v-if="(user.role_id == 1 || user.role_id == 3)" class="row gx-3">
                                <div class="col">
                                    <BIconPenFill @click="preFillUpdatingFields(instrument)" class="icon-color" data-bs-toggle="modal" data-bs-target="#update-instrument-modal" />
                                </div>
                                <div class="col">
                                    <BIconTrash class="icon-color" @click="showDeleteModalConfirmation(instrument)" data-bs-toggle="modal" />
                                </div>
                            </div>
                        </td>
                    </tr>
                
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="1">
                            <select v-model="records" @change="getUsers()" class="form-control">
                                <option value="5">5</option>
                                <option value="10" selected>10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            instruments per page
                        </td>
                        <td>Showing {{ from }} - {{ to }} of {{ total }}</td>
                        <td colspan="7">
    
                            <nav  aria-label="...">
                                <ul class="pagination justify-content-end bg-dark">
                                    <li class="page-item" :class="{ disabled: firstPageUrl == null }"> 
                                        <span v-if="firstPageUrl == null" class="page-link">First</span>
                                        <a v-else class="page-link" @click="getInstruments(1)">First</a>
                                    </li>
                                    <li class="page-item" :class="{ disabled: prevPageUrl == null }">
                                        <span v-if="prevPageUrl == null" class="page-link">Previous</span>
                                        <a v-else class="page-link" @click="getInstruments(--currentPage)">Previous</a>
                                    </li>
                                    <li class="page-item" :class="{ active: link.active }" :aria-current="{ page: link.active }" v-for="link in links">
                                        <span v-if="link.active" class="page-link">{{ link.label }}</span>
                                        <a v-else class="page-link" @click="getInstruments()">{{ link.label }}</a>
                                    </li>
                                    <li class="page-item " :class="{ disabled: prevPageUrl == null }">
                                        <span v-if="prevPageUrl == null" class="page-link">Next</span>
                                        <a v-else class="page-link" @click="getInstruments(++currentPage)">Next</a>
                                    </li>
                                    <li class="page-item " :class="{ disabled: lastPageUrl == null }"> 
                                        <span v-if="lastPageUrl == null" class="page-link">Last</span>
                                        <a v-else class="page-link" @click="getInstruments(lastPage)">Last</a>
                                    </li>
                                </ul>
                            </nav>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<style></style>