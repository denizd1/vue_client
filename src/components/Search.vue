<template>
  <v-dialog v-model="dialog" @keydown.esc="dialog = false">
    <v-card>
      <v-card-title class="justify-end grey lighten-2 mb-3">
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="2" class="float-left pl-0">
            <v-select
              v-model="cityselect"
              item-value="il"
              item-text="il"
              label="İl"
              :items="cities"
              single-line
              @change="handleChange"
            ></v-select>
          </v-col>
          <v-col cols="2" class="float-left pl-0">
            <v-select
              v-model="districtselect"
              label="İlçe"
              item-value="plaka"
              item-text="ilceleri"
              :items="fillDistrict"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectmethod"
              label="Yöntem"
              item-value="yontem"
              :items="yontem"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectsubMethod"
              label="Alt Yöntem"
              item-value="alt_yontem"
              :items="alt_yontem"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectworkType"
              label="Çalışma Amacı"
              item-value="calisma_amaci"
              :items="calisma_amaci"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectrawData"
              label="Ham Veri"
              item-value="ham_veri"
              :items="ham_veri"
              single-line
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectWorkDate"
              label="Çalışma Tarihi"
              item-value="calisma_tarihi"
              :items="calisma_tarihi"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectprojectCode"
              label="Proje Kodu"
              item-value="proje_kodu"
              :items="proje_kodu"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectlogno"
              label="Kuyu Arşiv No"
              item-value="kuyu_arsiv_no"
              :items="kuyu_arsiv_no"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectgeono"
              label="Jeofizik Arşiv No"
              item-value="jeofizik_arsiv_no"
              :items="jeofizik_arsiv_no"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectderleme"
              label="Derleme No"
              item-value="derleme_no"
              :items="derleme_no"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectcd"
              label="CD No"
              item-value="cd_no"
              :items="cd_no"
              single-line
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectzone"
              label="Zone"
              item-value="zone"
              :items="zone"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="selectdatum"
              label="Datum"
              item-value="datum"
              :items="datum"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="select500"
              label="Beşyüzbin"
              item-value="besyuzbin"
              :items="besyuzbin"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="select100"
              label="Yüzbin"
              item-value="yuzbin"
              :items="yuzbin"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="2" v-if="show" class="float-left pl-0">
            <v-select
              v-model="select25"
              label="Yirmibesbin"
              item-value="yirmibesbin"
              :items="yirmibesbin"
              single-line
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="search()"> Ara </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import citiesJson from "../../../app/cities_of_turkey.json";
import TutorialDataService from "../services/TutorialDataService";
import { bus } from "../main";

