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
          append-icon="mdi-delete"
          @click:append="deleteField(key)"
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
      <!-- a button to open a modal -->
      <v-btn color="primary" small @click="dialog = true" class="mr-2">
        Yeni Bilgi Ekle
      </v-btn>

      <v-btn color="success" small @click="updateTutorial"> Güncelle </v-btn>
    </v-form>

    <p class="mt-3">{{ message }}</p>
    <v-dialog v-model="dialog" max-width="470">
      <v-card>
        <v-card-title class="headline">Yeni Bilgi Ekle</v-card-title>
        <v-card-text>
          <template v-for="(val, key, index) in emptyFields">
            <v-text-field
              v-model="currentTutorial[key]"
              :label="key"
              :key="index"
            ></v-text-field>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Kapat
          </v-btn>
          <v-btn color="blue darken-1" text @click="addNewInfo"> Ekle </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
import citiesLatLongjson from "../../../app/cities_of_turkey.json";

import centerOfMass from "@turf/center-of-mass";
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
      dialog: false,
      emptyFields: [],
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
        "Offset (m) / Uçuş Yüksekliği (~m)",
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
        "Profil Aralığı / Uçuş Yönü",
        "A1",
        "A2",
        "A3",
        "A4",
        "Ölçü Karne No",
        "Loop Boyutu",
      ],
    };
  },
  methods: {
    deleteField(key) {
      this.currentTutorial[key] = null;
    },
    addNewInfo() {
      // Close the dialog
      this.dialog = false;

      this.newData = Object.fromEntries(
        Object.entries(this.currentTutorial).filter(
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
      // Update emptyFields with the keys of empty fields
      this.emptyFields = Object.fromEntries(
        Object.entries(this.currentTutorial).filter(
          ([key, value]) =>
            (value === null || value === "") &&
            !key.includes("id") &&
            !key.includes("updatedAt") &&
            !key.includes("createdAt") &&
            !key.includes("published") &&
            !key.includes("lat") &&
            !key.includes("lon") &&
            !key.includes("editorname")
        )
      );
    },
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
      if (this.currentTutorial.x === "") {
        this.currentTutorial.x = null;
      }
      if (this.currentTutorial.y === "") {
        this.currentTutorial.y = null;
      }
      if (this.currentTutorial.profil_baslangic_x === "") {
        this.currentTutorial.profil_baslangic_x = null;
      }
      if (this.currentTutorial.profil_baslangic_y === "") {
        this.currentTutorial.profil_baslangic_y = null;
      }
      if (this.currentTutorial.profil_bitis_x === "") {
        this.currentTutorial.profil_bitis_x = null;
      }
      if (this.currentTutorial.profil_bitis_y === "") {
        this.currentTutorial.profil_bitis_y = null;
      }
      if (this.currentTutorial.a_1 === "") {
        this.currentTutorial.a_1 = null;
      }
      if (this.currentTutorial.a_2 === "") {
        this.currentTutorial.a_2 = null;
      }
      if (this.currentTutorial.a_3 === "") {
        this.currentTutorial.a_3 = null;
      }
      if (this.currentTutorial.a_4 === "") {
        this.currentTutorial.a_4 = null;
      }

      if (
        typeof this.currentTutorial.zone === "string" &&
        this.currentTutorial.zone.includes(",")
      ) {
        this.currentTutorial.zone = this.currentTutorial.zone
          .split(",")
          .map(Number);
      } else {
        this.currentTutorial.zone = Number(this.currentTutorial.zone);
      }
      var dummyCity = null;
      var thisCity = null;
      if (
        this.currentTutorial.il != null ||
        this.currentTutorial.il != undefined
      ) {
        if (this.currentTutorial.il.includes(",")) {
          dummyCity = this.currentTutorial.il.split(",")[0];
          thisCity = citiesLatLongjson.filter(
            (city) => city.il == dummyCity.trim()
          )[0];
        } else {
          dummyCity = this.currentTutorial.il;
          thisCity = citiesLatLongjson.filter(
            (city) => city.il == dummyCity.trim()
          )[0];
        }
        this.currentTutorial.lat = parseFloat(thisCity.longitude);
        this.currentTutorial.lon = parseFloat(thisCity.latitude);
      }

      if (
        this.currentTutorial.x !== null &&
        this.currentTutorial.y !== null &&
        this.currentTutorial.x !== "" &&
        this.currentTutorial.y !== ""
      ) {
        latlon = this.converter(
          parseFloat(this.currentTutorial.x),
          parseFloat(this.currentTutorial.y),
          parseInt(this.currentTutorial.zone),
          this.currentTutorial.datum.toString()
        );
        this.currentTutorial.lat = latlon.lng;
        this.currentTutorial.lon = latlon.lat;
      }

      if (
        this.currentTutorial.profil_baslangic_x !== null &&
        this.currentTutorial.profil_baslangic_y !== null &&
        this.currentTutorial.profil_bitis_x !== null &&
        this.currentTutorial.profil_bitis_y !== null &&
        this.currentTutorial.profil_baslangic_x !== "" &&
        this.currentTutorial.profil_baslangic_y !== "" &&
        this.currentTutorial.profil_bitis_x !== "" &&
        this.currentTutorial.profil_bitis_y !== ""
      ) {
        var polyLineStart = this.converter(
          parseFloat(this.currentTutorial.profil_baslangic_x),
          parseFloat(this.currentTutorial.profil_baslangic_y),
          parseInt(this.currentTutorial.zone),
          this.currentTutorial.datum.toString()
        );
        var polyLineEnd = this.converter(
          parseFloat(this.currentTutorial.profil_bitis_x),
          parseFloat(this.currentTutorial.profil_bitis_y),
          parseInt(this.currentTutorial.zone),
          this.currentTutorial.datum.toString()
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
      if (
        this.currentTutorial.a_1 !== null &&
        this.currentTutorial.a_2 !== null &&
        this.currentTutorial.a_3 !== null &&
        this.currentTutorial.a_4 !== null &&
        this.currentTutorial.a_1 !== "" &&
        this.currentTutorial.a_2 !== "" &&
        this.currentTutorial.a_3 !== "" &&
        this.currentTutorial.a_4 !== ""
      ) {
        var corners = [
          this.currentTutorial.a_1,
          this.currentTutorial.a_2,
          this.currentTutorial.a_3,
          this.currentTutorial.a_4,
        ]; //typeof string
        var coordinates = [];
        var zone = this.currentTutorial.zone;
        //need to convert string to number then convert utm to latlng
        for (let i = 0; i < corners.length; i++) {
          var corner = corners[i];
          var cornerCoordinates = corner.split(",");
          var x = parseFloat(cornerCoordinates[0]);
          var y = parseFloat(cornerCoordinates[1]);

          var cornerPoint = this.converter(
            x,
            y,
            zone.length > 1 ? zone[i] : zone,
            this.currentTutorial.datum.toString()
          );
          coordinates.push([cornerPoint.lng, cornerPoint.lat]);
        }
        var close = this.converter(
          parseFloat(corners[0].split(",")[0]),
          parseFloat(corners[0].split(",")[1]),
          zone.length > 1 ? zone[0] : zone,
          this.currentTutorial.datum.toString()
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
        var centerofmass = centerOfMass(geoJson);
        this.currentTutorial.lat = centerofmass.geometry.coordinates[0];
        this.currentTutorial.lon = centerofmass.geometry.coordinates[1];
      }
      this.currentTutorial.editorname = this.$store.state.auth.user.username;
      this.currentTutorial.zone = this.currentTutorial.zone.toString();
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
          // Get empty fields only
          vm.emptyFields = Object.fromEntries(
            Object.entries(vm.currentTutorial).filter(
              ([key, value]) =>
                (value === null || value === "") &&
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
