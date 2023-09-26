<template>
  <v-row>
    <v-col>
      <v-overlay style="z-index: 6" v-if="loading">
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

      <v-tabs centered v-model="tab" background-color="transparent">
        <v-tab @click="reloadMap()" href="#harita-gorunumu"
          >Harita Görünümü</v-tab
        >
        <v-tab href="#liste-gorunumu">Liste Görünümü</v-tab>
      </v-tabs>

      <v-tabs-items
        style="background-color: transparent !important"
        v-model="tab"
      >
        <v-tab-item
          :key="1"
          value="harita-gorunumu"
          :eager="true"
          style="z-index: 5"
        >
          <turkey-map></turkey-map>
        </v-tab-item>
        <v-tab-item :key="2" value="liste-gorunumu" :eager="true">
          <v-row align="center" class="justify-center mx-auto">
            <v-col cols="8" md="4">
              <v-text-field
                v-on:keyup.enter="
                  page = 1;
                  retrieveTutorials(searchTitle, $event);
                "
                v-model="searchTitle"
                label="Arama"
              ></v-text-field>
            </v-col>
            <v-col cols="2" md="1">
              <v-card-actions class="mt-3">
                <v-btn
                  small
                  @click="
                    page = 1;
                    retrieveTutorials(searchTitle, $event);
                  "
                >
                  <v-icon>mdi-database-search-outline</v-icon>
                </v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
          <v-row class="justify-center mx-auto">
            <v-col cols="4" md="3">
              <v-select
                v-model="pageSize"
                :items="pageSizes"
                label="Öğe Sayısı"
                @change="handlePageSizeChange"
              ></v-select>
            </v-col>

            <v-col cols="6" md="3">
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
          <v-row class="justify-center mx-auto">
            <v-col cols="12" md="8">
              <div class="text-subtitle-1">
                Toplam {{ tutorialCount }} öğe bulundu.
              </div>
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
              <v-btn
                class="mt-3"
                depressed
                color="primary"
                @click="exportExcel(searchTitle)"
              >
                Excel Olarak İndir
              </v-btn>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs-items>
    </v-col>
  </v-row>
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
      methodarr: null,
      globalParams: null,
      detailSearch: false,
    };
  },
  components: {
    // SearchDetail,
    TurkeyMap,
  },
  /*
    check if user is admin or moderator before loading the page
*/

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

  methods: {
    reloadMap() {
      bus.$emit("renderMap");
    },

    /*
      create param object for the request
    */
    getRequestParams(page, pageSize, methodarr) {
      let searchParams = {};

      if (
        this.selectedCity !== null ||
        this.selectedCity !== "" ||
        this.selectedCity !== undefined
      ) {
        searchParams["il"] = this.selectedCity;
      }
      if (
        this.selectedDistrict !== null ||
        this.selectedDistrict !== "" ||
        this.selectedDistrict !== undefined
      ) {
        searchParams["ilce"] = this.selectedDistrict;
      }

      if (methodarr != null) {
        searchParams["yontem"] = methodarr;
      }

      if (page) {
        searchParams["page"] = page - 1;
      }

      if (pageSize) {
        searchParams["size"] = pageSize;
      }
      if (this.$store.state.auth.user.roles.includes("ROLE_USER")) {
        searchParams["userStatus"] = "user";
      }
      if (
        (this.selectedCity === null ||
          this.selectedCity === "" ||
          this.selectedCity === undefined) &&
        (this.selectedDistrict === null ||
          this.selectedDistrict === "" ||
          this.selectedDistrict === undefined)
      ) {
        searchParams["il"] = this.searchTitle;
        searchParams["requestFlag"] = "userSearch";
      }

      return searchParams;
    },
    /*
      retrieve tutorials from server
    */
    retrieveTutorials(searchTitle, event) {
      var params = null;

      if (this.detailSearch === true) {
        params = this.globalParams;
        params.page = this.page - 1;
        params.size = this.pageSize;
        params.userStatus = this.isUser ? "user" : null;
      } else {
        if (event && event.isTrusted) {
          this.$store.commit("searchParam/updateCoords", null);
          this.$store.commit("searchParam/updateCity", null);
          this.$store.commit("searchParam/updateDistrict", null);
          this.methodarr = null;
          bus.$emit("searchDatatoMap", searchTitle);
          this.selectedCity = null;
          this.selectedDistrict = null;

          params = {
            il: searchTitle, // !!! il is just a placeholder for the searchTitle,
            page: this.page - 1,
            size: this.pageSize,
            requestFlag: "userSearch",
            userStatus: this.isUser ? "user" : null,
          };
        } else {
          params = this.getRequestParams(
            this.page,
            this.pageSize,
            this.methodarr
          );
        }

        if (!event && this.areaJson != null) {
          params["areaJson"] = this.areaJson;
        }
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
      this.retrieveTutorials(this.searchTitle);
    },

    editTutorial(id) {
      this.$router.push({ name: "duzenle", params: { id: id } });
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
    /*
      redirect to tutorial detail page
    */
    handleClick(value) {
      let routeData = this.$router.resolve({
        name: "calisma",
        params: { id: value.id },
      });
      window.open(routeData.href, "_blank");
    },
    handlePageChange(value) {
      this.page = value;
      this.retrieveTutorials(this.searchTitle);
      this.componentKey += 1;
    },

    handlePageSizeChange(size) {
      this.pageSize = size;
      this.page = 1;
      this.retrieveTutorials(this.searchTitle);
      this.componentKey += 1;
    },
    /*
      get display tutorial object
    */
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
    async handleBlobResponse(response) {
      try {
        // Check if the response status is OK (HTTP 200)
        if (response.status === 200) {
          // Read the response data directly as Blob
          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          // Create a URL for the Blob
          const blobURL = window.URL.createObjectURL(blob);

          // Create an anchor element for the download
          const a = document.createElement("a");
          a.href = blobURL;

          a.download = "sonuclar" + new Date().toLocaleDateString() + ".xlsx";

          // Trigger a click event on the anchor element to initiate the download
          a.click();

          // Optionally, do any other necessary post-download actions here
        } else {
          throw new Error(
            `Failed to fetch XLSX file. Status: ${response.status}`
          );
        }
      } catch (error) {
        console.error("Error exporting data:", error);
      }
    },

    exportExcel(searchTitle) {
      this.loading = true;
      var excelParams = null;
      if (this.detailSearch === true) {
        excelParams = this.globalParams;
        excelParams.requestFlag = "excel";
        excelParams.userStatus = this.$store.state.auth.user.roles.includes(
          "ROLE_USER"
        )
          ? "user"
          : null;

        TutorialDataService.findAllgetAll(excelParams)
          .then((response) => {
            // Handle the Blob response
            this.handleBlobResponse(response);
            this.loading = false; // Optionally, update loading state
          })
          .catch((error) => {
            console.error(error);
            this.loading = false; // Optionally, update loading state
          });
      } else {
        excelParams = {};
        if (this.$store.state.auth.user.roles.includes("ROLE_USER")) {
          excelParams["userStatus"] = "user";
        }
        excelParams["yontem"] = this.methodarr ? this.methodarr : null;
        excelParams["requestFlag"] = "excel";
        if (this.areaJson == null) {
          if (searchTitle) {
            excelParams["il"] =
              this.$store.state.searchParam.il != null
                ? this.$store.state.searchParam.il
                : searchTitle;
          }
          TutorialDataService.findAllgetAll(excelParams)
            .then((response) => {
              // Handle the Blob response
              this.handleBlobResponse(response);
              this.loading = false; // Optionally, update loading state
            })
            .catch((error) => {
              console.error(error);
              this.loading = false; // Optionally, update loading state
            });
        }
        if (this.areaJson != null) {
          var reg = /^\d+$/;

          if (reg.test(this.areaJson)) {
            excelParams["geojson"] = this.areaJson;
          } else if (this.areaJson.isArray) {
            excelParams["geojson"] = this.areaJson[0].geometry.coordinates[0];
          } else {
            excelParams["geojson"] = this.areaJson[0].geometry.coordinates[0];
          }
          TutorialDataService.findAllGeo(excelParams)
            .then((response) => {
              // Handle the Blob response
              this.handleBlobResponse(response);
              this.loading = false; // Optionally, update loading state
            })
            .catch((error) => {
              console.error(error);
              this.loading = false; // Optionally, update loading state
            });
        }
      }
    },
  },

  mounted() {
    bus.$emit("renderMap");
    this.retrieveTutorials();

    bus.$on("search", (params) => {
      this.globalParams = params;
      this.detailSearch = true;
      this.retrieveTutorials();
      this.componentKey += 1;
    });

    bus.$on("searchParam", () => {
      this.detailSearch = false;
      this.areaJson = null;

      this.searchTitle = this.$store.state.searchParam.il;
      this.selectedCity = this.$store.state.searchParam.il;
      this.selectedDistrict = this.$store.state.searchParam.ilce;
      if (this.$store.state.searchParam.ilce != null) {
        this.searchTitle = this.selectedDistrict;
      }

      this.methodarr = this.$store.state.searchParam.yontem;
      this.page = 1;
      this.retrieveTutorials();
      this.componentKey += 1;
    });
    bus.$on("clearAll", (flag) => {
      this.detailSearch = false;

      this.tutorials = [];
      this.searchTitle = "";
      this.areaJson = null;
      this.methodarr = null;
      if (flag === "fullClean") {
        this.$store.commit("searchParam/updateCity", null);
        this.$store.commit("searchParam/updateDistrict", null);
        this.$store.commit("searchParam/updateMethod", null);
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.methodarr = null;
        this.searchTitle = "";
        this.page = 1;
        this.retrieveTutorials();
        this.componentKey += 1;
      }
      // bus.$emit("clearAll");
      // bus.$emit("clearNav");
    });
    bus.$on("areaJson", (data) => {
      this.detailSearch = false;

      this.areaJson = data;
      this.searchTitle = "";
      this.methodarr = this.$store.state.searchParam.yontem;
      this.selectedCity = null;
      this.selectedDistrict = null;
      this.page = 1;
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
