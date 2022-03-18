<template>
  <v-app>
    <left-nav></left-nav>
    <!-- <header>
      <v-img
        class="mta-logo mx-auto"
        src="../src/assets/logo.png"
        alt="MTA logo"
      ></v-img>
    </header> -->
    <v-main>
      <router-view />
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
      >
      </vue-particles>
    </v-main>
    <v-footer absolute padless app color="transparent">
      <v-col class="text-center" cols="12">
        Her Hakkı Saklıdır © MTA {{ new Date().getFullYear() }}
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import EventBus from "./common/EventBus";
import LeftNav from "./components/LeftNav.vue";

export default {
  components: {
    LeftNav,
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    isUseradmin() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_ADMIN");
      }
      return false;
    },
    isUsermoderator() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_MODERATOR");
      }
      return false;
    },
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
  height: 100%;
}

/* .particle-wrap:before {
  content: " ";
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  background-image: url("https://logowik.com/content/uploads/images/742_mta.jpg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: 40%;
} */
</style>
