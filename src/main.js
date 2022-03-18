import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { router } from './router'
import VueParticles from 'vue-particles'
// import 'bootstrap/dist/css/bootstrap.css'
import store from './store';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VeeValidate, {Validator} from 'vee-validate';
import tr from 'vee-validate/dist/locale/tr'


import Vuex from 'vuex';
// import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import {
//   faHome,
//   faUser,
//   faUserPlus,
//   faSignInAlt,
//   faSignOutAlt,
//   faProjectDiagram,
//   faTasks
// } from '@fortawesome/free-solid-svg-icons';

import setupInterceptors from './services/setupInterceptors';



// library.add(faHome, faUser, faUserPlus, faSignInAlt, faSignOutAlt,faProjectDiagram,faTasks);


Vue.config.productionTip = false;
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(VueParticles);
Vue.use(Vuex);
Vue.use(VeeValidate);
Validator.localize('tr', tr)

setupInterceptors(store);
export const bus = new Vue();
new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
