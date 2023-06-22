<script>
import Progress from '../../../components/Progress.vue';

export default {
    props: ["storeId"],
    emits: ['backClicked'],
    components: {
        Progress,
    },
    data() {
        return {
            isLoading: false,

            collections: {
                impared: null
            },

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

            message: "Did not fetch impared instruments.",
        }
    },
    methods: {
        fetchResponseData(res) {
            const data = res.data.data;
            this.collections.impared = data.data;
            let counter = 0;
            this.collections.impared.forEach((req) => {
                req.counter = ++counter;
            });
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
        async getImpared() {
            this.isLoading = true;

            await this.axios.get(
                this.api + "/impared/store/" + this.storeId + "/records/" + this.records + "?page" + this.currentPage
            ).then((res) => {
                    // this.title = "Success";
                    if (res.status == 200) {
                        this.fetchResponseData(res);
                        this.message = res.data.message;
                    }
                }).catch((err) => {
                    const res = err.response;
                    const resData = res.data;
                    if (res.status == 404) {
                        this.impared = resData.data;
                        this.message = resData.message;
                    }
                }).finally(() => {
                    this.isLoading = false;
                });
        },
    },
    mounted() {
        this.getImpared();
    }
}
</script>

<template>
    <main class="row justify-content-center">
        <div class="row mb-3 mt-2">
            <div class="col">
                <button @click="$emit('backClicked')" class="btn btn-secondary">Go to stores</button>
            </div>
            <div class="col">
                <h3>Impared Instruments: </h3>
            </div>

            <div class="col-md-5">
                <form class="d-flex" role="search">
                    <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Type to search"
                        aria-label="Search">
                </form>
            </div>
        </div>
        <div class="row justify-content-center">
            <Progress v-if="isLoading" message="Retrieving Impared Instruments" />
            <h2 class="p-5" v-else-if="collections.impared == null">
                {{ message }}
            </h2>
            <h2 class="p-5" v-else-if="collections.impared.length == 0">
                {{ message }}
            </h2>
            <table v-else class="table table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Instrument</th>
                        <th>Fault</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Responsible</th>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="impared in collections.impared">
                        <td>{{ impared.id }}</td>
                        <td>{{ impared.instrument_id.name }}</td>
                        <td>{{ impared.fault }}</td>
                        <td>{{ impared.description }}</td>
                        <td>{{ impared.quantity }}</td>
                        <td>{{ impared.responsible_user.first_name }} {{ impared.responsible_user.last_name }}</td>
                        <td>
                            <!-- <div v-if="(user.role_id == 1 || user.role_id == 3)" class="row gx-3">
                                <div class="col">
                                    <BIconPenFill @click="preFillUpdatingFields(instrument)" class="icon-color" data-bs-toggle="modal" data-bs-target="#update-instrument-modal" />
                                </div>
                                <div class="col">
                                    <BIconTrash class="icon-color" @click="showDeleteModalConfirmation(instrument)" data-bs-toggle="modal" />
                                </div>
                            </div> -->
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
                                <ul class="pagination justify-content-end">
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
    </main>
</template>

<style></style>