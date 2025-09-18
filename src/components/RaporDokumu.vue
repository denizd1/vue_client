<template>
  <v-row>
    <v-dialog v-model="dialog" tile max-width="80%">
      <v-card>
        <v-card-title class="headline"> Rapor Detayı </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="selectedRapor">
            <tbody>
              <tr v-for="(label, key) in readableFields" :key="key">
                <td>
                  <strong>{{ label }}</strong>
                </td>
                <td>{{ selectedRapor[key] || "-" }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="dialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-col>
      <v-row class="mx-2">
        <v-col
          cols="12"
          sm="6"
          md="4"
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
            @change="applyFilters"
          ></v-autocomplete>
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
        <v-col cols="12" md="12" lg="12">
          <div class="text-subtitle-1">
            Toplam {{ tutorialCount }} öğe bulundu.
          </div>
          <v-card class="mx-auto" tile>
            <v-data-table
              :headers="headers"
              :items="reports"
              disable-pagination
              @click:row="handleClick"
              :hide-default-footer="true"
              class="row-pointer mb-2 elevation-1"
              :key="componentKey"
            >
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
import RaporDataService from "../services/RaporDataService";

export default {
  name: "RaporDokumu",
  data() {
    return {
      selectedRapor: null,
      dialog: false,
      reports: [],
      componentKey: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      pageSizes: [5, 10, 20, 50],
      filters: {
        bilimsel_derleme_no: [],
        jeofizik_arsiv_no: [],
        kuyu_logu_rapor_no: [],
        cd_no: [],
        olcu_karne_no: [],
        proje_kodu: [],
        rapor_adi: [],
        il: [],
        ilce: [],
        calisma_yili: [],
      },
      uniqueValues: {
        bilimsel_derleme_no: [],
        jeofizik_arsiv_no: [],
        kuyu_logu_rapor_no: [],
        cd_no: [],
        olcu_karne_no: [],
        proje_kodu: [],
        rapor_adi: [],
        il: [],
        ilce: [],
        calisma_yili: [],
      },
      readableFields: {
        bilimsel_derleme_no: "Bilimsel Derleme No",
        yeni_arsiv_no: "Yeni Arşiv No",
        jeofizik_arsiv_no: "Jeofizik Arşiv No",
        kuyu_logu_rapor_no: "Kuyu Logu Rapor No",
        cd_no: "CD No",
        olcu_karne_no: "Ölçü Karne No",
        proje_kodu: "Proje Kodu",
        rapor_adi: "Rapor Adı",
        yazarlar: "Yazarlar",
        il: "İl",
        ilce: "İlçe",
        calisma_yili: "Çalışma Yılı",
        kullanilan_yontemler: "Kullanılan Yöntemler",
        nokta_profil_alan_atis_adet: "Nokta / Profil / Alan / Atış / Adet",
        olur_yazi_tarihi: "Olur Yazı Tarihi",
        olur_yazi_sayisi: "Olur Yazı Sayısı",
        bilimsel_yazi_tarihi: "Bilimsel Yazı Tarihi",
        bilimsel_yazi_sayisi: "Bilimsel Yazı Sayısı",
        ilgili_daireye_yazi_tarihi: "İlgili Daireye Yazı Tarihi",
        ilgili_daireye_yazi_sayisi: "İlgili Daireye Yazı Sayısı",
        yurutucu_daire: "Yürütücü Daire",
        firma: "Firma",
      },
    };
  },
  computed: {
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
          text: "Bilimsel Derleme No",
          value: "bilimsel_derleme_no",
          align: "start",
          sortable: false,
        },

        {
          text: "Jeofizik Arşiv No",
          value: "jeofizik_arsiv_no",
          sortable: false,
        },
        {
          text: "Kuyu Logu Rapor No",
          value: "kuyu_logu_rapor_no",
          sortable: false,
        },
        {
          text: "CD No",
          value: "cd_no",
          sortable: false,
        },

        {
          text: "Ölçü Karne No",
          value: "olcu_karne_no",
          sortable: false,
        },
        {
          text: "Proje Kodu",
          value: "proje_kodu",
          sortable: false,
        },
        {
          text: "Rapor Adı",
          value: "rapor_adi",
          sortable: false,
        },
        {
          text: "Yazarlar",
          value: "yazarlar",
          sortable: false,
        },
        {
          text: "İl",
          value: "il",
          sortable: false,
        },
        {
          text: "İlçe",
          value: "ilce",
          sortable: false,
        },
        {
          text: "Çalışma Yılı",
          value: "calisma_yili",
          sortable: false,
        },
        {
          text: "Kullanılan Yöntemler",
          value: "kullanilan_yontemler",
          sortable: false,
        },
        {
          text: "Nokta/Profil/Alan/Atış/Adet",
          value: "nokta_profil_alan_atis_adet",
          sortable: false,
          align: "end",
        },
      ];

      return headers;
    },
  },
  methods: {
    retrieveReports() {
      const params = {
        page: this.page - 1,
        size: this.pageSize,
        ...this.constructFilterParams(),
      };

      RaporDataService.getAll(params)
        .then((response) => {
          const { rapors, totalPages, totalItems } = response.data;
          this.totalPages = totalPages;
          this.tutorialCount = totalItems;
          this.reports = rapors.map(this.getDisplayReports);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    handlePageChange(value) {
      this.page = value;
      this.retrieveReports();
      this.componentKey += 1;
    },

    handlePageSizeChange(size) {
      this.pageSize = size;
      this.page = 1;
      this.retrieveReports();
      this.componentKey += 1;
    },
    getDisplayReports(rapors) {
      return {
        bilimsel_derleme_no: rapors.bilimsel_derleme_no,
        jeofizik_arsiv_no: rapors.jeofizik_arsiv_no,
        kuyu_logu_rapor_no: rapors.kuyu_logu_rapor_no,
        cd_no: rapors.cd_no,
        olcu_karne_no: rapors.olcu_karne_no,
        proje_kodu: rapors.proje_kodu,
        rapor_adi: rapors.rapor_adi,
        yazarlar: rapors.yazarlar,
        il: rapors.il,
        ilce: rapors.ilce,
        calisma_yili: rapors.calisma_yili,
        kullanilan_yontemler: rapors.kullanilan_yontemler,
        nokta_profil_alan_atis_adet: rapors.nokta_profil_alan_atis_adet,
        // add id silently (used for routing)
        id: rapors.id,
      };
    },
    getUniqueValues() {
      RaporDataService.getUniqueValues()
        .then((response) => {
          for (const key in this.uniqueValues) {
            if (Object.prototype.hasOwnProperty.call(response.data, key)) {
              this.uniqueValues[key] = response.data[key].filter(
                (v) => v !== null
              ); // remove nulls
            }
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
    applyFilters() {
      this.page = 1; // reset to first page on filter change
      this.retrieveReports();
      this.componentKey += 1;
    },
    handleClick(item) {
      this.selectedRapor = item;
      this.dialog = true;
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
          vm.retrieveReports();
          vm.getUniqueValues();
        } else if (thisUser) {
          next({ name: "giris" });
        }
      } else {
        next({ name: "giris" });
      }
    });
  },
};
</script>
