<script>
import { BIconPenFill, BIconTrash } from 'bootstrap-icons-vue';
import Progress from '../../../components/Progress.vue';

export default {
    emits: ['backClicked'],
    props: ['storeId', "user"],
    components: {
        BIconPenFill, BIconTrash, Progress
    },
    data() {
        return {
            isLoading: false,
            searchQuery: null,
            days: 1,
            assignmentId: null,

            //Collections
            assignments: null,

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
        searchQuery(newVal) {
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
            this.assignments = data.data;
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
        async getAssignments() {
            this.isLoading = true;

            await this.axios.get(
                this.api + "/assignments/store/" + this.storeId + "/records/" + this.records
            ).then((res) => {
                if (res.status == 200) {
                    this.fetchResponseData(res);
                    this.message = res.data.message;
                }
            }).catch((err) => {
                this.title = "Failure";
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.assignments = resData.data;
                    this.message = resData.message;
                }
            }).finally(() => {
                this.isLoading = false;
            });
        },
        async getInstruments(page) {
            await this.axios.get(this.api + "/instruments/store/" + this.storeId + "/records/" + this.records + "?page" + page)
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
            }).catch((err) => {
                console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.instruments = resData.data;
                    this.message = resData.message;
                }
            });
        },
        async requestExtension() {
            if (this.$refs.extensionRequestForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "days": this.days,
                    "store_id": this.storeId,
                    "assignment_id": this.assignmentId
                };

                this.axios.post(this.api + "/requests/extend", data).then((res) => {
                    this.title = "Success";

                    if (res.status == 201) {

                        this.days = 1;

                        this.message = res.data.message;
                    }
                }).catch((err) => {console.log(err)
                    this.title = "Failure";
                    this.message = err.response.data.message;
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
            }
        },
        setAssignmentId(assignment) {
            this.assignmentId = assignment.id;
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
                }).catch((err) => {
                    console.log(err)
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
        generateDownloadUri(filePath) {
            return this.api+"/download/" + filePath;
        }
    },
    computed: {
        
    },
    async mounted() {
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
        await this.getAssignments();
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
        <div class="modal fade" id="update-instrument-modal" tabindex="-1" aria-labelledby="updateInstrumentLabel"
            aria-hidden="true">
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
                                <input type="text" v-model="name" class="form-control" id="name" aria-describedby="name"
                                    required maxlength="50" />
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea v-model="description" class="form-control" id="description">
                        </textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
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
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
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

        <!-- Request Instruments Extension Modal -->
        <div class="modal fade" id="request-extension-modal" tabindex="-1"
            aria-labelledby="requestExtensionLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content container-bg">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="requestExtensionLabel">Request Instrument Extension</h1>
                        <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <form ref="extensionRequestForm" @submit.prevent="onSubmit">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="days" class="form-label">Days to extend</label>
                                <input type="number" v-model="days" class="form-control" id="days"
                                    aria-describedby="days" min="1" required />
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" @click="requestExtension()" class="btn btn-dark">
                                <span :hidden="isLoading">Request</span>
                                <div :hidden="!isLoading" class="spinner-border text-light" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="row mb-3 mt-2">
            <div class="col">
                <button @click="$emit('backClicked')" class="btn btn-secondary">Go to stores</button>
            </div>
            <div class="col">
                <h3>Assignments: </h3>
            </div>

            <div class="col-md-5">
                <form class="d-flex" role="search">
                    <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search"
                        aria-label="Search">
                </form>
            </div>
        </div>

        <div class="row justidy-content-center">
            <Progress v-if="isLoading" message="Retrieving Assignments" />
            <h2 class="p-5" v-else-if="assignments == null">
                {{ message }}
            </h2>
            <h2 class="p-5" v-else-if="assignments.length == 0">
                {{ message }}
            </h2>
            <table v-else class="table table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Title</th>
                        <th>Attachment</th>
                        <th>Creator</th>
                        <th>Assignee</th>
                        <th>Date</th>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="assignment in assignments">
                        <td>{{ assignment.id }}</td>
                        <td>{{ assignment.title }}</td>
                        <td><a :href="generateDownloadUri(assignment.file_path)" class="btn btn-primary" >Download</a></td>
                        <td>{{ assignment.creator.email }}</td>
                        <td>{{ assignment.assignee.email }}</td>
                        <td>{{ assignment.created_at }}</td>
                        <td>
                            <div v-if="(user.role_id == 1 || user.role_id == 3)" class="row gx-3">
                                <!-- Button trigger create user modal -->
                                <button @click="setAssignmentId(assignment)" type="button" class="btn btn-dark" data-bs-toggle="modal"
                                    data-bs-target="#request-extension-modal">
                                    Extend
                                </button>
                                <!-- <div class="col">
                                    <BIconPenFill @click="preFillUpdatingFields(instrument)" class="icon-color"
                                        data-bs-toggle="modal" data-bs-target="#update-instrument-modal" />
                                </div>
                                <div class="col">
                                    <BIconTrash class="icon-color" @click="showDeleteModalConfirmation(instrument)"
                                        data-bs-toggle="modal" />
                                </div> -->
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
    
                            <nav aria-label="...">
                                <ul class="pagination justify-content-end bg-dark">
                                    <li class="page-item" :class="{ disabled: firstPageUrl == null }">
                                        <span v-if="firstPageUrl == null" class="page-link">First</span>
                                        <a v-else class="page-link" @click="getInstruments(1)">First</a>
                                    </li>
                                    <li class="page-item" :class="{ disabled: prevPageUrl == null }">
                                        <span v-if="prevPageUrl == null" class="page-link">Previous</span>
                                        <a v-else class="page-link" @click="getInstruments(--currentPage)">Previous</a>
                                    </li>
                                    <li class="page-item" :class="{ active: link.active }" :aria-current="{ page: link.active }"
                                        v-for="link in links">
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