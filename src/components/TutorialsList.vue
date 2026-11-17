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
      <!-- 🩵 Bilgilendirme Modalı -->
      <v-dialog v-model="modalVisible" max-width="400">
        <v-card>
          <v-card-title
            :class="{
              'text-success': modalType === 'success',
              'text-error': modalType === 'error',
              'text-info': modalType === 'info',
              'text-warning': modalType === 'warning',
            }"
          >
            <v-icon left>
              {{
                modalType === "success"
                  ? "mdi-check-circle"
                  : modalType === "error"
                  ? "mdi-alert-circle"
                  : modalType === "warning"
                  ? "mdi-alert"
                  : "mdi-information"
              }}
            </v-icon>
            {{
              modalType === "error"
                ? "Hata"
                : modalType === "success"
                ? "Başarılı"
                : modalType === "warning"
                ? "Uyarı"
                : "Bilgi"
            }}
          </v-card-title>

          <v-card-text>{{ modalMessage }}</v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="modalVisible = false"
              >Kapat</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 🔴 Silme Onayı -->
      <v-dialog v-model="confirmVisible" max-width="420">
        <v-card>
          <v-card-title class="text-error">
            <v-icon left color="error">mdi-delete-alert</v-icon>
            Silme Onayı
          </v-card-title>

          <v-card-text>
            <p>
              <strong>{{ selected.length }}</strong> kayıt silinecek. Bu işlem
              geri alınamaz. Devam etmek istiyor musunuz?
            </p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="grey" @click="confirmVisible = false"
              >Vazgeç</v-btn
            >
            <v-btn color="error" text @click="confirmBulkDelete"
              >Evet, Sil</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-tabs-items
        v-model="tab"
        style="background-color: transparent !important"
      >
        <!-- 🗺️ Harita Görünümü -->
        <v-tab-item
          value="harita-gorunumu"
          :key="1"
          :eager="true"
          style="z-index: 5"
        >
          <turkey-map></turkey-map>
        </v-tab-item>

        <!-- 📋 Liste Görünümü -->
        <v-tab-item :key="2" value="liste-gorunumu" eager>
          <v-row class="justify-center mx-auto mt-3">
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

          <!-- 🧩 Toplu İşlem Butonları -->
          <v-row
            v-if="isAdmin || isModerator"
            class="justify-center mx-auto mt-2"
          >
            <v-col cols="12" md="8" class="d-flex justify-end">
              <v-btn color="error" class="mr-2" depressed @click="bulkDelete">
                <v-icon left>mdi-delete</v-icon>
                Seçilenleri Sil ({{ selected.length }})
              </v-btn>

              <v-btn
                class="mr-2"
                depressed
                color="secondary"
                @click="selectAllFiltered"
              >
                <v-icon left>mdi-select-all</v-icon>
                Filtreye Göre Tümünü Seç
              </v-btn>
            </v-col>
          </v-row>

          <!-- 📊 Tablo -->
          <v-row class="justify-center mx-auto">
            <v-col cols="12" md="8">
              <div class="text-subtitle-1">
                Toplam {{ tutorialCount }} öğe bulundu.
              </div>

              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="tutorials"
                item-value="id"
                show-select
                disable-pagination
                hide-default-footer
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
                    color="error"
                    @click.stop.prevent="deleteTutorial(item.id)"
                    >mdi-delete</v-icon
                  >
                </template>
              </v-data-table>

              <!-- 🔻 Genel Export Butonları -->
              <v-btn
                class="mt-3"
                depressed
                color="primary"
                @click="exportExcel()"
              >
                Excel Olarak İndir
              </v-btn>
              <v-btn
                class="mt-3 ml-3"
                depressed
                color="primary"
                @click="exportExcel('kmlexport')"
              >
                KMZ İndir
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
import { addLinestoCollection } from "../common/KmzExport.js";
export default {
  name: "tutorials-list",
  data() {
    return {
      tutorials: [],
      selected: [],
      searchText: "",
      page: 1,
      totalPages: 0,
      tutorialCount: 0,
      pageSize: 5,
      pageSizes: [10, 50, 100, 150],
      componentKey: 0,
      areaJson: null,
      loading: false,
      methodarr: null,
      calisma_amaci: null,
      calisma_tarihi: null,
      proje_kodu: null,
      kuyu_arsiv_no: null,
      jeofizik_arsiv_no: null,
      derleme_no: null,
      cd_no: null,
      modalVisible: false,
      modalMessage: "",
      modalType: "info", // "success" | "error" | "info" | "warning"
      confirmVisible: false,
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
        { text: "Nokta/Kuyu/Profil Adı", value: "nokta_adi", align: "start" },
        { text: "Yöntem", value: "yontem" },
        { text: "Alt Yöntem", value: "alt_yontem" },
        { text: "İl", value: "il" },
        { text: "İlçe", value: "ilce" },
      ];
      if (this.isModerator || this.isAdmin)
        headers.push({
          text: "Güncelle/Sil",
          value: "actions",
          align: "center",
        });
      return headers;
    },
  },

  methods: {
    reloadMap() {
      bus.$emit("renderMap");
    },
    deleteTutorial(id) {
      if (!confirm("Bu kaydı silmek istediğinizden emin misiniz?")) return;
      TutorialDataService.delete(id).then(() => this.refreshList());
    },
    async bulkDelete() {
      if (!this.selected.length) {
        this.modalMessage = "Hiçbir kayıt seçilmedi!";
        this.modalType = "warning";
        this.modalVisible = true;
        return;
      }

      // 🩸 Onay dialog'unu aç
      this.confirmVisible = true;
    },
    async confirmBulkDelete() {
      this.confirmVisible = false;
      this.loading = true;

      try {
        const ids = this.selected.map((item) =>
          typeof item === "object" ? item.id : item,
        );

        await TutorialDataService.bulkDelete({ ids });

        this.modalMessage = `${ids.length} kayıt başarıyla silindi.`;
        this.modalType = "success";
        this.modalVisible = true;

        this.selected = [];
        this.retrieveTutorials();
      } catch (err) {
        console.error("Toplu silme hatası:", err);
        this.modalMessage = "Silme işlemi sırasında bir hata oluştu.";
        this.modalType = "error";
        this.modalVisible = true;
      } finally {
        this.loading = false;
      }
    },
    async selectAllFiltered() {
      this.loading = true;
      try {
        const params = this.getRequestParams(
          this.page,
          this.tutorialCount || 10000,
          this.methodarr,
        );
        const response = await TutorialDataService.getAll(params);
        const allIds = response.data.tutorials.map((t) => t.id);

        // ⚡️ Reaktif sıfırlama (yeni referans!)
        this.selected = [];
        await this.$nextTick();

        // 🧠 Yeni referanslı kopya ata
        this.selected = JSON.parse(JSON.stringify([...new Set(allIds)]));

        // 🔁 v-data-table’ı yenile
        this.componentKey = Date.now(); // benzersiz key
        await this.$nextTick();

        // 🟢 Bilgilendirme
        this.modalMessage = `Filtreye uyan ${allIds.length} kayıt seçildi.`;
        this.modalType = "info";
        this.modalVisible = true;
      } catch (err) {
        console.error("Tümünü seç hata:", err);
        this.modalMessage = "Filtreye göre seçim yapılırken bir hata oluştu.";
        this.modalType = "error";
        this.modalVisible = true;
      } finally {
        this.loading = false;
      }
    },
    /*
      create param object for the request
    */
    getRequestParams(page, pageSize, methodarr) {
      const s = this.$store.state.searchParam;
      const params = {};

      if (s.il) params["il"] = s.il;
      if (s.ilce) params["ilce"] = s.ilce;
      if (methodarr != null) params["yontem"] = methodarr;
      if (page) params["page"] = page - 1;
      if (pageSize) params["size"] = pageSize;

      if (this.isUser) params["userStatus"] = "user";

      params["calisma_amaci"] = s.calisma_amaci;
      params["calisma_tarihi"] = s.calisma_tarihi;
      params["proje_kodu"] = s.proje_kodu;
      params["kuyu_arsiv_no"] = s.kuyu_arsiv_no;
      params["jeofizik_arsiv_no"] = s.jeofizik_arsiv_no;
      params["derleme_no"] = s.derleme_no;
      params["cd_no"] = s.cd_no;

      // ✅ SearchText ekle
      if (s.searchText && s.searchText.trim() !== "") {
        params["searchText"] = s.searchText.trim();
      }

      return params;
    },
    /*
      retrieve tutorials from server
    */
    retrieveTutorials() {
      this.loading = true;
      const params = this.getRequestParams(
        this.page,
        this.pageSize,
        this.methodarr,
      );

      // Eğer geojson seçildiyse ekle
      // Eğer areaJson doluysa işlem yap
      if (this.areaJson) {
        // 1. DURUM: Gelen veri bir ID ise (Sayı veya sadece rakamlardan oluşan String)
        if (
          typeof this.areaJson === "number" ||
          (typeof this.areaJson === "string" && /^\d+$/.test(this.areaJson))
        ) {
          params["areaJson"] = this.areaJson;
        }
        // 2. DURUM: Gelen veri bir Geometri objesi ise
        else {
          const geom =
            this.areaJson.geometry ||
            this.areaJson[0]?.geometry ||
            this.areaJson;

          if (geom?.coordinates?.[0]) {
            const coords = geom.coordinates[0];
            const first = coords[0];
            const last = coords[coords.length - 1];
            // Poligonu kapatma kontrolü
            if (
              first &&
              last &&
              (first[0] !== last[0] || first[1] !== last[1])
            ) {
              coords.push([...first]);
              console.log("✅ Liste poligonu otomatik kapatıldı:", coords);
            }
            // Koordinatları parametreye ekle
            // Backend JSON.parse yaptığı için stringify olarak gönderiyoruz
            params["areaJson"] = JSON.stringify({
              type: "Polygon",
              coordinates: [coords],
            });
          }
        }
      }

      // ✅ SearchText eklendi (LeftNav.vue’den geliyor)
      const text = this.$store.state.searchParam.searchText;
      if (text && text.trim() !== "") {
        params["searchText"] = text.trim();
      }

      TutorialDataService.getAll(params)
        .then((response) => {
          const { tutorials, totalPages, totalItems } = response.data;
          this.tutorials = tutorials.map(this.getDisplayTutorial);
          this.totalPages = totalPages;
          this.tutorialCount = totalItems;
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
          this.loading = false;
        });
    },

    refreshList() {
      this.retrieveTutorials();
    },

    editTutorial(id) {
      this.$router.push({ name: "duzenle", params: { id: id } });
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
      this.retrieveTutorials();
      this.componentKey += 1;
    },

    handlePageSizeChange(size) {
      this.pageSize = size;
      this.page = 1;
      this.retrieveTutorials();
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
            `Failed to fetch XLSX file. Status: ${response.status}`,
          );
        }
      } catch (error) {
        console.error("Error exporting data:", error);
      }
    },

    exportExcel(format) {
      this.loading = true;
      const s = this.$store.state.searchParam;
      const excelParams = {};

      if (this.isUser) excelParams.userStatus = "user";

      Object.assign(excelParams, {
        il: s.il,
        ilce: s.ilce,
        yontem: this.methodarr,
        calisma_amaci: s.calisma_amaci,
        calisma_tarihi: s.calisma_tarihi,
        proje_kodu: s.proje_kodu,
        kuyu_arsiv_no: s.kuyu_arsiv_no,
        jeofizik_arsiv_no: s.jeofizik_arsiv_no,
        derleme_no: s.derleme_no,
        cd_no: s.cd_no,
        requestFlag: format === "kmlexport" ? "kmz" : "excel",
      });

      if (s.searchText?.trim()) excelParams.searchText = s.searchText.trim();

      // 🔹 areaJson kontrolü — ID veya Geometry olabilir
      if (this.areaJson) {
        if (
          typeof this.areaJson === "number" ||
          /^[0-9]+$/.test(this.areaJson)
        ) {
          // 🧩 ID gönderiliyor (ör. 1219)
          excelParams.geojson = this.areaJson;
        } else if (this.areaJson.type && this.areaJson.coordinates) {
          // 🧭 GeoJSON Geometry
          excelParams.geojson = this.areaJson.coordinates[0];
        } else if (Array.isArray(this.areaJson)) {
          // 🧭 FeatureCollection veya array
          const geom = this.areaJson[0]?.geometry || this.areaJson[0];
          if (geom?.coordinates) excelParams.geojson = geom.coordinates[0];
        } else if (this.areaJson.geometry?.coordinates) {
          // 🧭 Feature objesi
          excelParams.geojson = this.areaJson.geometry.coordinates[0];
        } else {
          console.warn("⚠️ Unsupported areaJson format:", this.areaJson);
        }
      }

      // 🩵 Eğer geojson bir koordinat dizisiyse, poligonu otomatik kapat
      if (excelParams.geojson && Array.isArray(excelParams.geojson)) {
        const g = excelParams.geojson;
        const first = g[0];
        const last = g[g.length - 1];

        // Son nokta ile ilk nokta aynı değilse kapat
        if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
          excelParams.geojson.push([...first]);
          console.log("✅ Poligon otomatik kapatıldı:", excelParams.geojson);
        }
      }

      // 🔧 API seçimi
      const apiCall =
        format === "kmlexport"
          ? TutorialDataService.findAllGeo
          : TutorialDataService.findAllgetAll;

      // 🚀 Çağrı
      apiCall(excelParams)
        .then((response) => {
          if (format === "kmlexport") addLinestoCollection(response.data);
          else this.handleBlobResponse(response);
        })
        .catch((err) => {
          console.error("Excel export error:", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },

  mounted() {
    bus.$emit("renderMap");
    this.retrieveTutorials();

    bus.$on("searchParam", () => {
      const s = this.$store.state.searchParam;
      this.areaJson = null;

      this.calisma_amaci = s.calisma_amaci;
      this.calisma_tarihi = s.calisma_tarihi;
      this.proje_kodu = s.proje_kodu;
      this.kuyu_arsiv_no = s.kuyu_arsiv_no;
      this.jeofizik_arsiv_no = s.jeofizik_arsiv_no;
      this.derleme_no = s.derleme_no;
      this.cd_no = s.cd_no;
      this.methodarr = s.yontem;
      this.page = 1;

      this.retrieveTutorials();
      this.componentKey += 1;
    });

    bus.$on("clearAll", (flag) => {
      this.tutorials = [];
      this.searchTitle = "";
      this.areaJson = null;
      this.methodarr = null;
      if (flag === "fullClean") {
        this.$store.commit("searchParam/updateMethod", null);
        this.$store.commit("searchParam/updateCity", null);
        this.$store.commit("searchParam/updateDistrict", null);
        this.$store.commit("searchParam/updateCoords", null);
        this.$store.commit("searchParam/updateWorkType", null);
        this.$store.commit("searchParam/updateWorkDate", null);
        this.$store.commit("searchParam/updateProjectCode", null);
        this.$store.commit("searchParam/updateLogNo", null);
        this.$store.commit("searchParam/updateGeoNo", null);
        this.$store.commit("searchParam/updateDerleme", null);
        this.$store.commit("searchParam/updateCd", null);

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
      this.calisma_amaci = this.$store.state.searchParam.calisma_amaci;
      this.calisma_tarihi = this.$store.state.searchParam.calisma_tarihi;
      this.proje_kodu = this.$store.state.searchParam.proje_kodu;
      this.kuyu_arsiv_no = this.$store.state.searchParam.kuyu_arsiv_no;
      this.jeofizik_arsiv_no = this.$store.state.searchParam.jeofizik_arsiv_no;
      this.derleme_no = this.$store.state.searchParam.derleme_no;
      this.cd_no = this.$store.state.searchParam.cd_no;
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
