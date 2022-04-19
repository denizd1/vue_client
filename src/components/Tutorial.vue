<template>
  <v-row v-if="currentTutorial" class="py-3 px-10">
    <v-col cols="12" md="4" style="z-index: 4">
      <detail-table :currentTutorial="currentTutorial"></detail-table>
    </v-col>

    <v-col cols="12" md="8" style="z-index: 4" class="text-right">
      <map-view :currentTutorial="currentTutorial"></map-view>
      <v-btn class="mt-3" depressed color="primary" @click="exportExcel">
        Excel Olarak İndir
      </v-btn>
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
    exportExcel() {
      const XLSX = require("xlsx");
      const fileName = this.currentTutorial.nokta_adi + ".xlsx";
      const ws = XLSX.utils.json_to_sheet(
        JSON.parse(JSON.stringify([this.currentTutorial]))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.currentTutorial.nokta_adi);
      XLSX.writeFile(wb, fileName);
    },
  },
  async beforeRouteEnter(to, from, next) {
    let fetchTutorial = await TutorialDataService.get(to.params.id);
    next((vm) => {
      var thisPerson = vm.$store.state.auth.user;
      var thisUser = thisPerson.roles.includes("ROLE_USER");
      var thisAdmin = thisPerson.roles.includes("ROLE_ADMIN");
      var thisMod = thisPerson.roles.includes("ROLE_MODERATOR");

      if (thisPerson) {
        if (thisAdmin || thisMod) {
          vm.getTutorial(vm.$route.params.id);
        } else if (thisUser && fetchTutorial.data.published === true) {
          vm.getTutorial(vm.$route.params.id);
        } else {
          next({ name: "login" });
        }
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
