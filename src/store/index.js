import Vue from "vue";
import Vuex from "vuex";

import { auth } from "./auth.module";
import { searchParam } from "./search.module";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    searchParam,
  },
});
