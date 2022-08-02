import Vue from "vue";
import Vuex from "vuex";
import PerfectScrollbar from "vue2-perfect-scrollbar";

import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { router } from "./router";
import VueParticles from "vue-particles";
import store from "./store";
import setupInterceptors from "./services/setupInterceptors";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";

Vue.config.productionTip = false;
Vue.use(VueParticles);
Vue.use(Vuex);
Vue.use(PerfectScrollbar);

setupInterceptors(store);
export const bus = new Vue();
new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
