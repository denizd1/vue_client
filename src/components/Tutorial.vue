<template>
  <v-row v-if="currentTutorial" class="py-3 px-10">
    <v-col cols="12" md="4" style="z-index: 4">
      <detail-table :currentTutorial="currentTutorial"></detail-table>
    </v-col>

    <v-col cols="12" md="8" style="z-index: 4">
      <map-view :currentTutorial="currentTutorial"></map-view>
    </v-col>
  </v-row>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";

import MapView from "./MapView.vue";
import DetailTable from "./DetailTable.vue";

export default {
  name: "tutorial",
  data() {
    return {
      currentTutorial: null,
    };
  },
  components: {
    DetailTable,
    MapView,
  },

  methods: {
    getTutorial(id) {
      TutorialDataService.get(id)
        .then((response) => {
          this.currentTutorial = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.$store.state.auth.user) {
        vm.getTutorial(vm.$route.params.id);
      } else {
        next({ name: "login" });
      }
    });
  },
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
  position: relative;
  z-index: 99;
}
</style>
