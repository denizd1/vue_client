<template>
  <v-col>
    <v-overlay v-if="loading">
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

    <v-tabs centered v-model="tab" style="position: relative; z-index: 4">
      <v-tab href="#listView">Liste Görünümü</v-tab>
      <v-tab @click="reloadMap()" href="#mapView">Harita Görünümü</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item :key="1" value="listView" :eager="true">
        <v-row class="list px-3 mx-auto">
          <v-col cols="8">
            <v-text-field
              v-on:keyup.enter="
                page = 1;
                retrieveTutorials(searchTitle);
              "
              v-model="searchTitle"
              label="Arama"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-card-actions class="justify-left mt-3">
              <v-btn
                small
                @click="
                  page = 1;
                  retrieveTutorials(searchTitle);
                "
              >
                <v-icon>mdi-database-search-outline</v-icon>
              </v-btn>
            </v-card-actions>
          </v-col>
          <!-- <search-detail></search-detail> -->
          <v-col cols="12" sm="12">
            <v-row>
              <v-col cols="4" sm="3">
                <v-select
                  v-model="pageSize"
                  :items="pageSizes"
                  label="Öğe Sayısı"
                  @change="handlePageSizeChange"
                ></v-select>
              </v-col>

              <v-col cols="8" sm="9">
                <v-pagination
                  v-model="page"
                  :length="totalPages"
                  total-visible="7"
                  next-icon="mdi-menu-right"
                  prev-icon="mdi-menu-left"
                  @input="handlePageChange"
                ></v-pagination>
              </v-col>
            </v-row>
          </v-col>
          <v-col class="py-0" cols="12" sm="12">
            <p style="margin-bottom: 0px">
              Toplam {{ tutorialCount }} öğe bulundu.
            </p>
          </v-col>

          <v-col cols="12" sm="12">
            <v-card class="mx-auto" tile>
              <v-data-table
                :headers="headers"
                :items="tutorials"
                disable-pagination
                :hide-default-footer="true"
                @click:row="handleClick"
                class="row-pointer mb-2 elevation-1"
                :key="componentKey"
              >
                <template
                  v-if="isModerator || isAdmin"
                  v-slot:[`item.actions`]="{ item }"
                >
                  <v-icon
                    small
                    class="mr-2"
                    @click.stop.prevent="editTutorial(item.id)"
                    >mdi-pencil</v-icon
                  >
                  <v-icon
                    v-if="isAdmin"
                    small
                    @click.stop.prevent="deleteTutorial(item.id)"
                    >mdi-delete</v-icon
                  >
                </template>
              </v-data-table>
            </v-card>
            <v-btn class="mt-3" depressed color="primary" @click="exportExcel">
              Excel Olarak İndir
            </v-btn>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item :key="2" value="mapView" :eager="true" style="z-index: 5">
        <turkey-map></turkey-map>
      </v-tab-item>
    </v-tabs-items>
  </v-col>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
// import SearchDetail from "./SearchDetail.vue";
import TurkeyMap from "./TurkeyMap.vue";
import { bus } from "../main";

