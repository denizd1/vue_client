<template>
  <v-card>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      bottom
      temporary
      app
      style="z-index: 200 !important"
      width="35%"
    >
      <v-divider class="mt-0"></v-divider>
      <v-list v-if="!currentUser">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list dense v-if="currentUser" class="pt-0">
        <v-list-item link :to="{ name: 'profil' }">
          <v-list-item-content>
            <v-row>
              <v-col sm="1" lg="1"
                ><v-avatar color="primary" size="36"
                  ><span class="white--text">{{
                    currentUser.username.split(".")[0].charAt(0) +
                    (currentUser.username.split(".")[1]
                      ? currentUser.username.split(".")[1].charAt(0)
                      : "")
                  }}</span></v-avatar
                ></v-col
              >
              <v-col cols="10" class="mt-1"
                ><v-list-item-title class="text-h6">
                  {{ currentUser.username }}
                </v-list-item-title>
                <v-list-item-subtitle>{{
                  currentUser.email
                }}</v-list-item-subtitle></v-col
              >
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="currentUser" link :to="{ name: 'calismalar' }">
          <v-list-item-icon>
            <v-icon>mdi-folder-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Çalışmalar</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item
          v-if="isUseradmin || isUsermoderator"
          link
          :to="{ name: 'rapor-dokumu' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-archive</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Rapor Dökümü</v-list-item-title>
        </v-list-item> -->
        <v-list-item
          v-if="isUseradmin || isUsermoderator"
          link
          :to="{ name: 'ekle' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-archive-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Yeni Çalışma Ekle</v-list-item-title>
        </v-list-item>
        <v-list-item link @click.prevent="logOut">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Çıkış</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-group
          prepend-icon="mdi-sine-wave"
          :value="false"
          no-action
          v-if="showNavelement"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Yöntem</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item>
              <v-select
                v-model="methodControl"
                :items="methodSelect"
                single-line
                chips
                multiple
                @change="getDistinctValues('yontem')"
              >
                <template #selection="selection">
                  <v-chip
                    @click="deleteItem(selection.item, 'yontem')"
                    v-text="selection.item"
                  ></v-chip> </template
              ></v-select>
            </v-list-item>
          </v-list>
        </v-list-group>
        <v-list-group
          prepend-icon="mdi-map-marker-path"
          :value="false"
          no-action
          v-if="showNavelement && showCalismaAmaciSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Çalışma Amacı</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectworkType"
              :items="calisma_amaci"
              single-line
              chips
              multiple
              @change="getDistinctValues('amac')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'amac')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>
        <v-list-group
          prepend-icon="mdi-calendar-month-outline"
          :value="false"
          no-action
          v-if="showNavelement && showCalismaTarihiSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Çalışma Tarihi</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectWorkDate"
              :items="calisma_tarihi"
              single-line
              chips
              multiple
              @change="getDistinctValues('tarih')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'tarih')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>

        <v-list-group
          prepend-icon="mdi-format-list-numbered"
          :value="false"
          no-action
          v-if="showNavelement && showProjeKoduSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Proje Kodu</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectprojectCode"
              :items="proje_kodu"
              single-line
              chips
              multiple
              @change="getDistinctValues('proje')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'proje')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>
        <v-list-group
          prepend-icon="mdi-format-list-numbered"
          :value="false"
          no-action
          v-if="showNavelement && showKuyuArsivNoSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Kuyu Arşiv No</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectlogno"
              :items="kuyu_arsiv_no"
              single-line
              chips
              multiple
              @change="getDistinctValues('kuyu')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'kuyu')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>
        <v-list-group
          prepend-icon="mdi-format-list-numbered"
          :value="false"
          no-action
          v-if="showNavelement && showJeofizikArsivNoSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Jeofizik Arşiv No</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectgeono"
              :items="jeofizik_arsiv_no"
              single-line
              chips
              multiple
              @change="getDistinctValues('jeofizik')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'jeofizik')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>
        <v-list-group
          prepend-icon="mdi-format-list-numbered"
          :value="false"
          no-action
          v-if="showNavelement && showDerlemeNoSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Derleme No</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectderleme"
              :items="derleme_no"
              single-line
              chips
              multiple
              @change="getDistinctValues('derleme')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'derleme')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>
        <v-list-group
          prepend-icon="mdi-format-list-numbered"
          :value="false"
          no-action
          v-if="showNavelement && showCdNoSelect"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>CD No</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-select
              v-model="selectcd"
              :items="cd_no"
              single-line
              chips
              multiple
              @change="getDistinctValues('cd')"
            >
              <template #selection="selection">
                <v-chip
                  @click="deleteItem(selection.item, 'cd')"
                  v-text="selection.item"
                ></v-chip>
              </template>
            </v-select>
          </v-list-item>
        </v-list-group>

        <v-list-group
          prepend-icon="mdi-math-compass"
          :value="false"
          no-action
          v-if="showNavelement"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Ölçek</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item
              v-for="(scaleControl, index) in scaleControls"
              :key="index"
            >
              <v-list-item-title v-text="scaleControl.label">
              </v-list-item-title>
              <v-checkbox
                v-model="scaleControl.checked"
                :color="scaleControl.color"
                :input-value="scaleControl.factor"
                :disabled="scaleControl.visibility"
                @change="
                  triggerChange(scaleControl.checked, scaleControl.factor)
                "
              >
              </v-checkbox>
            </v-list-item>
          </v-list>
        </v-list-group>

        <v-list-group
          prepend-icon="mdi-city-variant-outline"
          :value="false"
          no-action
          v-if="showNavelement"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>İl / İlçe</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item>
              <v-select
                v-model="cityControl"
                item-text="il"
                :items="cities"
                single-line
                placeholder="İl Seçiniz"
                @change="handleCityChange"
              ></v-select>
            </v-list-item>
            <v-list-item>
              <v-select
                v-if="fillDistrict.length"
                v-model="districtControl"
                item-text="ilceleri"
                :items="fillDistrict"
                single-line
                placeholder="İlçe seçiniz"
                @change="handleDistrictChange"
              ></v-select>
            </v-list-item>
          </v-list>
        </v-list-group>
        <v-list-item v-if="showNavelement" class="justify-center">
          <v-btn
            color="success"
            class="mr-4 mt-3"
            @click.stop="drawer = !drawer"
            @click="getResults"
          >
            Ara
          </v-btn>
        </v-list-item>

        <v-list-item v-if="showNavelement" class="justify-center">
          <v-btn color="error" @click="clearNav" class="mt-3">
            Seçimleri Temizle
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar style="z-index: 6" flat app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <v-img
        src="../assets/logo2.png"
        alt="MTA logo"
        max-height="50px"
        max-width="50px"
        class="mb-1"
        contain
      ></v-img>
      <v-spacer></v-spacer>
    </v-app-bar>
  </v-card>
