<template>
  <div style="background-color: #fff">
    <v-btn depressed color="primary" text @click="dialog = true">
      Alan Dosyası Yükle
    </v-btn>
    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="grey lighten-2 mb-3">
          Ruhsat alanı çizmek için .txt dosyasını yükleyiniz.
        </v-card-title>

        <v-card-text>
          <v-file-input
            v-model="filestoImport"
            color="deep-purple accent-4"
            counter
            label="Dosya Seçimi"
            multiple
            prepend-icon="mdi-paperclip"
            outlined
            :show-size="1000"
            accept=".txt"
          >
            <template v-slot:selection="{ index, text }">
              <v-chip
                v-if="index < 2"
                color="deep-purple accent-4"
                dark
                label
                small
              >
                {{ text }}
              </v-chip>

              <span
                v-else-if="index === 2"
                class="text-overline grey--text text--darken-3 mx-2"
              >
                +{{ files.length - 2 }} File(s)
              </span>
            </template>
          </v-file-input>
          <v-row>
            <v-col cols="6">
              <v-select
                item-text="zone"
                :items="zones"
                single-line
                placeholder="Zone Seçiniz"
                @change="selectedZone = $event"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                item-text="datum"
                :items="datums"
                single-line
                placeholder="Datum Seçiniz"
                @change="selectedDatum = $event"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-alert
            v-if="message"
            class="mt-3"
            dense
            border="left"
            type="warning"
          >
            {{ message }}
          </v-alert>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="importData()"> Tamam </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { bus } from "../main";
import { latLng } from "leaflet";
import * as utmObj from "utm-latlng";

export default {
  name: "DatatoGeoJson",
  data() {
    return {
      filestoImport: [],
      coordinates: null,
      geoJson: null,
      dialog: false,
      datums: ["WGS 84", "ED 50"],
      zones: [35, 36, 37, 38],
      selectedZone: null,
      selectedDatum: null,
      message: "",
    };
  },
  watch: {
    coordinates: {
      handler: function (coordinates) {
        if (coordinates != null) {
          this.geoJson = {
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
          console.log(this.geoJson);
          bus.$emit("plotGeojson", this.geoJson);
        }
      },
    },
  },
  methods: {
    converter(arr, zone, datum) {
      var utm = null;
      if (datum === "WGS 84") {
        utm = new utmObj("WGS 84");
      }
      if (datum === "ED 50") {
        utm = new utmObj("ED50");
      }
      var point = utm.convertUtmToLatLng(arr[0], arr[1], zone, "N");

      return latLng(point.lat, point.lng);
    },
    spliceIntoChunks(arr, chunkSize) {
      const res = [];
      while (arr.length > 0) {
        const chunk = this.converter(
          arr.splice(0, chunkSize),
          this.selectedZone,
          this.selectedDatum
        );
        res.push([chunk.lng, chunk.lat]);
      }
      return res;
    },
    importData() {
      if (this.selectedZone === null || this.selectedDatum === null) {
        this.message = "Zone ve Datum seçiniz";
        return;
      } else {
        this.filestoImport.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.coordinates = this.spliceIntoChunks(
              JSON.parse(
                "[" +
                  e.target.result.split("\n").map((line) => line.split("\t")) +
                  "]"
              ),
              2
            );
          };
          reader.readAsBinaryString(file);
        });
        this.dialog = false;
      }
    },
  },
};
</script>
