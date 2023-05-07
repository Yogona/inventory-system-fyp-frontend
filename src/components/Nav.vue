<script>

</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary bg-dark">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
        <ul class="flex-column navbar-nav me-auto mb-2 mb-lg-0 white-text">
          <RouterLink class="navbar-brand white-text" to="/dashboard">Inventory System</RouterLink>
          <li class="nav-item">
            <RouterLink class="nav-link active" aria-current="page" to="/dashboard">Dashboard</RouterLink>
          </li>
          <li class="nav-item">
              <RouterLink class="nav-link" to="/departments">Departments</RouterLink>
            </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/users">Users</RouterLink>
          </li>
          <!-- <li class="nav-item">
            <RouterLink class="nav-link" to="/stores">Stores</RouterLink>
          </li> -->
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