export default {
  name: "tutorials-list",
  data() {
    return {
      tutorials: [],
      searchTitle: "",
      page: 1,
      totalPages: 0,
      tutorialCount: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15],
      selectedCity: null,
      selectedDistrict: null,
      componentKey: 0,
      areaJson: null,
      loading: false,
    };
  },
  components: {
    // SearchDetail,
    TurkeyMap,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!vm.$store.state.auth.user) {
        next({ name: "home" });
      } else {
        vm.retrieveTutorials();
      }
    });
  },
  computed: {
    tab: {
      set(tab) {
        this.$router.replace({ query: { ...this.$route.query, tab } });
      },
      get() {
        return this.$route.query.tab;
      },
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    isUser() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_USER");
      }
      return false;
    },
    isAdmin() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_ADMIN");
      }
      return false;
    },
    isModerator() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_MODERATOR");
      }
      return false;
    },
    headers() {
      const headers = [
        {
          text: "Nokta/Kuyu/Profil Adı",
          value: "nokta_adi",
          align: "start",
          sortable: false,
        },
        { text: "Yöntem", value: "yontem", sortable: false },
        {
          text: "Alt Yöntem",
          value: "alt_yontem",
          sortable: false,
        },
        { text: "İl", value: "il", sortable: false },
      ];
      if (this.isUser) {
        headers.push({
          text: "İlçe",
          value: "ilce",
          sortable: false,
          align: "end",
        });
      }
      if (this.isAdmin || this.isModerator) {
        headers.push(
          {
            text: "İlçe",
            value: "ilce",
            sortable: false,
          },
          {
            text: "Güncelle/Sil",
            value: "actions",
            sortable: false,
            align: "center",
          },
          { text: "Durum", value: "status", sortable: false, align: "end" }
        );
      }
      return headers;
    },
  },
  watch: {
    selectedCity: {
      handler: function (selectedCity) {
        if (selectedCity !== null) {
          this.selectedDistrict = null;
          this.page = 1;
          this.retrieveTutorials();
          this.componentKey += 1;
        }
      },
      immediate: true,
    },
    selectedDistrict: {
      handler: function (selectedDistrict) {
        if (selectedDistrict !== null) {
          this.page = 1;
          this.retrieveTutorials();
          this.componentKey += 1;
        }
      },
      immediate: true,
    },
  },
  methods: {
    reloadMap() {
      bus.$emit("renderMap");
    },
    getSelectedcity(val, flag) {
      if (flag === "il") {
        this.selectedCity = val;
      }
      if (flag === "ilce") {
        this.selectedDistrict = val;
      }
    },
    getRequestParams(searchTitle, page, pageSize) {
      let params = {};
      if (this.selectedCity != null) {
        searchTitle = this.selectedCity;
        this.searchTitle = this.selectedCity;
        params["il"] = searchTitle;
      }
      if (this.selectedDistrict != null) {
        searchTitle = this.selectedDistrict;
        this.searchTitle = this.selectedDistrict;

        params["ilce"] = searchTitle;
      }

      if (page) {
        params["page"] = page - 1;
      }

      if (pageSize) {
        params["size"] = pageSize;
      }
      if (this.$store.state.auth.user.roles.includes("ROLE_USER")) {
        params["userStatus"] = "user";
      }

      return params;
    },
    retrieveTutorials(searchTitle) {
      var params = null;
      if (searchTitle) {
        params = {
          il: searchTitle,
          page: this.page - 1,
          size: this.pageSize,
          userStatus: this.isUser ? "user" : null,
        };
      } else {
        params = this.getRequestParams(
          this.searchTitle,
          this.page,
          this.pageSize
        );
      }
      if (this.areaJson != null) {
        params["areaJson"] = this.areaJson;
      }

      TutorialDataService.getAll(params)
        .then((response) => {
          const { tutorials, totalPages, totalItems } = response.data;
          this.tutorials = tutorials.map(this.getDisplayTutorial);
          this.totalPages = totalPages;
          this.tutorialCount = totalItems;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveTutorials();
    },

    editTutorial(id) {
      this.$router.push({ name: "tutorial-edit", params: { id: id } });
    },

    deleteTutorial(id) {
      TutorialDataService.delete(id)
        .then(() => {
          this.refreshList();
        })
        .catch((e) => {
          console.log(e);
        });
    },

    handleClick(value) {
      let routeData = this.$router.resolve({
        name: "tutorial",
        params: { id: value.id },
      });
      window.open(routeData.href, "_blank");
      // this.$router.push({ name: "tutorial", params: { id: value.id } });
    },
    handlePageChange(value) {
      this.page = value;
      this.retrieveTutorials();
    },

    handlePageSizeChange(size) {
      this.pageSize = size;
      this.page = 1;
      this.retrieveTutorials();
    },
    getDisplayTutorial(tutorial) {
      return {
        id: tutorial.id,
        nokta_adi: tutorial.nokta_adi, //.substr(0, 20), //+ "...",
        yontem: tutorial.yontem, //.substr(0, 20) + "...",
        alt_yontem: tutorial.alt_yontem, //.substr(0, 10), //+ "...",
        il: tutorial.il, //.substr(0, 10), //+ "...",
        ilce: tutorial.ilce, //.substr(0, 10), //+ "...",
        status: tutorial.published ? "Yayında" : "Beklemede",
      };
    },
    exportExcel() {
      this.loading = true;
      let xlsx = require("json-as-xlsx");
      let excelParams = {};

      if (this.selectedCity != null) {
        excelParams["il"] = this.selectedCity;
      }
      if (this.selectedDistrict != null) {
        excelParams["ilce"] = this.selectedDistrict;
      }

      if (this.$store.state.auth.user.roles.includes("ROLE_USER")) {
        excelParams["userStatus"] = "user";
      }
      TutorialDataService.findAllgetAll(excelParams)
        .then((response) => {
          let keys = Object.keys(response.data[0]);
          let keysArr = [];
          for (let i = 0; i < keys.length; i++) {
            keysArr.push({ label: keys[i], value: keys[i] });
          }
          let data = [
            {
              sheet: "noktalar",
              columns: keysArr,
              content: response.data,
            },
          ];
          let settings = {
            fileName: "noktalar", // Name of the resulting spreadsheet
            extraLength: 3, // A bigger number means that columns will be wider
            //writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
          };
          xlsx(data, settings);
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    bus.$on("searchParam", (data, flag) => {
      this.getSelectedcity(data, flag);
      this.areaJson = null;
    });
    bus.$on("clearMap", () => {
      this.tutorials = [];
      this.searchTitle = "";
      this.selectedCity = null;
      this.selectedDistrict = null;
      bus.$emit("clearAll");
      bus.$emit("clearNav");
    });
    bus.$on("areaJson", (data) => {
      this.areaJson = data;
      this.retrieveTutorials();
    });
  },
};
</script>

<style>
.list {
  max-width: 800px;
  position: relative;
  z-index: 4;
}
</style>

<style lang="css" scoped>
.row-pointer >>> tbody tr :hover {
  cursor: pointer;
}
</style>
