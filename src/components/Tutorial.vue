<template>
  <v-row v-if="currentTutorial">
    <v-col cols="12" md="4" style="z-index: 4">
      <detail-table :currentTutorial="currentTutorial"></detail-table>
    </v-col>

    <v-col cols="12" md="8" style="z-index: 4" class="text-right">
      <map-view :currentTutorial="currentTutorial"></map-view>
      <v-btn
        class="mt-3 mr-3"
        depressed
        color="primary"
        @click="exportExcel('xcelxport')"
      >
        Excel İndir
      </v-btn>
      <v-btn
        class="mt-3 mr-3"
        depressed
        color="primary"
        @click="exportExcel('kmlexport')"
      >
        KMZ İndir
      </v-btn>
      <v-btn
        v-if="visibility"
        class="mt-3"
        depressed
        color="primary"
        @click="goToedit"
      >
        Düzenle
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";

import MapView from "./MapView.vue";
import DetailTable from "./DetailTable.vue";
import { bus } from "../main";
import { addLinestoCollection } from "../common/KmzExport.js";

export default {
  name: "tutorial",
  data() {
    return {
      currentTutorial: null,
      visibility: false,
    };
  },
  components: {
    DetailTable,
    MapView,
  },

  methods: {
    goToedit() {
      this.$router.push({
        name: "duzenle",
        params: { id: this.currentTutorial.id },
      });
    },
    exportExcel(param) {
      if (param === "kmlexport") {
        // need to send a geojson object
        let point = {
          type: "Feature",
          properties: {
            nokta_adi: this.currentTutorial.nokta_adi,
            yontem: this.currentTutorial.yontem,
            alt_yontem: this.currentTutorial.alt_yontem,
            calisma_tarihi: this.currentTutorial.calisma_tarihi,
            calisma_amaci: this.currentTutorial.calisma_amaci,
            proje_kodu: this.currentTutorial.proje_kodu,
          },
          geometry: {
            type: "Point",
            coordinates: [this.currentTutorial.lat, this.currentTutorial.lon],
          },
        };
        //a featurecollection is needed. contains point as a feature
        let featureCollection = {
          type: "FeatureCollection",
          features: [point],
        };
        let resdata = { resPoints: featureCollection, resLines: [] };
        addLinestoCollection(resdata);
      } else if (param === "xcelxport") {
        this.exportExcelFile();
      }
    },
    exportExcelFile() {
      const XLSX = require("xlsx");
      const fileName = this.currentTutorial.nokta_adi + ".xlsx";

      delete this.currentTutorial.id;
      delete this.currentTutorial.published;
      delete this.currentTutorial.createdAt;
      delete this.currentTutorial.updatedAt;
      delete this.currentTutorial.editorname;

      const ws = XLSX.utils.json_to_sheet(
        JSON.parse(JSON.stringify([this.currentTutorial]))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sorgu Sonucu");
      XLSX.writeFile(wb, fileName);
    },
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      var thisPerson = vm.$store.state.auth.user;

      if (thisPerson) {
        var thisUser = thisPerson.roles.includes("ROLE_USER");
        var thisAdmin = thisPerson.roles.includes("ROLE_ADMIN");
        var thisMod = thisPerson.roles.includes("ROLE_MODERATOR");
        TutorialDataService.get(to.params.id).then((response) => {
          if (thisAdmin || thisMod) {
            vm.visibility = true;
            vm.currentTutorial = response.data;
          } else if (thisUser && response.data.published === true) {
            vm.currentTutorial = response.data;
          }
          bus.$emit("reRender");
        });
      } else {
        next({ name: "giris" });
      }
    });
  },
};
</script>
