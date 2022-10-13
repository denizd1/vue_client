<template>
  <div>
    <v-overlay style="z-index: 6" v-show="loading">
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
    <v-col
      sm="8"
      md="6"
      lg="4"
      align-center
      justify-center
      class="mx-auto text-center"
      v-if="!submitted"
    >
      <v-tabs
        align-center
        justify-center
        centered
        v-model="tab"
        background-color="transparent"
      >
        <v-tab href="#excel-import">Excel Import</v-tab>
      </v-tabs>
      <v-tabs-items
        style="background-color: transparent !important"
        v-model="tab"
      >
        <v-tab-item :key="1" value="excel-import">
          <v-file-input
            class="mt-3"
            v-model="filestoImport"
            counter
            clearable="true"
            label="Dosya Seçimi"
            multiple
            placeholder="Yüklemek için xls ya da xlsx uzantılı bir Excel dosyası
            seçin."
            prepend-icon="mdi-paperclip"
            outlined
            :show-size="1000"
            @change="importExcel"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
          </v-file-input>
          <v-overlay style="z-index: 6" v-show="show">
            <v-layout align-center justify-center column fill-height>
              <v-flex row align-center justify-center>
                <v-card color="#ffffff">
                  <v-card-text class="justify-center" style="color: #00000099">
                    {{ message }}
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="secondary" text @click="show = false">
                      Kapat
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-flex>
            </v-layout>
          </v-overlay>
          <v-btn color="primary" @click="dataImporter">Excel Import</v-btn>
        </v-tab-item>
      </v-tabs-items>
    </v-col>
    <v-col sm="8" md="6" lg="4" align-center class="mx-auto" v-else>
      <v-card class="text-center justify-center">
        <v-card-title class="justify-center" v-if="showSubmit">
          Nokta(lar) Başarıyla Eklendi!
        </v-card-title>

        <v-card-subtitle v-if="showSubmit">
          Yeni bir dosya yüklemek için 'Ekle' butonuna basın.
        </v-card-subtitle>
        <v-card-subtitle v-if="dialog">
          Eklediğiniz dosyalardaki bazı noktalar, veritabanında bulunmaktadır.
          Veritabanındaki noktaları görmek için
          <button v-on:click="errorDialog = true">
            <span style="text-decoration: underline">tıklayınız</span>.
          </button>

          <!-- <v-btn color="green darken-1" text @click="errorDialog = true">
          ediniz.
        </v-btn> -->
        </v-card-subtitle>

        <v-card-actions class="justify-center">
          <v-btn color="success" @click="newTutorial">Ekle</v-btn>
        </v-card-actions>
      </v-card>

      <v-overlay style="z-index: 6" v-if="errorDialog">
        <v-layout align-center justify-center column fill-height>
          <v-flex row align-center justify-center>
            <v-card color="#ffffff">
              <v-card-title
                text-center
                class="justify-center"
                style="color: black"
              >
                Bu nokta(lar) veritabanında bulunmaktadir!
              </v-card-title>
              <perfect-scrollbar>
                <v-card-text>
                  <!-- <div style="white-space: pre">{{ message }}</div> -->

                  <v-list
                    color="#ffffff"
                    style="max-height: 400px; width: 100%"
                  >
                    <v-list-item
                      style="color: #00000099 !important"
                      v-for="(item, index) in errorMessage"
                      :key="index"
                    >
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="item.err"
                        ></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </perfect-scrollbar>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" text @click="errorDialog = false">
                  Kapat
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-overlay>
    </v-col>
  </div>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
import citiesLatLongjson from "../data/cities_of_turkey.json";
import centerofmass from "@turf/center-of-mass";
import { latLng } from "leaflet";
import * as utmObj from "utm-latlng";
import { bus } from "../main";

