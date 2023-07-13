<script>
// import { RouterView, RouterLink } from 'vue-router';
import Nav from '../../components/Nav.vue';
import TopBar from "../../components/TopBar.vue";
import Progress from '../../components/Progress.vue';
import { BIconPeople, BIconBuilding, BIconWindowStack } from 'bootstrap-icons-vue';

export default {
    props: {
        "active": String,
        "user": Object
    },
    emits: ['locationChange'],
    components: {
        Nav, TopBar, Progress, BIconPeople, BIconBuilding, BIconWindowStack
    },
    data() {
        return {
            report: null,
        };
    },
    methods: {
        async getReport() {
            // this.isLoading = true;

            await this.axios.get(this.api + "/report").then((res) => {
                if (res.status == 200) {
                    this.report = res.data.data;
                    // let counter = 0;
                    // this.departments.forEach((depart) => {
                    //   depart.counter = ++counter;
                    // })
                }
            }).catch((err) => {
                const resData = err.response.data;
                this.title = resData.message;
                this.message = this.title;
            }).finally(() => {
                this.isLoading = false;
            });
        }
    },
    mounted() {
        this.$emit('locationChange', location.pathname);
        this.getReport();
    }
}
</script>

<template>
    <TopBar class="row m-auto" :user="user" title="Report" />
    <div class="row" style="width: 100%;">
        <Nav class="col-md-2" :user="user" :active="active" />
        <main class="col">
            <Progress class="text-center" v-if="isLoading" message="Retrieving statistics." />
            <h2 class="p-5" v-else-if="report == null">
                {{ message }}
            </h2>
            <div v-else class="p-3 container overflow-hidden text-start">
                <div class="p-3 container-bg row">
                    Instruments in all stores: {{ report.instrumentsNum }}
                    <br/>Instruments;
                    <div class="row mb-2" v-for="instrument in report.instruments">
                        <div class="col">
                            <label>Name:</label> {{ instrument.name }}
                        </div>
                        <div class="col">
                            <label>Description:</label> {{ instrument.description }}
                        </div>
                        <div class="col">
                            <label>Quantity:</label> {{ instrument.quantity }}
                        </div>
                         <div class="col">
                            <label>Code:</label> {{ instrument.code }}
                        </div>
                    </div>

                    Impared instruments;
                    <div class="row mb-2" v-for="imparedInstrument in report.imparedInstruments">
                        <div class="col">
                            <label>Name: </label>{{ imparedInstrument.instrument_id.name }}
                        </div>
                        <div class="col">
                            <label>Fault: </label>{{ imparedInstrument.fault }}
                        </div>
                        <div class="col">
                            <label>Description: </label>{{ imparedInstrument.description }}
                        </div>
                        <div class="col">
                            <label>Quantity: </label>{{ imparedInstrument.quantity }}
                        </div>
                        <div class="col">
                            <label>Store: </label>{{ imparedInstrument.store.name }}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style>
.summary {
    padding: 2em;
}
</style>
