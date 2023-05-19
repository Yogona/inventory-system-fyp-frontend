<script>
export default {
  props: [
    "active"
  ],
  data() {
    return {
      isDashboard: false,
      isDepartments: false,
      isUsers: false,
      isStores: false,
    };
  },
  watch: {
    active(newVal, oldVal) {
      this.updateNavHighlight(oldVal, false);
      this.updateNavHighlight(newVal, true);
    }
  },
  methods: {
    updateNavHighlight(path, isActive) {
      if (path == "/dashboard") {
        this.isDashboard = isActive;
      } else if (path == "/departments") {
        this.isDepartments = isActive;
      } else if (path == "/users") {
        this.isUsers = isActive;
      } else if (path == "/stores") {
        this.isStores = isActive;
      }
    },
    expandCollapseStores() {
      this.expandStores = !this.expandStores;
    },
      
  },
  mounted() {
    this.updateNavHighlight(this.active, true);
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary bg-dark align-self-start sticky-top">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
        <ul class="flex-column navbar-nav me-auto mb-2 mb-lg-0 white-text">
          <li class="nav-item mb-3 ms-3">
            <RouterLink @click="$emit('menuSelection', 'dash')" class="nav-link" :class="{active:isDashboard}" :aria-current="{page:isDashboard}" to="/dashboard">Dashboard</RouterLink>
          </li>
          <li class="nav-item mb-3 ms-3">
              <RouterLink class="nav-link" :class="{ active: isDepartments }" :aria-current="{ page: isDepartments }" to="/departments">Departments</RouterLink>
            </li>
          <li class="nav-item mb-3 ms-3">
            <RouterLink class="nav-link" :class="{active:isUsers}" :aria-current="{ page: isUsers }" to="/users">Users</RouterLink>
          </li>
          <li class="nav-item mb-3 ms-3">
            <RouterLink @click="expandCollapseStores()" class="nav-link" :class="{ active: isStores }" :aria-current="{ page: isStores }" to="/stores">Stores</RouterLink>
          </li>
          
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
li{
  text-align: center;
  border: 1px rgb(29, 53, 88) solid;
  border-radius: 5px 5px 5px 5px;
}
</style>
