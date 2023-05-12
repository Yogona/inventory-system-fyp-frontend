import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import axios from 'axios';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Toast, Modal } from 'bootstrap';

const app = createApp(App);

app.use(router);

axios.defaults.withCredentials = true;
app.config.globalProperties.axios = axios;
app.config.globalProperties.Toast = Toast;
app.config.globalProperties.Modal = Modal;
const origin = "http://localhost:8000";
app.config.globalProperties.origin = origin;
app.config.globalProperties.api = origin+"/api";

app.mount('#app')