export default {
  data() {
    return {
      cities: citiesJson,
      show: false,
      dialog: false,
      fillDistrict: [],
      selectCity: null,
      selectDistrict: null,
      yontem: null,
      alt_yontem: null,
      calisma_amaci: null,
      ham_veri: null,
      calisma_tarihi: null,
      proje_kodu: null,
      kuyu_arsiv_no: null,
      jeofizik_arsiv_no: null,
      derleme_no: null,
      cd_no: null,
      zone: null,
      datum: null,
      besyuzbin: null,
      yuzbin: null,
      yirmibesbin: null,
      //models
      cityselect: null,
      districtselect: null,
      selectmethod: null,
      selectsubMethod: null,
      selectworkType: null,
      selectrawData: null,
      selectWorkDate: null,
      selectprojectCode: null,
      selectlogno: null,
      selectgeono: null,
      selectderleme: null,
      selectcd: null,
      selectzone: null,
      selectdatum: null,
      select500: null,
      select100: null,
      select25: null,
    };
  },
  methods: {
    handleChange(event) {
      this.cities.filter((elem) => {
        if (elem.il === event) {
          this.fillDistrict = elem.ilceleri;
        }
      });
    },
    //search method. get all models and send to backend
    search() {
      const params = {};
      if (this.selectmethod !== null) {
        params["yontem"] = this.selectmethod;
      }
      if (this.selectsubMethod !== null) {
        params["alt_yontem"] = this.selectsubMethod;
      }
      if (this.selectworkType !== null) {
        params["calisma_amaci"] = this.selectworkType;
      }
      if (this.selectrawData !== null) {
        params["ham_veri"] = this.selectrawData;
      }
      if (this.selectprojectCode !== null) {
        params["proje_kodu"] = this.selectprojectCode;
      }
      if (this.selectlogno !== null) {
        params["kuyu_arsiv_no"] = this.selectlogno;
      }
      if (this.selectgeono !== null) {
        params["jeofizik_arsiv_no"] = this.selectgeono;
      }
      if (this.selectderleme !== null) {
        params["derleme_no"] = this.selectderleme;
      }
      if (this.selectcd !== null) {
        params["cd_no"] = this.selectcd;
      }
      if (this.selectzone !== null) {
        params["zone"] = this.selectzone;
      }
      if (this.selectdatum !== null) {
        params["datum"] = this.selectdatum;
      }
      if (this.select500 !== null) {
        params["besyuzbin"] = this.select500;
      }
      if (this.select100 !== null) {
        params["yuzbin"] = this.select100;
      }
      if (this.select25 !== null) {
        params["yirmibesbin"] = this.select25;
      }
      if (this.cityselect !== null) {
        params["il"] = this.cityselect;
      }
      if (this.districtselect !== null) {
        params["ilce"] = this.districtselect;
      }
      if (this.selectWorkDate !== null) {
        params["calisma_tarihi"] = this.selectWorkDate;
      }

      bus.$emit("search", params);
      this.dialog = false;
    },
  },
  mounted() {
    bus.$on("openAdvancedSearchDialog", () => {
      const params = {
        column: [
          "yontem",
          "alt_yontem",
          "calisma_amaci",
          "ham_veri",
          "proje_kodu",
          "kuyu_arsiv_no",
          "jeofizik_arsiv_no",
          "derleme_no",
          "cd_no",
          "zone",
          "datum",
          "besyuzbin",
          "yuzbin",
          "yirmibesbin",
        ],
      };
      TutorialDataService.distinct(params)
        .then((response) => {
          this.yontem = response.data.yontem.filter((elem) => elem !== null);
          this.alt_yontem = response.data.alt_yontem.filter(
            (elem) => elem !== null
          );
          this.calisma_amaci = response.data.calisma_amaci.filter(
            (elem) => elem !== null
          );
          this.ham_veri = response.data.ham_veri.filter(
            (elem) => elem !== null
          );
          this.proje_kodu = response.data.proje_kodu.filter(
            (elem) => elem !== null
          );
          this.kuyu_arsiv_no = response.data.kuyu_arsiv_no.filter(
            (elem) => elem !== null
          );
          this.jeofizik_arsiv_no = response.data.jeofizik_arsiv_no.filter(
            (elem) => elem !== null
          );
          this.derleme_no = response.data.derleme_no.filter(
            (elem) => elem !== null
          );
          this.cd_no = response.data.cd_no.filter((elem) => elem !== null);
          this.zone = response.data.zone.filter((elem) => elem !== null);
          this.datum = response.data.datum.filter((elem) => elem !== null);
          this.besyuzbin = response.data.besyuzbin.filter(
            (elem) => elem !== null
          );
          this.yuzbin = response.data.yuzbin.filter((elem) => elem !== null);
          this.yirmibesbin = response.data.yirmibesbin.filter(
            (elem) => elem !== null
          );
          //fill calisma_tarihi with years from 1935 to current year
          this.calisma_tarihi = Array.from(
            { length: new Date().getFullYear() - 1935 },
            (v, k) => k + 1935
          );
        })
        .then(() => {
          this.show = true;
          this.dialog = true;
        })
        .catch((e) => {
          console.log(e);
        });
    });
  },

  name: "Search",
};
</script>
