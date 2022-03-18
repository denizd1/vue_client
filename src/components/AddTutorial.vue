<template>
  <v-col cols="12" align="center" class="contentsize mx-auto" v-if="!submitted">
    <v-tabs centered v-model="tab">
      <v-tab href="#addManual">Proje Oluştur</v-tab>
      <v-tab href="#importExcel">Excel Import</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item :key="1" value="addManual">
        <v-form class="mr-3 ml-3" ref="form" lazy-validation>
          <v-select
            item-text="yontemAdi"
            placeholder="Bir jeofizik yöntem seçiniz"
            :items="methodSubmethod"
            single-line
            @change="handleChange"
          >
          </v-select>
          <v-select
            v-if="fillSubMethod.length"
            item-text="altYontemler"
            :items="fillSubMethod"
            placeholder="Bir alt yöntem seçiniz"
            single-line
          ></v-select>

          <v-select
            item-text="il"
            :items="cities"
            single-line
            placeholder="İl Seçiniz"
            @change="handleCityChange"
          ></v-select>

          <v-select
            v-if="fillDistrict.length"
            item-text="ilceleri"
            :items="fillDistrict"
            single-line
            placeholder="İlçe seçiniz"
          ></v-select>

          <v-text-field
            v-model="tutorial.title"
            :rules="[(v) => !!v || 'Bu alan boş bırakılamaz']"
            label="Nokta Adı"
            required
          ></v-text-field>

          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date"
                label="Çalışma Tarihi"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="date"
              :active-picker.sync="activePicker"
              :max="
                new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .substr(0, 10)
              "
              min="1950-01-01"
              locale="tr"
              @change="save"
            ></v-date-picker>
          </v-menu>
          <v-btn color="primary" class="mt-3" @click="saveTutorial"
            >Kaydet</v-btn
          >
        </v-form>
      </v-tab-item>
      <v-tab-item :key="2" value="importExcel">
        <div class="mt-3 mr-3 ml-3">
          <label for="formFile" class="form-label"
            >Yüklemek için xls ya da xlsx uzantılı bir Excel dosyası
            seçin.</label
          >
          <input
            class="form-control"
            type="file"
            id="formFile"
            @change="importExcel"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        </div>
        <div class="mt-3 mr-3 ml-3" v-show="show">
          {{ message }}
        </div>
        <!-- <input type="file" @change="importExcel" accept=".csv" /> -->
        <!-- accept=".csv" -->
        <v-btn color="primary" class="mt-3 mr-3 ml-3" @click="dataImporter"
          >Excel Import</v-btn
        >
      </v-tab-item>
    </v-tabs-items>
  </v-col>
  <v-col cols="4" align="center" class="mx-auto" v-else>
    <v-card style="z-index: 99">
      <v-card-title class="justify-center">
        Proje(ler) Başarıyla Eklendi!
      </v-card-title>

      <v-card-subtitle>
        Yeni bir proje eklemek için 'Ekle' butonuna basın.
      </v-card-subtitle>

      <v-card-actions class="justify-center">
        <v-btn color="success" @click="newTutorial">Ekle</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
import citiesJson from "../data/cities_of_turkey.json";

