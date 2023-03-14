<template>
  <v-app style="background: transparent">
    <v-overlay style="z-index: 66" v-if="loading">
      <v-layout align-center justify-center column fill-height>
        <v-flex row align-center>
          <v-progress-circular
            :size="100"
            :width="7"
            color="red"
            indeterminate
          ></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-overlay>
    <left-nav v-if="!$route.meta.hideNavbar"></left-nav>
    <v-main>
      <v-container fluid class="fill-height">
        <bread-crumb v-if="!$route.meta.hideNavbar"></bread-crumb>
        <router-view />
      </v-container>
    </v-main>
    <v-footer absolute padless app color="transparent">
      <v-col
        transparent
        :class="{ colorWhite: isLoginScreen }"
        class="text-center"
        cols="12"
      >
        Her Hakkı Saklıdır © MTA {{ new Date().getFullYear() }}
      </v-col>
    </v-footer>
    <vue-particles
      class="particle-bg"
      :class="{ withBG: isLoginScreen }"
      color="#dedede"
      :particleOpacity="0.7"
      :particlesNumber="300"
      shapeType="circle"
      :particleSize="4"
      linesColor="#dedede"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="3"
      :hoverEffect="false"
      :clickEffect="false"
      style="z-index: -1"
      :key="componentKey"
    >
    </vue-particles>
  </v-app>
</template>

<script>
import EventBus from "./common/EventBus";
import LeftNav from "./components/LeftNav.vue";
import BreadCrumb from "./components/BreadCrumb.vue";
import { bus } from "./main";

export default {
  components: {
    LeftNav,
    BreadCrumb,
  },
  data() {
    return {
      componentKey: 0,
      loading: false,
    };
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/giris");
    },
  },
  computed: {
    isLoginScreen() {
      return this.$route.path === "/giris";
    },
  },
  mounted() {
    bus.$on("loading", (value) => {
      this.loading = value;
    });
    EventBus.on("logout", () => {
      this.logOut();
    });
    bus.$on("reRender", () => {
      this.componentKey += 1;
    });
  },
  beforeDestroy() {
    EventBus.remove("logout");
  },
};
</script>
<style>
.particle-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.colorWhite {
  color: #fff;
}
.withBG {
  background-image: url("./assets/bg/2.jpg");
  background-position: bottom;
  background-repeat: no-repeat;
  background-color: black;
  background-size: cover;
}
label.theme--dark + input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: #fff !important; /* inherit only works in Safari */
  -webkit-text-size-adjust: inherit !important;
}

label.theme--light + input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: #000 !important; /* inherit only works in Safari */
  -webkit-text-size-adjust: inherit !important;
}

/* When dark theme, then make keychain icon white */
label.theme--dark + input::-webkit-credentials-auto-fill-button {
  background-color: #fff !important;
}

/* Hide credentials-auto-fill-button in password inputs, only visible on other inputs */
input[type="password"]::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  display: none !important;
  pointer-events: none;
}
</style>
