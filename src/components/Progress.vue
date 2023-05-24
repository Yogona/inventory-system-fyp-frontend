<script>
export default {
    props: ["message"],
    data() {
        return {
            size: 10,
            innerMsg: null,
        };
    },
    computed: {
        calculateSize(){
            return "width:" + this.size + "rem; height:" + this.size + "rem;";
        }
    },
    mounted() {
        this.innerMsg = this.message;
    }
}
</script>
<template>
    <div class="row justify-content-center text-center">
        <div class="spinner-border text-light" :style="calculateSize" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <strong>{{innerMsg}}</strong>
    </div>
</template>
<style></style>