</template>
<script>
import EventBus from "../common/EventBus";
import { bus } from "../main";
import api from "../services/api";
import TutorialDataService from "../services/TutorialDataService";

import citiesJson from "../../../app/cities_of_turkey.json";

export default {
  name: "LeftNav",
  data() {
    return {
      cities: citiesJson,
      fillDistrict: [],
      mini: true,
      drawer: false,
      showNavelement: null,
      showNavmethod: null,
      showNavcity: null,
      calisma_amaci: null,
      calisma_tarihi: null,
      proje_kodu: null,
      kuyu_arsiv_no: null,
      jeofizik_arsiv_no: null,
      derleme_no: null,
      cd_no: null,
      selectworkType: null,
      selectWorkDate: null,
      selectprojectCode: null,
      selectlogno: null,
      selectgeono: null,
      selectderleme: null,
      selectcd: null,
      showCalismaAmaciSelect: false,
      showCalismaTarihiSelect: false,
      showProjeKoduSelect: false,
      showKuyuArsivNoSelect: false,
      showJeofizikArsivNoSelect: false,
      showDerlemeNoSelect: false,
      showCdNoSelect: false,

      menuItems: [
        {
          title: "Kayıt Ol",
          path: "/giris",
          icon: "mdi-account-plus-outline",
        },
        { title: "Giriş Yap", path: "/giris", icon: "mdi-login" },
      ],
      //Farkli geojsonlar icin gereken parametreler
      scaleControls: [
        {
          id: 1,
          name: "yirmibesBin",
          factor: 25,
          label: "1/25.000",
          checked: false,
          visibility: false,
        },

        {
          id: 2,
          name: "yuzBin",
          factor: 100,
          label: "1/100.000",
          checked: false,
          visibility: false,
        },
        {
          id: 3,
          name: "besyuzBin",
          factor: 500,
          label: "1/500.000",
          checked: false,
          visibility: false,
        },
        {
          id: 4,
          name: "iller",
          factor: 0,
          label: "İl Sınırları",
          checked: false,
          visibility: false,
        },
        {
          id: 5,
          name: "ilceler",
          factor: 1,
          label: "İlçe Sınırları",
          checked: false,
          visibility: false,
        },
      ],
      methodSelect: [
        "Düşey Elektrik Sondajı (DES)",
        "Geçici Elektromanyetik Yöntem (TEM)",
        "Yapay Uçlaşma Yöntemi (IP)",
        "Gradient Yapay Uçlaşma Yöntemi (IP)",
        "Manyetotellürik (MT)",
        "Audio Manyetotellürik (AMT)",
        "Yapay Kaynaklı Audio Manyetotellürik (CSAMT)",
        "Doğal Potansiyel (SP)",
        "Çok Kanallı Özdirenç Yöntemi",
        "Kuyu Ölçüleri",
        "Manyetik",
        "Gravite",
        "Radyometri",
        "Suseptibilite",
        "Uydu Görüntüsü",
        "Havadan Elektromanyetik",
        "Havadan Gravite",
        "Havadan Manyetik",
        "Havadan Manyetik Rejyonel (1971 - 1989)",
        "Havadan Manyetik Rejyonel (2017 - 2022)",
        "Havadan Radyometri",
        "Havadan Radyometri Rejyonel (2017 Öncesi)",
        "Havadan Radyometri Rejyonel (2017 - 2022)",
        "IHA (Manyetik)",
        "IHA (Ortofoto)",
        "IHA (Radyometri)",
        "2 Boyutlu Sismik Yansıma",
        "2 Boyutlu Sismik Kırılma",
        "Yer Radarı",
      ],
      methodControl: null,
      districtControl: null,
      cityControl: null,
      show: false,
    };
  },
  methods: {
    getDistinctValues(querytype) {
      const params = {
        column: [
          "calisma_amaci",
          "calisma_tarihi",
          "proje_kodu",
          "kuyu_arsiv_no",
          "jeofizik_arsiv_no",
          "derleme_no",
          "cd_no",
        ],
      };
      params["userStatus"] = this.$store.state.auth.user.roles.includes(
        "ROLE_USER"
      )
        ? "user"
        : null;
      params["yontem"] = this.methodControl ? this.methodControl : null;
      params["calisma_tarihi"] = this.selectWorkDate
        ? this.selectWorkDate
        : null;
      params["calisma_amaci"] = this.selectworkType
        ? this.selectworkType
        : null;
      params["proje_kodu"] = this.selectprojectCode
        ? this.selectprojectCode
        : null;
      params["kuyu_arsiv_no"] = this.selectlogno ? this.selectlogno : null;
      params["jeofizik_arsiv_no"] = this.selectgeono ? this.selectgeono : null;
      params["derleme_no"] = this.selectderleme ? this.selectderleme : null;
      params["cd_no"] = this.selectcd ? this.selectcd : null;
      TutorialDataService.distinct(params)
        .then((response) => {
          // Define a mapping of querytype to selected values
          const queryTypeToSelectedValues = {
            yontem: [
              "calisma_amaci",
              "proje_kodu",
              "kuyu_arsiv_no",
              "jeofizik_arsiv_no",
              "derleme_no",
              "cd_no",
              "calisma_tarihi",
            ],
            amac: [
              "proje_kodu",
              "kuyu_arsiv_no",
              "jeofizik_arsiv_no",
              "derleme_no",
              "cd_no",
              "calisma_tarihi",
            ],
            tarih: [
              "proje_kodu",
              "kuyu_arsiv_no",
              "jeofizik_arsiv_no",
              "derleme_no",
              "cd_no",
            ],
            proje: [
              "kuyu_arsiv_no",
              "jeofizik_arsiv_no",
              "derleme_no",
              "cd_no",
            ],
            kuyu: ["jeofizik_arsiv_no", "derleme_no", "cd_no"],
            jeofizik: ["derleme_no", "cd_no"],
            derleme: ["cd_no"],
          };

          // Get the selected values based on the querytype
          const selectedValues = queryTypeToSelectedValues[querytype];

          // Update the data properties with the selected values
          selectedValues.forEach((property) => {
            if (property !== "calisma_tarihi") {
              this[property] =
                response.data[property] !== null
                  ? response.data[property].filter((elem) => elem !== null)
                  : null;
            } else {
              //fill calisma_tarihi with years from current year to 1935
              this.calisma_tarihi = Array.from(
                { length: new Date().getFullYear() - 1935 + 11 },
                (v, k) => k + 1935
              ).reverse();
            }
          });
        })

        .catch((e) => {
          console.log(e);
        });
    },
    deleteItem(item, type) {
      if (typeof type === "string") {
        if (type === "yontem" && this.methodControl) {
          this.methodControl = this.methodControl.filter(
            (find) => find !== item
          );
        } else if (type === "tarih" && this.selectWorkDate) {
          this.selectWorkDate = this.selectWorkDate.filter(
            (find) => find !== item
          );
        } else if (type === "amac" && this.selectworkType) {
          this.selectworkType = this.selectworkType.filter(
            (find) => find !== item
          );
        } else if (type === "proje" && this.selectprojectCode) {
          this.selectprojectCode = this.selectprojectCode.filter(
            (find) => find !== item
          );
        } else if (type === "kuyu" && this.selectlogno) {
          this.selectlogno = this.selectlogno.filter((find) => find !== item);
        } else if (type === "jeofizik" && this.selectgeono) {
          this.selectgeono = this.selectgeono.filter((find) => find !== item);
        } else if (type === "derleme" && this.selectderleme) {
          this.selectderleme = this.selectderleme.filter(
            (find) => find !== item
          );
        } else if (type === "cd" && this.selectcd) {
          this.selectcd = this.selectcd.filter((find) => find !== item);
        }
      }
    },
    async handleCityChange(event) {
      const response = await api.get(`/getGeoJson${0}`);

      const data = await response.data;
      this.$nextTick(() => {
        data.features.find((item) => {
          if (item.properties.name === event) {
            this.$store.commit(
              "searchParam/updateCoords",
              item.geometry.coordinates
            );
          }
        });
      });

      this.$store.commit("searchParam/updateCity", event);
      this.$store.commit("searchParam/updateDistrict", null);
      this.districtControl = null;

      for (let i = 0; i < this.cities.length; i++) {
        if (this.cities[i].il === event) {
          this.fillDistrict = this.cities[i].ilceleri;
        }
      }

      // var self = this;
      // self.district_id = event;
    },
    handleDistrictChange() {
      for (let i = 0; i < this.scaleControls.length; i++) {
        if (
          this.scaleControls[i].name === "iller" &&
          this.scaleControls[i].checked != true
        ) {
          this.scaleControls[i].checked = true;
        } else {
          this.scaleControls[i].checked = false;
        }
      }
    },
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/giris");
    },
    triggerChange(checked, val) {
      if (checked === true) {
        for (let i = 0; i < this.scaleControls.length; i++) {
          if (val !== this.scaleControls[i].factor) {
            this.scaleControls[i].checked = false;
          }
        }
        bus.$emit("fireScalechange", val);
      } else {
        bus.$emit("hideGeojson", false);
      }
    },
    getResults() {
      if (this.cityControl === null || this.cityControl === undefined) {
        this.$store.commit("searchParam/updateCoords", null);
      }
      this.$store.commit("searchParam/updateCity", this.cityControl);
      this.$store.commit("searchParam/updateDistrict", this.districtControl);
      this.$store.commit("searchParam/updateMethod", this.methodControl);
      this.$store.commit("searchParam/updateWorkType", this.selectworkType);
      this.$store.commit("searchParam/updateWorkDate", this.selectWorkDate);
      this.$store.commit(
        "searchParam/updateProjectCode",
        this.selectprojectCode
      );
      this.$store.commit("searchParam/updateLogNo", this.selectlogno);
      this.$store.commit("searchParam/updateGeoNo", this.selectgeono);
      this.$store.commit("searchParam/updateDerleme", this.selectderleme);
      this.$store.commit("searchParam/updateCd", this.selectcd);

      //bus.$emit("sendResults"); if only city or district or method is selected
      //bus.$emit("loading", true); if only city or district or method is selected
      if (
        this.cityControl !== null ||
        this.districtControl !== null ||
        this.methodControl !== null ||
        this.selectworkType !== null ||
        this.selectWorkDate !== null ||
        this.selectprojectCode !== null ||
        this.selectlogno !== null ||
        this.selectgeono !== null ||
        this.selectderleme !== null ||
        this.selectcd !== null
      ) {
        bus.$emit("sendResults");
        bus.$emit("loading", true);
      }
    },
    clearNav() {
      this.cityControl = null;
      this.districtControl = null;
      this.fillDistrict = [];
      this.methodControl = null;
      this.selectworkType = null;
      this.selectWorkDate = null;
      this.selectprojectCode = null;
      this.selectlogno = null;
      this.selectgeono = null;
      this.selectderleme = null;
      this.selectcd = null;
      //de-select all scale controls
      for (let i = 0; i < this.scaleControls.length; i++) {
        this.scaleControls[i].checked = false;
      }
      bus.$emit("clearAll", "fullClean");
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    isUseradmin() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_ADMIN");
      }
      return false;
    },
    isUsermoderator() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_MODERATOR");
      }
      return false;
    },
  },
  mounted() {
    EventBus.on("logout", () => {
      this.logOut();
    });

    bus.$on("geojsonSelectCity", (geojsonCity) => {
      this.cityControl = geojsonCity;
      this.districtControl = null;
    });
    bus.$on("clearNavSelections", () => {
      this.methodControl = null;
      this.cityControl = null;
      this.districtControl = null;
      //de-select all scale controls
      for (let i = 0; i < this.scaleControls.length; i++) {
        this.scaleControls[i].checked = false;
      }
    });

    // bus.$on("clearNav", () => {
    //   this.methodSelect.filter((item) => {
    //     item.checked = false;
    //   });
    //   this.scaleControls.filter((item) => {
    //     item.checked = false;
    //   });
    // });
  },
  beforeDestroy() {
    EventBus.remove("logout");
  },
  watch: {
    // Watch for changes in the calisma_tarihi data property
    calisma_tarihi: {
      handler(newValue) {
        // Check if the new value is not null and has a length greater than 0
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          // Data is available, show the corresponding v-list-group or select
          this.showCalismaTarihiSelect = true;
        } else {
          // Data is null or empty, hide the corresponding v-list-group or select
          this.showCalismaTarihiSelect = false;
          this.selectWorkDate = null;
        }
      },
      deep: true,

      immediate: true, // This will trigger the handler immediately when the component is created
    },
    // Add similar watchers for other data properties...
    calisma_amaci: {
      handler(newValue) {
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          this.showCalismaAmaciSelect = true;
        } else {
          this.showCalismaAmaciSelect = false;
          this.selectworkType = null;
        }
      },
      deep: true,

      immediate: true,
    },
    proje_kodu: {
      handler(newValue) {
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          this.showProjeKoduSelect = true;
        } else {
          this.showProjeKoduSelect = false;
          this.selectprojectCode = null;
        }
      },
      deep: true,

      immediate: true,
    },
    kuyu_arsiv_no: {
      handler(newValue) {
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          this.showKuyuArsivNoSelect = true;
        } else {
          this.showKuyuArsivNoSelect = false;
          this.selectlogno = null;
        }
      },
      deep: true,

      immediate: true,
    },
    jeofizik_arsiv_no: {
      handler(newValue) {
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          this.showJeofizikArsivNoSelect = true;
        } else {
          this.showJeofizikArsivNoSelect = false;
          this.selectgeono = null;
        }
      },
      deep: true,

      immediate: true,
    },
    derleme_no: {
      handler(newValue) {
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          this.showDerlemeNoSelect = true;
        } else {
          this.showDerlemeNoSelect = false;
          this.selectderleme = null;
        }
      },
      deep: true,

      immediate: true,
    },
    cd_no: {
      handler(newValue) {
        if (
          newValue !== null &&
          Array.isArray(newValue) &&
          newValue.some((item) => item !== null)
        ) {
          this.showCdNoSelect = true;
        } else {
          this.showCdNoSelect = false;
          this.selectcd = null;
        }
      },
      deep: true,
      immediate: true,
    },

    $route: function () {
      // Check if given route is true, if it is then hide Nav.
      if (this.$route.query.tab === "harita-gorunumu") {
        this.showNavelement = true;
      } else {
        this.showNavelement = false;
      }
    },
  },
};
</script>
