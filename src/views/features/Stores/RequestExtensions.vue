<script>
import { BIconPenFill, BIconTrash } from 'bootstrap-icons-vue';
export default {
    components: {
        BIconPenFill, BIconTrash
    },
    props: ["storeId"],
    emits: ['backClicked'],
    data() {
        return {
            isLoading: false,
            searchQuery: null,

            //Collections
            extensions: null,

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
            extMessage: null,
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
            this.extensions = data.data;
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
        async getExtensions() {
            await this.axios.get(
                this.api + "/requests/extensions/store/" + this.storeId +
                "/records/" + this.records + "?page" + this.currentPage
            ).then((res) => {
                    this.title = "Success";
                    if (res.status == 200) {
                        this.fetchResponseData(res);
                        this.extMessage = res.data.message;
                    }
                }).catch((err) => {
                    const res = err.response;
                    const resData = res.data;
                    if (res.status == 404) {
                        this.requests = resData.data;
                        this.extMessage = resData.message;
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
                console.log(err)
                const res = err.response;
                const resData = res.data;
                if (res.status == 404) {
                    this.stores = resData.data;
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
      
        showDeleteModalConfirmation(request) {
            this.id = request.id;
            this.deleteModal = this.Modal.getOrCreateInstance(
                document.getElementById("delete-request-modal"), { backdrop: "static", keyboard: false }
            );
            this.deleteModal.show();
        },
        async deleteExtension(ext) {
            this.isLoading = true;

            await this.axios.delete(this.api + "/requests/delete-extension/" + ext.id).then((res) => {
                const resData = res.data;
                this.title = "Success";
                this.message = resData.message;
                
            }).catch((err) => {
                const res = err.response;
                const resData = res.data;

                this.title = "Failure";
                this.message = resData.message;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
                // this.deleteModal.hide();
                this.getExtensions();
            });
        },
        async approveExtension(ext) {
            this.isLoading = true;

            await this.axios.patch(this.api + "/requests/approve-extension/" + ext.id).then((res) => {
                this.message = res.data.message;
                this.title = "Succeeded!";
                this.getExtensions();
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.messsage;
                this.message = resData.data;
            }).finally(() => {
                this.isLoading = false;
                this.toast.show();
            });
        },
    },
    async mounted() {
        this.toast = this.Toast.getOrCreateInstance(this.$refs.feedbackToast);
        await this.getExtensions();
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

        <!-- Delete Request Modal -->
        <div class="modal fade" id="delete-request-modal" tabindex="-1" aria-labelledby="deleteRequestLabel"
            aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
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
                        <button type="submit" :class="{ disabled: isLoading }" @click="deleteRequest()"
                            class="btn btn-dark">
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
                <h3>Extensions: </h3>
            </div>
            <div class="col-md-6">
                <form class="d-flex" role="search">
                    <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search"
                        aria-label="Search">
                </form>
            </div>
        </div>
        <h2 class="p-5" v-if="extensions == null">
            {{ extMessage }}
        </h2>
        <h2 class="p-5" v-else-if="extensions.length == 0">
            {{ extMessage }}
        </h2>
        <div v-else>
            <table class="table table-dark table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Assignment</th>
                        <th>Requestor</th>
                        <th>Days</th>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="extension in extensions">
                        <td>{{ extension.id }}</td>
                        <td>{{ extension.assignment.title }}</td>
                        <td>{{ extension.requester.email }}</td>
                        <td>{{ extension.extra_days }}</td>
                        <td>
                            <div class="row gx-2">
                                <div class="col">
                                    <button type="button" :class="{ disabled: isLoading }" @click="approveExtension(extension)"
                                        class="btn btn-success">
                                        <span :hidden="isLoading">Approve</span>
                                        <div :hidden="!isLoading" class="spinner-border text-light"
                                            role="allocate-progress">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </button>
                                </div>
                                <div class="col">
                                    <button type="button" :class="{ disabled: isLoading }" @click="deleteExtension(extension)"
                                        class="btn btn-danger">
                                        <span :hidden="isLoading">Delete</span>
                                        <div :hidden="!isLoading" class="spinner-border text-light"
                                            role="deallocate-progress">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>

                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">
                            <select v-model="records" @change="getExtensions()" class="form-control">
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
                                    <li class="page-item" :class="{ active: link.active }"
                                        :aria-current="{ page: link.active }" v-for="link in links">
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

<style>
</style>