// import { Base64 } from "js-base64";
export default {
  name: "add-tutorial",
  data() {
    return {
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
      filestoImport: [],
      submitted: false,
      excelDatalist: {},
      message: "",
      show: false,
      dialog: false,
      showSubmit: false,
      loading: false,
      errorDialog: false,
      errorMessage: [],
      forStart: 0,
      forEnd: 0,
    };
  },
  /*Check role before route enter */
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      var val = vm.$store.state.auth.user;
      if (!val) {
        vm.$router.push({ name: "giris" });
      } else if (val) {
        if (val.roles[0] == "ROLE_USER") {
          vm.$router.push({ name: "calismalar" });
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
  mounted() {
    bus.$on("alldone", () => {
      this.loading = false;
      this.submitted = true;
      this.showSubmit = true;
    });
  },
  /*methods*/
  methods: {
    /**
     *
     * Replace file headers with database headers
     */
    getHeader(sheet) {
      const XLSX = require("xlsx");
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
     * Check the file(s) and the file(s) format first, then read the file
     */
    importExcel(e) {
      this.show = false;
      this.loading = true;
      this.excelDatalist = [];
      for (let i = 0; i < e.length; i++) {
        const files = e[i];

        if (!/\.(xls|xlsx)$/.test(files.name.toLowerCase())) {
          this.message =
            "Yalnızca xls ya da xlsx uzantılı dosya yukleyebilirsiniz!";
          this.show = true;
          this.loading = false;
          return;
        } else {
          this.show = false;
        }
        var fileReader = new FileReader();

        fileReader.onload = (ev) => {
          try {
            const data = ev.target.result;
            const XLSX = require("xlsx");

            const workbook = XLSX.read(data, {
              type: "binary", //string
            });
            const wsname = workbook.SheetNames[1]; // Take the first sheet，wb.SheetNames[0] :Take the name of the first sheet in the sheets
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // Generate JSON table content，wb.Sheets[Sheet]    Get the data of the first sheet
            const a = workbook.Sheets[workbook.SheetNames[1]];
            const headers = this.getHeader(a);

            // Edit data
            // console.log(XLSX.utils.sheet_to_json(workbook.Sheets[wsname]));
            for (var j = 0; j < ws.length; j++) {
              const objects = {};
              for (let index = 0; index < this.fileHeader.length; index++) {
                objects[this.fileHeader[index]] = ws[j][headers[index]]
                  ? ws[j][headers[index]]
                  : null;
              }
              this.excelDatalist.push(objects);
            }

            // console.log("headers", headers);
            // Get header2-2
          } catch (e) {
            return alert("Read failure!");
          }
        };
        fileReader.readAsBinaryString(files);
        this.loading = false;
      }
    },
    /*
      Convert x, y to lat, lng for geometry column in database
    */
    converter(x, y, zone, datum) {
      var utm = null;
      if (datum === "WGS_84") {
        utm = new utmObj("WGS 84");
      }
      if (datum === "ED_50") {
        utm = new utmObj("ED50");
      }
      var point = utm.convertUtmToLatLng(x, y, zone, "N");

      return latLng(point.lat, point.lng);
    },
    /**
     * Convert excel date to js date
     */
    ExcelDateToJSDate(serial) {
      var utc_days = Math.floor(serial - 25569);
      var utc_value = utc_days * 86400;
      var date_info = new Date(utc_value * 1000);

      var fractional_day = serial - Math.floor(serial) + 0.0000001;

      var total_seconds = Math.floor(86400 * fractional_day);

      var seconds = total_seconds % 60;

      total_seconds -= seconds;

      return new Date(
        date_info.getFullYear(),
        date_info.getMonth(),
        date_info.getDate()
      );
    },
    /*
    Function for arrange the data and call the service.
    */

    dataImporter() {
      if (this.filestoImport.length === 0) {
        this.message = "Lütfen dosya seçiniz!";
        this.show = true;
        return;
      } else {
        this.loading = true;
        var dataarr = this.excelDatalist;
        var dataChunked = [];
        var data = dataarr;
        var dataLength = data.length;
        var dataChunk = 100;

        for (var i = 0; i < dataLength; i += dataChunk) {
          dataChunked.push(data.slice(i, i + dataChunk));
        }
        if (this.show === false) {
          (async () => {
            let generator = this.generateSequence(
              0,
              dataChunked.length - 1,
              dataChunked
            );
            for await (let value of generator) {
              await this.importData(value, dataChunked.length); // 1, then 2, then 3, then 4, then 5 (with delay between)
            }
          })();
        }
      }
    },
    async *generateSequence(start, end, data) {
      for (let i = start; i <= end; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        yield data[i];
      }
    },
    //import data
    async importData(dataarray, len) {
      let senddata = [];
      for (let i = 0; i < dataarray.length; i++) {
        let data = {};
        Object.entries(dataarray[i]).forEach(([key, value]) => {
          if (key === "nokta_adi") {
            if (typeof value === "number") {
              value = value.toString();
            }
            data[key] = value.includes("_") ? value.replace(/_/g, " ") : value;
          } else {
            var val = value ? this.replaceVal(value) : null;

            data[key] = val; // key - value
          }
        });
        data["editorname"] = this.$store.state.auth.user.username;
        var latlon = null;
        var dummyCity = null;
        if (data["il"].includes(",")) {
          dummyCity = data["il"].split(",")[0];
        } else {
          dummyCity = data["il"];
        }
        var thisCity = citiesLatLongjson.filter(
          (city) => city.il == dummyCity
        )[0];
        data["lat"] = parseFloat(thisCity.longitude);
        data["lon"] = parseFloat(thisCity.latitude);
        if (data["x"] != null && data["y"] != null) {
          latlon = this.converter(
            data["x"],
            data["y"],
            data["zone"],
            data["datum"]
          );
          data["lat"] = latlon.lng;
          data["lon"] = latlon.lat;
        }

        if (
          data["profil_baslangic_x"] != null &&
          data["profil_baslangic_y"] != null &&
          data["profil_bitis_x"] != null &&
          data["profil_bitis_y"] != null
        ) {
          var polyLineStart = this.converter(
            data["profil_baslangic_x"],
            data["profil_baslangic_y"],
            data["zone"],
            data["datum"]
          );
          var polyLineEnd = this.converter(
            data["profil_bitis_x"],
            data["profil_bitis_y"],
            data["zone"],
            data["datum"]
          );
          /*
           * Find midpoint between two coordinates points
           * Source : http://www.movable-type.co.uk/scripts/latlong.html
           */

          //-- Define radius function
          if (typeof Number.prototype.toRad === "undefined") {
            Number.prototype.toRad = function () {
              return (this * Math.PI) / 180;
            };
          }

          //-- Define degrees function
          if (typeof Number.prototype.toDeg === "undefined") {
            Number.prototype.toDeg = function () {
              return this * (180 / Math.PI);
            };
          }

          //-- Define middle point function

          //-- Longitude difference
          var dLng = (polyLineEnd.lng - polyLineStart.lng).toRad();

          //-- Convert to radians
          var lat1 = polyLineStart.lat.toRad();
          var lat2 = polyLineEnd.lat.toRad();
          var lng1 = polyLineStart.lng.toRad();

          var bX = Math.cos(lat2) * Math.cos(dLng);
          var bY = Math.cos(lat2) * Math.sin(dLng);
          var lat3 = Math.atan2(
            Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY)
          );
          var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);
          data["lat"] = lng3.toDeg();
          data["lon"] = lat3.toDeg();
        }

        if (
          data["a_1"] != null &&
          data["a_2"] != null &&
          data["a_3"] != null &&
          data["a_4"] != null
        ) {
          var corners = [data["a_1"], data["a_2"], data["a_3"], data["a_4"]]; //typeof string
          var coordinates = [];

          //need to convert string to number then convert utm to latlng
          for (let i = 0; i < corners.length; i++) {
            var corner = corners[i];
            var cornerCoordinates = corner.split(",");
            var x = parseInt(cornerCoordinates[0]);
            var y = parseInt(cornerCoordinates[1]);

            var cornerPoint = this.converter(x, y, data["zone"], data["datum"]);
            coordinates.push([cornerPoint.lng, cornerPoint.lat]);
          }
          var close = this.converter(
            parseInt(corners[0].split(",")[0]),
            parseInt(corners[0].split(",")[1]),
            data["zone"],
            data["datum"]
          );
          coordinates.push([close.lng, close.lat]);
          var geoJson = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  mytag: "datdat",
                  name: "datdat",
                  tessellate: true,
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [coordinates],
                },
              },
            ],
          };
          var centerOfMass = centerofmass(geoJson);
          data["lat"] = centerOfMass.geometry.coordinates[0];
          data["lon"] = centerOfMass.geometry.coordinates[1];
        }

        if (typeof data["calisma_tarihi"] !== "string") {
          var regex = /^(181[2-9]|18[2-9]\d|19\d\d|2\d{3}|30[0-3]\d|304[0-8])$/;
          if (regex.test(data["calisma_tarihi"])) {
            data["calisma_tarihi"] = data["calisma_tarihi"].toString();
          } else {
            var dummyDate = this.ExcelDateToJSDate(data["calisma_tarihi"]);
            data["calisma_tarihi"] =
              dummyDate.getDate() +
              "/" +
              (dummyDate.getMonth() + 1) +
              "/" +
              dummyDate.getFullYear();
          }
        }
        senddata.push(data);
      }
      TutorialDataService.create(senddata, len)
        .then(() => {})

        .catch((error) => {
          this.dialog = true;
          this.errorMessage.push({
            err:
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString(),
          });
        });
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    /*
      Replaces corresponding cells in excel
    */
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
        case "HAVADAN MANYETIK":
          return "Havadan Manyetik";
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
        case "2_BOYUTLU_SISMIK_KIRILMA":
          return "2 Boyutlu Sismik Kırılma";
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
        case "YOK":
          return "Yok";
        default:
          return value;
      }
    },

    /**
     * To go back to import field in order to import new files
     */
    newTutorial() {
      bus.$emit("resetCount");
      this.filestoImport = [];
      this.submitted = false;
      this.showSubmit = false;
      this.dialog = false;
      this.loading = false;
      this.errorMessage = [];
      this.errorDialog = false;
    },
  },
};
</script>