import xlsx from "xlsx";
// import { Base64 } from "js-base64";
export default {
  name: "add-tutorial",
  data() {
    return {
      tutorial: {
        id: null,
        title: "",
        description: "",
        details: "",
        published: false,
      },
      fileHeader: [
        "nokta_adi",
        "yontem",
        "alt_yontem",
        "calisma_amaci",
        "satilabilirlik",
        "ham_veri",
        "calisma_tarihi",
        "proje_kodu",
        "kuyu_arsiv_no",
        "jeofizik_arsiv_no",
        "derleme_no",
        "cd_no",
        "il",
        "ilce",
        "x",
        "y",
        "z",
        "profil_baslangic_x",
        "profil_baslangic_y",
        "profil_bitis_x",
        "profil_bitis_y",
        "zone",
        "datum",
        "besyuzbin",
        "yuzbin",
        "yirmibesbin",
        "olculen_parametre_ler",
        "acilim_yonu",
        "acilim_yontemi",
        "frekans_araligi",
        "mt_olcu_suresisaat",
        "z_bileseni",
        "amt_olcusu",
        "amt_olcu_suresi",
        "tem_olcusu",
        "kalibrasyon_dosyasi",
        "veri_formati",
        "ab2_m",
        "derinlik_m_gr",
        "derinlik_m_neu",
        "derinlik_m_den",
        "derinlik_m_res",
        "derinlik_m_sp",
        "derinlik_m_cal",
        "derinlik_m_term",
        "derinlik_m_sgr",
        "derinlik_m_cbl",
        "derinlik_m_son",
        "derinlik_m_ccl",
        "hat_boyu_m",
        "kayit_boyu_sn",
        "sweep_suresi_sn",
        "sweep_tipi",
        "sweep_sayisi",
        "sweep_frekanslari_sn_hz",
        "sweep_taper_ms",
        "yayim_tipi",
        "ofsetm",
        "jeofon_dizilimi",
        "grup_araligim",
        "atis_araligim",
        "ornekleme_araligim",
        "ekipman",
        "enerji_kaynagi",
        "km2",
        "profil_boyukm",
        "elektrot_araligi",
        "dizilim_turu",
        "seviye_sayisi",
        "profil_araligi",
        "a_1",
        "a_2",
        "a_3",
        "a_4",
        "olcu_karne_no",
        "dis_loop_boyutu",
      ],
      methodSubmethod: [
        {
          yontemAdi: "Potansiyel Alan Yöntemleri",
          altYontemler: ["Gravite", "Manyetik", "Radyometri", "Süseptibilite"],
        },
        {
          yontemAdi: "Elektrik ve Elektromanyetik Yöntemler",
          altYontemler: [
            "Düşey Elektrik Sondajı (DES)",
            "Geçici Elektromanyetik Yöntem (TEM)",
            "Yapay Uçlaşma Yöntemi (IP)",
            "Gradient Yapay Uçlaşma Yöntemi (IP)",
            "Manyetotellürik (MT)",
            "Audio Manyetotellürik (AMT)",
            "Yapay Kaynaklı Audio Manyetotellürik (CSAMT)",
            "Doğal Potansiyel (SP)",
            "Çok Kanallı Özdirenç Yöntemi",
          ],
        },
        {
          yontemAdi: "Sismik Yöntemler",
          altYontemler: ["2 Boyutlu Sismik Yansıma", "Yer Radarı"],
        },
        {
          yontemAdi: "Kuyu Ölçüleri",
          altYontemler: [
            "Gamma Ray (GR)",
            "Neutron (NEU)",
            "Density (DEN)",
            "Resistivity (RES)",
            "Self Potential (SP)",
            "Caliper (CAL)",
            "Sıcaklık Logu (TERM)",
            "Spektral Gamma Ray (SGR)",
            "Çimento Logu (CBL)",
            "Sonic Log (SON)",
            "Casing Collor Locator (CCL)",
            "Birleşik Log",
          ],
        },
      ],
      cities: citiesJson,
      activePicker: null,
      date: null,
      menu: false,
      submitted: false,
      fillSubMethod: [],
      fillDistrict: [],
      excelDatalist: {},
      select: { yontemAdi: "" },
      message: "",
      show: false,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      var val = vm.$store.state.auth.user;
      if (!val) {
        vm.$router.push({ name: "login" });
      } else if (val) {
        if (val.roles[0] == "ROLE_USER") {
          vm.$router.push({ name: "tutorials-list" });
        }
        if (val.roles[0] == "ROLE_ADMIN") {
          return;
        }
        if (val.roles[0] == "ROLE_MODERATOR") {
          return;
        }
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
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
    },
  },
  methods: {
    getHeader(sheet) {
      const XLSX = xlsx;
      const headers = [];
      const range = XLSX.utils.decode_range(sheet["!ref"]); // worksheet['!ref'] Is the valid range of the worksheet
      let C;
      /* Get cell value start in the first row */
      const R = range.s.r; //Line / / column C
      let i = 0;
      for (C = range.s.c; C <= range.e.c; ++C) {
        var cell =
          sheet[
            XLSX.utils.encode_cell({ c: C, r: R })
          ]; /* Get the cell value based on the address  find the cell in the first row */
        var hdr = "UNKNOWN" + C; // replace with your desired default

        // XLSX.utils.format_cell Generate cell text value
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
        if (hdr.indexOf("UNKNOWN") > -1) {
          if (!i) {
            hdr = "__EMPTY";
          } else {
            hdr = "__EMPTY_" + i;
          }
          i++;
        }
        headers.push(hdr);
      }
      return headers;
    },
    /**
     * Import table
     */
    importExcel(e) {
      this.excelDatalist = [];
      const files = e.target.files;

      if (!files.length) {
        this.show = false;
      } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.show = true;
        this.message =
          "Yalnızca xls ya da xlsx uzantılı dosya yukleyebilirsiniz!";
        return;
      } else {
        this.show = false;
      }

      const fileReader = new FileReader();

      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;

          const XLSX = xlsx;
          const workbook = XLSX.read(data, {
            type: "binary", //string
          });
          const wsname = workbook.SheetNames[1]; // Take the first sheet，wb.SheetNames[0] :Take the name of the first sheet in the sheets
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // Generate JSON table content，wb.Sheets[Sheet]    Get the data of the first sheet
          const a = workbook.Sheets[workbook.SheetNames[1]];
          const headers = this.getHeader(a);
          const excellist = []; // Clear received data

          // Edit data
          console.log(XLSX.utils.sheet_to_json(workbook.Sheets[wsname]));
          for (var j = 0; j < ws.length; j++) {
            console.log(ws[j][j]);
            const objects = {};
            for (let index = 0; index < this.fileHeader.length; index++) {
              objects[this.fileHeader[index]] = ws[j][headers[index]]
                ? ws[j][headers[index]]
                : null;
            }
            excellist.push(objects);
          }
          this.excelDatalist = excellist;
          // console.log(value);

          console.log("headers", headers);
          // Get header2-2
        } catch (e) {
          return alert("Read failure!");
        }
      };
      fileReader.readAsBinaryString(files[0]);
      // readAsText(files[0]);
      // readAsBinaryString(files[0])
      // var input = document.getElementById("upload");
      // input.value = "";
    },
    handleChange(event) {
      this.methodSubmethod.filter((elem) => {
        if (elem.yontemAdi === event) {
          this.fillSubMethod = elem.altYontemler;
        }
      });
      // var self = this;
      // self.district_id = event;
    },
    handleCityChange(event) {
      this.cities.filter((elem) => {
        if (elem.il === event) {
          this.fillDistrict = elem.ilceleri;
        }
      });
      // var self = this;
      // self.district_id = event;
    },
    save(date) {
      this.$refs.menu.save(date);
    },
    dataImporter() {
      var arr = this.excelDatalist;
      console.log(arr);

      for (let i = 0; i < arr.length; i++) {
        var data = {};
        Object.entries(this.excelDatalist[i]).forEach(([key, value]) => {
          var val = value ? this.replaceVal(value) : null;

          data[key] = val; // key - value
        });
        TutorialDataService.create(data)
          .then((response) => {
            this.tutorial.id = response.data.id;
            console.log(response.data);
            this.submitted = true;
          })
          .catch((e) => {
            console.log(e);
          });
      }
      this.excelDatalist = [];
    },
    replaceVal(value) {
      switch (value) {
        case "POTANSıYEL_ALAN_YONTEMLERI":
          return "Potansiyel Alan Yöntemleri";
        case "ELEKTRIK_VE_ELEKTROMANYETIK_YONTEMLER":
          return "Elektrik ve Elektromanyetik Yöntemler";
        case "SISMIK_YONTEMLER":
          return "Sismik Yöntemler";
        case "KUYU_OLCULERI":
          return "Kuyu Ölçüleri";
        case "GRAVITE":
          return "Gravite";
        case "MANYETIK":
          return "Manyetik";
        case "RADYOMETRI":
          return "Radyometri";
        case "SUSEPTIBILITE":
          return "Suseptibilite";
        case "DUSEY_ELEKTRIK_SONDAJI(DES)":
          return "Düşey Elektrik Sondajı (DES)";
        case "GECICI_ELEKTROMANYETIK_YONTEM(TEM)":
          return "Geçici Elektromanyetik Yöntem (TEM)";
        case "YAPAY_UCLASMA_YONTEMI(IP)":
          return "Yapay Uçlaşma Yöntemi (IP)";
        case "GRADIENT_YAPAY_UCLASMA_YONTEMI(IP)":
          return "Gradient Yapay Uçlaşma Yöntemi (IP)";
        case "MANYETO_TELLURIK(MT)":
          return "Manyetotellürik (MT)";
        case "AUDIO_MANYETO_TELLURIK(AMT)":
          return "Audio Manyetotellürik (AMT)";
        case "YAPAY_KAYNAKLI_AUDIO_MANYETO_TELLURIK(CSAMT)":
          return "Yapay Kaynaklı Audio Manyetotellürik (CSAMT)";
        case "DOGAL_POTANSIYEL(SP)":
          return "Doğal Potansiyel (SP)";
        case "COK_KANALLI_OZDIRENC_YONTEMI":
          return "Çok Kanallı Özdirenç Yöntemi";
        case "2_BOYUTLU_SISMIK_YANSIMA":
          return "2 Boyutlu Sismik Yansıma";
        case "YER_RADARI":
          return "Yer Radarı";
        case "GAMMA_RAY(GR)":
          return "Gamma Ray (Gr)";
        case "NEUTRON(NEU)":
          return "Neutron (Neu)";
        case "DENSITY(DEN)":
          return "Density (Den)";
        case "RESISTVITY(RES)":
          return "Resistivity (Res)";
        case "SELF_POTANTIAL(SP)":
          return "Self Potential (SP)";
        case "CALIPER(CAL)":
          return "Caliper (Cal)";
        case "SICAKLIK_LOGU(TERM)":
          return "Sıcaklık Logu (Term)";
        case "SPEKTRAL_GAMMARAY(SGR)":
          return "Spektral Gammaray (SGR)";
        case "CIMENTO_LOGU(CBL)":
          return "Çimento Logu (Cbl)";
        case "SONIC_LOG(SON)":
          return "Sonic Log (Son)";
        case "CASING_COLLOR_LOCATOR(CCL)":
          return "Casing Collor Locator (CCL)";
        case "BIRLESIK_LOG":
          return "Birleşik Log";
        case "LİNEER":
          return "Lineer";
        case "SATILABILIR":
          return "Satılabilir";
        case "RADYOAKTİF HAMMADDE":
          return "Radyoaktif Hammadde";
        case "KOMUR":
          return "Kömür";
        case "VAR":
          return "Var";
        default:
          return value;
      }
    },
    saveTutorial() {
      var data = {
        title: this.tutorial.title,
        description: this.tutorial.description,
        details: this.tutorial.details,
      };

      TutorialDataService.create(data)
        .then((response) => {
          this.tutorial.id = response.data.id;
          console.log(response.data);
          this.submitted = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    newTutorial() {
      this.submitted = false;
      this.tutorial = {};
    },
  },
};
</script>

<style>
.contentsize {
  max-width: 500px;
  position: relative;
  z-index: 4;
}
</style>
