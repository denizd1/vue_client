<template>
  <v-row>
    <v-overlay v-if="loading" style="z-index: 999">
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
    <!-- ikinci kolon; sağ taraf. rapor sonuçları burada gösterilecek -->
    <v-col cols="12" md="8">
      <v-card elevation="2" class="mb-4">
        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="d-flex align-center">
                  <v-icon left>mdi-filter-variant</v-icon>
                  <span class="font-weight-bold">Detaylı Filtreler</span>

                  <v-chip
                    v-if="Object.values(filters).flat().length > 0"
                    class="ml-2"
                    x-small
                    color="primary"
                  >
                    {{ Object.values(filters).flat().length }}
                  </v-chip>
                </div>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <v-row class="mt-2">
                  <v-col
                    cols="12"
                    md="6"
                    v-for="(values, key) in uniqueValues"
                    :key="key"
                  >
                    <v-autocomplete
                      :items="values"
                      :label="key.replace(/_/g, ' ').toUpperCase()"
                      v-model="filters[key]"
                      multiple
                      dense
                      clearable
                      attach
                      outlined
                      chips
                      small-chips
                      deletable-chips
                      hide-details
                      @change="applyFilters"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <v-card elevation="2">
        <v-card-text>
          <v-row class="justify-center mx-auto mt-3">
            <v-col cols="4">
              <v-select
                v-model="pageSize"
                :items="pageSizes"
                label="Öğe Sayısı"
                @change="handlePageSizeChange"
              ></v-select>
            </v-col>

            <v-col cols="8">
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
            <v-col cols="12">
              <div class="text-subtitle-1">
                Toplam {{ raporcount }} öğe bulundu.
              </div>

              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="rapors"
                item-key="id"
                show-expand
                :expanded.sync="expanded"
                disable-pagination
                hide-default-footer
                class="row-pointer mb-2 elevation-1"
              >
                <template v-slot:expanded-item="{ headers, item }">
                  <td :colspan="headers.length" class="grey lighten-5 pa-4">
                    <div v-if="item.reports && item.reports.length > 0">
                      <h4 class="mb-2 primary--text text--darken-2">
                        <v-icon small left color="primary"
                          >mdi-file-document-multiple</v-icon
                        >
                        Rapor Detayları
                      </h4>
                      <v-simple-table dense class="transparent">
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">Rapor Adı</th>
                              <th class="text-left">Yazarlar</th>
                              <th class="text-left">Yıl</th>
                              <th class="text-left">İl/İlçe</th>
                              <th class="text-left">Kullanılan Yöntemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(rapor, index) in item.reports"
                              :key="index"
                            >
                              <td>{{ rapor.rapor_adi }}</td>
                              <td>{{ rapor.yazarlar }}</td>
                              <td>{{ rapor.calisma_yili }}</td>
                              <td>{{ rapor.il }} / {{ rapor.ilce }}</td>
                              <td>{{ rapor.kullanilan_yontemler }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </div>
                    <div v-else class="text-center pa-2">
                      <span class="grey--text font-italic">
                        <v-icon small left>mdi-alert-circle-outline</v-icon>
                        Bu projeye ait detaylı rapor kaydı bulunamadı.
                      </span>
                    </div>
                  </td>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <!-- üçüncü kolon; ekstra bilgiler veya grafikler burada gösterilebilir -->
    <v-col cols="12" md="4">
      <v-card elevation="2">
        <v-card-text>
          <div id="chart-pie" class="mb-6">
            <apexchart
              type="pie"
              width="100%"
              height="500"
              :options="pieOptions"
              :series="methodChartData.series"
            ></apexchart>
          </div>

          <v-divider class="my-4"></v-divider>

          <div id="chart-line">
            <apexchart
              type="bar"
              width="100%"
              :options="lineOptions"
              :series="yearChartData.series"
            ></apexchart>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import raporMethodService from "../services/rapor.method.service";
export default {
  name: "RaporMethod",

  data() {
    return {
      stats: {
        methodCounts: {},
        yearCounts: {},
      },
      expanded: [],
      loading: false,
      page: 1,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
      totalPages: 0,
      rapors: [],
      raporcount: 0,
      proje_kodu: null,
      yil: null,
      kullanilan_yontemler: null,
      proje_adi: null,
      uniqueValues: {
        proje_kodu: [],
        yil: [],
        kullanilan_yontemler: [],
        proje_adi: [],
      },
      filters: {
        proje_kodu: [],
        yil: [],
        kullanilan_yontemler: [],
        proje_adi: [],
      },
    };
  },
  computed: {
    headers() {
      const headers = [
        { text: "Proje Kodu", value: "proje_kodu" },
        { text: "Yıl", value: "yil" },
        { text: "Proje Adı", value: "proje_adi" },
        { text: "Kullanılan Yöntem(ler)", value: "kullanilan_yontemler" },
      ];
      return headers;
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
    // 1. GRAFİK: Yöntem Dağılımı (Pie Chart) Verisi
    methodChartData() {
      return {
        series: Object.values(this.stats.methodCounts),
        labels: Object.keys(this.stats.methodCounts),
      };
    },
    yearChartData() {
      const sortedYears = Object.keys(this.stats.yearCounts).sort();
      return {
        series: [
          {
            name: "Proje Sayısı",
            data: sortedYears.map((year) => this.stats.yearCounts[year]),
          },
        ],
        categories: sortedYears,
      };
    },

    // Grafik Ayarları (Opsiyonel)
    pieOptions() {
      return {
        labels: this.methodChartData.labels,
        legend: { position: "bottom" },
        title: { text: "Yöntem Dağılımı", align: "center" },
      };
    },
    lineOptions() {
      return {
        chart: { type: "bar", toolbar: { show: false } },
        xaxis: { categories: this.yearChartData.categories },
        title: { text: "Yıllara Göre Proje Sayısı", align: "center" },
        colors: ["#F44336"], // Vuetify red rengiyle uyumlu
      };
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      var thisPerson = vm.$store.state.auth.user;

      if (thisPerson) {
        var thisUser = thisPerson.roles.includes("ROLE_USER");
        var thisAdmin = thisPerson.roles.includes("ROLE_ADMIN");
        var thisMod = thisPerson.roles.includes("ROLE_MODERATOR");
        if (thisAdmin || thisMod) {
          vm.fetchRapors();
          vm.getUniqueValues({}, true);
        } else if (thisUser) {
          next({ name: "giris" });
        }
      } else {
        next({ name: "giris" });
      }
    });
  },

  methods: {
    getUniqueValues(params = {}, isInitial = false) {
      raporMethodService
        .getUniqueValues(params)
        .then((response) => {
          // 1. Sadece İLK açılışta dropdown listelerini doldur
          if (isInitial) {
            for (const key in this.uniqueValues) {
              if (Object.prototype.hasOwnProperty.call(response.data, key)) {
                this.uniqueValues[key] = response.data[key].filter(
                  (v) => v !== null,
                );
              }
            }
          }

          // 2. HER SEFERİNDE (filtreleme dahil) grafikleri güncelle
          if (response.data.stats) {
            this.stats = response.data.stats;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    constructFilterParams() {
      const params = {};
      for (const key in this.filters) {
        if (this.filters[key].length > 0) {
          params[key] = this.filters[key].join(","); // backend can split by comma
        }
      }
      return params;
    },
    fetchRapors() {
      this.loading = true;
      // API çağrısı yaparak rapor verilerini al
      // Örnek: axios.get('/api/rapors', { params: { page: this.page, pageSize: this.pageSize } })
      // .then(response => {
      //   this.rapors = response.data.rapors;
      //   this.raporcount = response.data.totalCount;
      //   this.totalPages = Math.ceil(this.raporcount / this.pageSize);
      //   this.loading = false;
      // });
      //page, size, proje_kodu, yil, kullanilan_yontemler, proje_adi
      const params = {
        page: this.page - 1,
        size: this.pageSize,
        ...this.constructFilterParams(),
      };
      raporMethodService
        .getAll(params)
        .then((response) => {
          console.log(response.data);
          const { tutorials, totalPages, totalItems } = response.data;
          this.rapors = tutorials.map(this.displayrapor);
          this.raporcount = totalItems;
          this.totalPages = totalPages;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.fetchRapors();
    },
    handlePageSizeChange() {
      this.page = 1; // Sayfa boyutu değiştiğinde sayfayı 1 yap
      this.fetchRapors();
    },
    applyFilters() {
      this.page = 1; // Filtreler uygulandığında sayfayı 1 yap
      const filterParams = this.constructFilterParams();
      this.proje_kodu = filterParams.proje_kodu || null;
      this.yil = filterParams.yil || null;
      this.kullanilan_yontemler = filterParams.kullanilan_yontemler || null;
      this.proje_adi = filterParams.proje_adi || null;
      this.fetchRapors();
      // 2. Grafikleri ve benzersiz listeleri güncelle (Tüm filtrelenmiş veri)
      this.getUniqueValues(filterParams, false);
    },
    displayrapor(rapor) {
      return {
        id: rapor.id,
        proje_kodu: rapor.proje_kodu,
        yil: rapor.yil,
        proje_adi: rapor.proje_adi,
        kullanilan_yontemler: rapor.kullanilan_yontemler,
        reports: rapor.reports,
      };
    },
  },
};
</script>
