<script>
import {
  BIconSpeedometer,
  BIconBuildingFill,
  BIconPeopleFill,
  BIconShop
} from 'bootstrap-icons-vue';

export default {
  props: [
    "active", "user"
  ],
  components: {
    BIconSpeedometer,
    BIconBuildingFill,
    BIconPeopleFill,
    BIconShop
},
  data() {
    return {
      isDashboard: false,
      isDepartments: false,
      isUsers: false,
      isStores: false,
      dimensions: {
        navSpacing: 3,
      },
      styles: {
        iconStyle: "font-size: 1rem;",
    
      }
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
  computed: {
    calcNavSpacing() {
      return "mb-"+this.dimensions.navSpacing;
    },
    iconsStyle() {
      return "font-size: 1rem; position: relative; top: 0.7em";
    },
    canSeeNav() {
      return this.user.role_id == 1 || this.user.role_id == 2;
    }
  },
  mounted() {
    this.updateNavHighlight(this.active, true);
   
  }
}
</script>

<template>
  <nav v-if="canSeeNav" class="navbar navbar-expand-lg bg-body-tertiary align-self-start sticky-top">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
        <ul class="flex-column navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item ms-3" :class="calcNavSpacing">
            <RouterLink @click="$emit('menuSelection', 'dash')" class="nav-link" :class="{active:isDashboard}" :aria-current="{page:isDashboard}" to="/dashboard">
              <BIconSpeedometer class="me-3" :style="styles.iconStyle" />
              Dashboard
            </RouterLink>
          </li>
          <li v-if="canSeeNav" class="nav-item ms-3" :class="calcNavSpacing">
            <RouterLink class="nav-link col" :class="{ active: isDepartments }" :aria-current="{ page: isDepartments }" to="/departments">
              <BIconBuildingFill class="me-3" :style="styles.iconStyle" />
              Departments
            </RouterLink>
          </li>
          <li v-if="user.role_id == 1" class="nav-item ms-3" :class="calcNavSpacing">
            <RouterLink class="nav-link col" :class="{active:isUsers}" :aria-current="{ page: isUsers }" to="/users">
              <BIconPeopleFill class="me-3" :style="styles.iconStyle" />
              Users
            </RouterLink>
          </li>
          <li class="nav-item mb-3 ms-3">
            <RouterLink @click="expandCollapseStores()" class="nav-link" :class="{ active: isStores }" :aria-current="{ page: isStores }" to="/stores">
              <BIconShop class="me-3" :style="styles.iconStyle" />
              Stores
            </RouterLink>
          </li>
          
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-item:hover{
  background-color: rgb(29, 53, 88);
}
nav-link{
  text-align: center;
  border-radius: 5px 5px 5px 5px;
}
nav.navbar{
background-color: #394867;
}

@media(min-width: 1024px){
  nav{
    height:36.2em;
  }

  #navbarTogglerDemo02{
    position: absolute;
    top: -15em;
  }
}
</style>
