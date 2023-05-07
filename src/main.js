import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import axios from 'axios';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App);

app.use(router);

axios.defaults.withCredentials = true;
app.config.globalProperties.axios = axios;
const origin = "http://localhost:8000";
app.config.globalProperties.origin = origin;
app.config.globalProperties.api = origin+"/api";

app.mount('#app')
