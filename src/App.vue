<template>
  <v-app style="background: transparent">
    <left-nav></left-nav>
    <!-- <header>
      <v-img
        class="mta-logo mx-auto"
        src="../src/assets/logo.png"
        alt="MTA logo"
      ></v-img>
    </header> -->
    <v-main>
      <v-container fluid>
        <bread-crumb></bread-crumb>
        <router-view />
      </v-container>
    </v-main>
    <v-footer absolute padless app color="transparent">
      <v-col transparent class="text-center" cols="12">
        Her Hakkı Saklıdır © MTA {{ new Date().getFullYear() }}
      </v-col>
    </v-footer>
    <vue-particles
      class="particle-bg"
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
    };
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
  },
  mounted() {
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 99%;
}
</style>
