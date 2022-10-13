<template>
  <v-col v-if="newData" class="mx-auto py-3" sm="8" md="6" lg="4">
    <v-form ref="form" lazy-validation>
      <template v-for="(val, key, index) in newData">
        <v-text-field
          class="pb-2"
          v-if="val !== null"
          v-model="currentTutorial[key]"
          :key="index"
          :label="headers[index]"
          :rules="[(v) => !!v || 'Bu alan boş bırakılamaz.']"
          required
        ></v-text-field>
      </template>

      <label><strong>Durum:</strong></label>
      {{ currentTutorial.published ? "Yayında" : "Beklemede" }}
      <v-divider class="my-5"></v-divider>
      <v-btn
        v-show="hidebuttons"
        v-if="currentTutorial.published"
        @click="updatePublished(false)"
        color="primary"
        small
        class="mr-2"
      >
        Yayından Kaldır
      </v-btn>

      <v-btn
        v-show="hidebuttons"
        v-else
        @click="updatePublished(true)"
        color="primary"
        small
        class="mr-2"
      >
        Yayınla
      </v-btn>

      <v-btn
        v-show="hidebuttons"
        color="error"
        small
        class="mr-2"
        @click="deleteTutorial"
      >
        Sil
      </v-btn>

      <v-btn color="success" small @click="updateTutorial"> Güncelle </v-btn>
    </v-form>

    <p class="mt-3">{{ message }}</p>
  </v-col>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
import { bus } from "../main";
import { latLng } from "leaflet";
import * as utmObj from "utm-latlng";
export default {
  name: "tutorial",
  data() {
    return {
      currentTutorial: null,
      newData: null,
      message: "",
      hidebuttons: true,
      headers: [
        "Nokta/Kuyu/Profil Adı",
        "Yöntem",
        "Alt Yöntem",
        "Çalışma Amacı",
        "Satılabilirlik",
        "Ham Veri",
        "Çalışma Tarihi",
        "Proje Kodu",
        "Kuyu Arşiv No",
        "Jeofizik Arşiv No",
        "Derleme No",
        "CD No",
        "İl",
        "İlçe",
        "x",
        "y",
        "z",
        "Profil Başlangıç (x)",
        "Profil Başlangıç (y)",
        "Profil Bitiş (x)",
        "Profil Bitiş (y)",
        "Zone",
        "Datum",
        "1/500000",
        "1/100000",
        "1/25000",
        "Ölçülen Parametre(ler)",
        "Açılım Yönü",
        "Açılım Yöntemi",
        "Frekans Aralığı",
        "MT Ölçü Süresi (saat)",
        "Z Bileşeni",
        "AMT Ölçüsü",
        "AMT Ölçü Süresi",
        "TEM Ölçüsü",
        "Kalibrasyon Dosyası",
        "Veri Formatı",
        "Derinlik (m) - AB/2 (m)",
        "Derinlik (m) GR",
        "Derinlik (m) NEU",
        "Derinlik (m) DEN",
        "Derinlik (m) RES",
        "Derinlik (m) SP",
        "Derinlik (m) CAL",
        "Derinlik (m) TERM",
        "Derinlik (m) SGR",
        "Derinlik (m) CBL",
        "Derinlik (m) SON",
        "Derinlik (m) CCL",
        "Hat Boyu (m)",
        "Kayıt Boyu (sn)",
        "Sweep Süresi (sn)",
        "Sweep Tipi",
        "Sweep Sayısı",
        "Sweep Frekansları (hz)",
        "Sweep Taper (ms)",
        "Yayım Tipi",
        "Offset (m)",
        "Jeofon Dizilimi",
        "Grup Aralığı (m)",
        "Atış Aralığı (m)",
        "Örnekleme Aralığı (ms)",
        "Ekipman",
        "Enerji Kaynağı",
        "Km^2",
        "Profil Boyu (km)",
        "Elektrot Aralığı",
        "Dizilim Türü",
        "Seviye Sayısı",
        "Profil Aralığı",
        "A1",
        "A2",
        "A3",
        "A4",
        "Ölçü Karne No",
        "Dış Loop Boyutu",
      ],
    };
  },
  methods: {
    updatePublished(status) {
      var data = {
        published: status,
      };

      TutorialDataService.update(this.currentTutorial.id, data)
        .then(() => {
          this.currentTutorial.published = status;
        })
        .catch((e) => {
          console.log(e);
        });
    },
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

    updateTutorial() {
      var latlon = null;

      if (this.currentTutorial.x != null && this.currentTutorial.y != null) {
        latlon = this.converter(
          parseFloat(this.currentTutorial.x),
          parseFloat(this.currentTutorial.y),
          parseInt(this.currentTutorial.zone),
          parseInt(this.currentTutorial.datum)
        );
        this.currentTutorial.lat = latlon.lng;
        this.currentTutorial.lon = latlon.lat;
      }

      if (
        this.currentTutorial.profil_baslangic_x != null &&
        this.currentTutorial.profil_baslangic_y != null &&
        this.currentTutorial.profil_bitis_x != null &&
        this.currentTutorial.profil_bitis_y != null
      ) {
        var polyLineStart = this.converter(
          parseFloat(this.currentTutorial.profil_baslangic_x),
          parseFloat(this.currentTutorial.profil_baslangic_y),
          parseInt(this.currentTutorial.zone),
          parseInt(this.currentTutorial.datum)
        );
        var polyLineEnd = this.converter(
          parseFloat(this.currentTutorial.profil_bitis_x),
          parseFloat(this.currentTutorial.profil_bitis_y),
          parseInt(this.currentTutorial.zone),
          parseInt(this.currentTutorial.datum)
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
        this.currentTutorial.lat = lng3.toDeg();
        this.currentTutorial.lon = lat3.toDeg();
      }

      this.currentTutorial.editorame = this.$store.state.auth.user.username;
      TutorialDataService.update(this.currentTutorial.id, this.currentTutorial)
        .then(() => {
          this.message = "İçerik Başarıyla Güncellendi";
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteTutorial() {
      TutorialDataService.delete(this.currentTutorial.id)
        .then(() => {
          this.$router.push({ name: "calismalar" });
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },

  async beforeRouteEnter(to, from, next) {
    let fetchTutorial = await TutorialDataService.get(to.params.id);

    next((vm) => {
      var thisPerson = vm.$store.state.auth.user;
      if (thisPerson) {
        var thisAdmin = thisPerson.roles.includes("ROLE_ADMIN");
        var thisMod = thisPerson.roles.includes("ROLE_MODERATOR");
        if (thisMod) {
          vm.hidebuttons = false;
        }
        if (thisAdmin || thisMod) {
          vm.currentTutorial = fetchTutorial.data;
          vm.newData = Object.fromEntries(
            Object.entries(vm.currentTutorial).filter(
              ([key]) =>
                !key.includes("id") &&
                !key.includes("updatedAt") &&
                !key.includes("createdAt") &&
                !key.includes("published") &&
                !key.includes("lat") &&
                !key.includes("lon") &&
                !key.includes("editorname")
            )
          );
          bus.$emit("reRender");
        } else next({ name: "giris" });
      } else next({ name: "giris" });
    });
  },
};
</script>
