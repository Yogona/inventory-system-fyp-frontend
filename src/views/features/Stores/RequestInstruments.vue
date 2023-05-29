<script>
import { BIconPenFill, BIconTrash } from 'bootstrap-icons-vue';
import Progress from '../../../components/Progress.vue';
export default {
    components: {
        BIconPenFill, BIconTrash, Progress
    },
    emits: ['backClicked'],
    props: ["user"],
    data() {
        return {
            isLoading: false,
            searchQuery: null,

            //Request instruments form
            id: null,
            storeSearch: "",
            storeId: null,
            instrumentSearch: "",
            quantity: null,
            selectedInstrument: null,
            attachedInstruments: [],
            assignmentTitle: null,
            file: null,
            days: null,
            allocatee: null,
    
            //Collections
            stores: null,
            instruments: null,
            requests: null,
            crs: null,
            

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
        async storeSearch(newVal) {
            if (newVal == "") {
                await this.getStores();
            } else {
                await this.searchStores();
            }
        },
        async instrumentSearch(newVal) {
            if (newVal == "") {
                await this.getInstruments();
            } else {
                await this.searchInstruments();
            }
        },
        async storeId() {
            await this.getInstruments();
        }
    },
    methods: {
        fetchResponseData(res) {
            const data = res.data.data;
            this.requests = data.data;
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
        async getRequests() {
            this.isLoading = true;

            await this.axios.get(this.api + "/requests/records/" + this.records + "?page" + this.currentPage)
            .then((res) => {
                    this.title = "Success";
                if (res.status == 200) {
                    this.fetchResponseData(res);
                    this.message = res.data.message;
                }
            }).catch((err) => {
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.requests = resData.data;
                    this.message = resData.message;
                }
            }).finally(() => {
                this.isLoading = false;
            });
        },
        async getStores() {
            await this.axios.get(this.api + "/stores")
            .then((res) => {
                if (res.status == 200) {
                    this.stores = res.data.data;
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
        async searchStores() {
            await this.axios.get(
                this.api + "/stores/search/" + this.storeSearch
            ).then((res) => {
                if (res.status == 200) {
                    this.stores = res.data.data;
                }
            }).catch((err) => {
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.stores = resData.data;
                    this.message = resData.message;
                }
            });
        },
        async getInstruments() {
            await this.axios.get(
                this.api + "/instruments/store/" + this.storeId
            ).then((res) => {
                if (res.status == 200) {
                    this.instruments = res.data.data;
                } 
            }).catch((err) => {
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.instruments = resData.data;
                    this.message = resData.message;
                }
            });
        },
        async searchStores() {
            await this.axios.get(
                this.api + "/instruments/search/" + this.instrumentSearch
            ).then((res) => {
                if (res.status == 200) {
                    this.instruments = res.data.data;
                }
            }).catch((err) => {
                console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.stores = resData.data;
                    this.message = resData.message;
                }
            });
        },
        async getCRs() {
            await this.axios.get(
                this.api + "/users/role/" + 5
            ).then((res) => {
                if (res.status == 200) {
                    this.crs = res.data.data;
                } 
            }).catch((err) => {
                console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.crs = resData.data;
                    this.message = resData.message;
                }
            });
        },
        async requestInstruments() {
            if (this.$refs.requestInstrumentsForm.checkValidity()) {
                this.isLoading = true;

                let formData = new FormData();
                formData.append("store_id", this.storeId);
                /*
                    Stringify makes array to be string and not object 
                    so it can be decoded to array at the server side
                */
                formData.append("instruments", JSON.stringify(this.attachedInstruments));
                formData.append("title", this.assignmentTitle);
                formData.append("attachment", this.file);
                formData.append("days", this.days);
                formData.append("allocatee", this.allocatee);

                await this.axios.post(this.api + "/requests/place", formData).then((res) => {
                    this.title = "Success";

                    if (res.status == 201) {
                        this.storeId        = null;
                        this.instrumentId   = null;
                        this.quantity       = null;
                        this.days           = null;
                        this.allocatee = null;
                        
                        this.message = res.data.message;
                        this.getRequests();
                    }
                }).catch((err) => {
                    const res = err.response;
                    const resData = res.data;

                    this.title = "Failure"
                    if (res.status == 422) {
                        this.title = resData.message;
                        this.message = resData.data;
                    } else {
                        this.message = resData.message;
                    }
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });
            }
        },
        attachInstrument() {
            if (this.selectedInstrument == null) {
                this.title = "Empty";
                this.message = "Please select instrument.";
                this.toast.show();
            } else {
                const data = {
                    "quantity": this.quantity,
                    "instrument_id": this.selectedInstrument.id,
                    "name": this.selectedInstrument.name
                };

                this.attachedInstruments.push(data);
                this.selectedInstrument = null;
                this.quantity = null;
            }
        },
        detachInstrument(instrumentId) {
            var index = 0;
            this.attachedInstruments.forEach((val) => {
                if (val.instrument_id == instrumentId) {
                    this.attachedInstruments.splice(index, 1);
                }
                ++index;
            });
            // this.attachedInstruments.splice(index,1);
        },
        getAttachedFile(event) {
            this.file = event.target.files[0];
        },
        showDeleteModalConfirmation(request) {
            this.id = request.id;
            this.deleteModal = this.Modal.getOrCreateInstance(
                document.getElementById("delete-request-modal"), { backdrop: "static", keyboard: false }
            );
            this.deleteModal.show();
        },
        async deleteRequest() {
             this.isLoading = true;

            await this.axios.delete(this.api + "/requests/delete/" + this.id).then((res) => {
                const resData = res.data;
                this.title = "Success";
                this.message = resData.message;
                this.getRequests();
            }).catch((err) => {
                console.log(err);
                const res = err.response;
                const resData = res.data;

                this.title = "Failure";
                this.message = resData.message;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
                this.deleteModal.hide();
            });
        },
        preFillUpdatingFields(request) {
            this.id = request.id;
            this.allocatee              = request.allocatee.id;
            this.selectedInstrument     = request.instrument_id;
            this.quantity               = request.quantity;
            this.days                   = request.days;
        },
        async updateRequest() {
            if (this.$refs.updateRequestForm.checkValidity()) {
                this.isLoading = true;

                const data = {
                    "allocatee": this.allocatee,
                    "instrument_id": this.selectedInstrument.id,
                    "quantity": this.quantity,
                    "days": this.days
                };

                this.axios.put(this.api + "/requests/update/" + this.id, data).then((res) => {
                    this.message = res.data.message;
                    this.title = "Succeeded!";
                    this.getRequests();
                }).catch((err) => {
                    const resData = err.response.data;
                    this.title = resData.messsage;
                    this.message = resData.data;
                }).finally(() => {
                    this.isLoading = false;
                    this.toast.show();
                });

            }
        },
        async allocate(request) {
            this.isLoading = true;

            this.axios.patch(this.api + "/requests/allocate/" + request.id).then((res) => {
                this.message = res.data.message;
                this.title = "Success";
                this.getRequests();
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.messsage;
                this.message = resData.data;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
            });
        },
        async deallocate(request) {console.log(request)
            this.isLoading = true;

            this.axios.patch(this.api + "/requests/deallocate/" + request.id).then((res) => {
                this.message = res.data.message;
                this.title = "Success";
                this.getRequests();
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.messsage;
                this.message = resData.data;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
            });
        }
    },
    async mounted() {
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
        await this.getStores();
        await this.getRequests();
        await this.getCRs();
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

        <!-- Request Instruments Modal -->
        <div class="modal fade" id="request-instruments-modal" tabindex="-1"
            aria-labelledby="requestInstrumentsLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content container-bg">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="requestInstrumentsLabel">Request Instruments</h1>
                        <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <form ref="requestInstrumentsForm" @submit.prevent="onSubmit">
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col">
                                    <label for="name" class="form-label">Store</label>
                                </div>
                                <div class="col-sm-5">
                                    <input type="search" placeholder="Search stores" v-model="storeSearch" class="form-control"/>
                                </div>
                                <div class="col-sm-5">
                                    <select placeholder="Select store" v-model="storeId" class="form-control" id="instruments-list" required>
                                        <option disabled>Select store</option>
                                        <option v-if="stores==null" disabled selected>
                                            No stores, or improve your search.
                                        </option>
                                        <option v-else v-for="store in stores" :value="store.id">
                                            {{ store.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <Transition name="bounce">
                            </Transition>
                            <div v-if="attachedInstruments.length == 0" class="row mb-2">
                                <em>No instruments attached</em>
                            </div>
                            <div v-else class="row mb-2">
                                <span @click="detachInstrument(attachedInstrument.instrument_id)" title="Click to remove" v-for="attachedInstrument in attachedInstruments" class="mb-2 mx-2 px-auto col-md-2 tile-accordion badge bg-primary">
                                    {{ attachedInstrument.name }}({{attachedInstrument.quantity}})
                                </span>
                            </div>

                            <div v-if="stores != null" class="row mb-3">
                                <div class="col">
                                    <label for="name" class="form-label">Instrument</label>
                                </div>
                                <div class="col-sm-4">
                                    <input type="search" placeholder="Search instruments." v-model="instrumentSearch" class="form-control" />
                                </div>
                                <div class="col-sm-5">
                                    <select placeholder="Select instrument" class="form-control" v-model="selectedInstrument">
                                        <option disabled>Select instrument</option>
                                        <option v-if="instruments == null" disabled selected>
                                            No instruments, or improve your search.
                                        </option>
                                        <option v-else v-for="instrument in instruments" :value="instrument">
                                            {{ instrument.name }}    
                                        </option>
                                    </select>
                                </div>
                                <div class="col-sm-8 my-2">
                                    <input id="quantity" placeholder="Enter quantity" v-model="quantity" class="form-control" />
                                </div>
                                <div class="col-sm my-2">
                                    <button type="button" @click="attachInstrument()" class="btn btn-secondary">Attach</button>
                                </div>
                            </div>
                            <div class="row mb-3"> 
                                <div class="col-3">
                                    <label for="name" class="form-label">Assignment</label>
                                </div>
                                <div class="col">
                                    <label for="name" class="form-label">Title</label>
                                    <input type="text" placeholder="Enter title for instruments assignment." v-model="assignmentTitle" class="form-control" required/>
                                </div>
                                <div class="col">
                                    <label for="name" class="form-label">Attachment</label>
                                    <input @change="getAttachedFile($event)" placeholder="Select assignment file" type="file" class="form-control mb-2" required />
                                </div>
                            </div>
                            <div class="row mb-3">
                                 <div class="col">
                                    <label for="days" class="form-label">Days</label>
                                    <input id="days" type="number" min="1" v-model="days" class="form-control" required />
                                </div>
                                <div class="col">
                                    <label for="allocatee" class="form-label">Allocatee</label>
                                    <select id="allocatee" placeholder="Select allocatee" class="form-control" v-model="allocatee">
                                        <option disabled>Select allocatee</option>
                                        <option v-if="crs == null">
                                            No CRs, or improve your search.
                                        </option>
                                        <option v-else v-for="cr in crs" :value="cr.id">
                                            {{ cr.first_name + " " + cr.last_name }}    
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" @click="requestInstruments()" class="btn btn-dark">
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

        <!-- Update Request Modal -->
        <div class="modal fade" id="update-request-modal" tabindex="-1"
            aria-labelledby="updateRequestLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content container-bg">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="updateRequestLabel">Update Request</h1>
                        <button type="button" class="btn-close bg-light" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <form ref="updateRequestForm" @submit.prevent="onSubmit">
                        <div class="modal-body">

                            <div class="row mb-3">
                                <div class="col">
                                    <label for="name" class="form-label">Instrument</label>
                                </div>
                                <div v-if="selectedInstrument != null" class="col-sm-4">
                                    {{ selectedInstrument.name }}
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col">
                                    <label for="days" class="form-label">Days</label>
                                    <input id="days" type="number" min="1" v-model="days" class="form-control" required />
                                </div>
                                <div class="col">
                                    <label for="quantity" class="form-label">Quantity</label>
                                    <input id="quantity" type="number" min="1" v-model="quantity" class="form-control" required />
                                </div>
                                <div class="col">
                                    <label for="allocatee" class="form-label">Allocatee</label>
                                    <select id="allocatee" placeholder="Select allocatee" class="form-control" v-model="allocatee">
                                        <option disabled>Select allocatee</option>
                                        <option v-if="crs == null">
                                            No CRs, or improve your search.
                                        </option>
                                        <option v-else v-for="cr in crs" :value="cr.id">
                                            {{ cr.first_name + " " + cr.last_name }}    
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" @click="updateRequest()" class="btn btn-dark">
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

        <!-- Delete Request Modal -->
        <div class="modal fade" id="delete-request-modal" tabindex="-1"
            aria-labelledby="deleteRequestLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content container-bg">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="deleteRequestLabel">Delete a department!</h1>
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
                        <button type="submit" :class="{ disabled: isLoading }" @click="deleteRequest()" class="btn btn-dark">
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
            <div class="col-md-6">
                <form class="d-flex" role="search">
                    <input  v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search" aria-label="Search">
                </form>
            </div>
            
            <div v-if="user.role_id == 1 || user.role_id == 4" class="col">
                <!-- Button triggers request instruments modal -->
                <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#request-instruments-modal">
                    Request Instruments
                </button>
            </div>
        </div>
        <div class="row justify-content-center">
            <Progress v-if="isLoading" message="Retrieving Instruments Requests" />
            <h2 class="p-5" v-else-if="requests == null">
                {{ message }}
            </h2>
            <h2 class="p-5" v-else-if="requests.length == 0">
                {{ message }}
            </h2>
            <div v-else>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Lecturer Names</th>
                            <th>CR Names</th>
                            <th>Instrument</th>
                            <th>Quantity</th>
                            <th>Days</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in requests">
                            <td>{{ request.id }}</td>
                            <td>{{ request.requester.first_name }} {{ request.requester.last_name }}</td>
                            <td>{{ request.allocatee.first_name }} {{ request.allocatee.last_name }}</td>
                            <td>{{ request.instrument_id.name }}</td>
                            <td>{{ request.quantity }}</td>
                            <td>{{ request.days }}</td>
                            <td>{{ request.deadline }}</td>
                            <th>{{ request.status_id.name }}</th>
                            <td>
                                <div class="row gx-2">
                                    <div v-if="(request.status_id.id == 1) && (user.role_id == 1 || user.role_id == 3)" class="col">
                                        <button type="button" :class="{ disabled: isLoading }" @click="allocate(request)" class="btn btn-success">
                                            <span :hidden="isLoading">Allocate</span>
                                            <div :hidden="!isLoading" class="spinner-border text-light" role="allocate-progress">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                        </button>
                                    </div>
                                    <div v-else-if="(request.status_id.id == 2) && (user.role_id == 1 || user.role_id == 3)" class="col">
                                        <button type="button" :class="{ disabled: isLoading }" @click="deallocate(request)" class="btn btn-danger">
                                            <span :hidden="isLoading">Deallocate</span>
                                            <div :hidden="!isLoading" class="spinner-border text-light" role="deallocate-progress">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                        </button>
                                    </div>
                                    <div v-if="request.status_id.id == 1" class="col">
                                        <BIconPenFill @click="preFillUpdatingFields(request)" class="icon-color" data-bs-toggle="modal" data-bs-target="#update-request-modal" />
                                    </div>
                                    <div v-if="request.status_id.id == 1" class="col">
                                        <BIconTrash class="icon-color" @click="showDeleteModalConfirmation(request)" data-bs-toggle="modal" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2">
                                <select v-model="records" @change="getRequests()" class="form-control">
                                    <option value="5">5</option>
                                    <option value="10" selected>10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                Requests per page
                            </td>
                            <td colspan="2">Showing {{ from }} - {{ to }} of {{ total }}</td>
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
    </div>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>