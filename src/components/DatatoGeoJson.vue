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
            accept=".txt, .kmz"
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
import centerofmass from "@turf/center-of-mass";
//import JSZip package
import JSZip from "jszip";
//import togeojson
import toGeoJSON from "@mapbox/togeojson";
export default {
  name: "DatatoGeoJson",
  data() {
    return {
      filestoImport: [],
      coordinates: null,
      geoJson: null,
      dialog: false,
      datums: ["WGS 84", "ED 50"],
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

          var centerOfMass = centerofmass(this.geoJson);
          bus.$emit(
            "plotGeojson",
            this.geoJson,
            [
              centerOfMass.geometry.coordinates[1],
              centerOfMass.geometry.coordinates[0],
            ],
            "geojsonFlag"
          );
        }
      },
    },
  },
  methods: {
    converter(arr, datum) {
      var utm = null;
      if (datum === "WGS 84") {
        utm = new utmObj("WGS 84");
      }
      if (datum === "ED 50") {
        utm = new utmObj("ED50");
      }
      var point = utm.convertUtmToLatLng(arr[0], arr[1], arr[2], "N");

      return latLng(point.lat, point.lng);
    },
    spliceIntoChunks(arr, chunkSize) {
      const res = [];
      while (arr.length > 0) {
        const chunk = this.converter(
          arr.splice(0, chunkSize),
          this.selectedDatum
        );
        res.push([chunk.lng, chunk.lat]);
      }
      return res;
    },
    importData() {
      bus.$emit("clearMap");

      //get uploaded file extension
      let getDom = (xml) => new DOMParser().parseFromString(xml, "text/xml");
      let getExtension = this.filestoImport[0].name.split(".").pop();
      if (getExtension === "kmz" || getExtension === "KMZ") {
        //use jzip and togeojson to convert kmz to geojson
        const reader = new FileReader();
        reader.onload = (e) => {
          JSZip.loadAsync(e.target.result).then((zip) => {
            zip
              .file("doc.kml")
              .async("string")
              .then((kml) => {
                var geojson = toGeoJSON.kml(getDom(kml));
                geojson.features[0].properties.mytag = "datdat";
                geojson.features[0].properties.name = "datdat";
                geojson.features[0].properties.tessellate = true;
                delete geojson.features[0].properties["stroke"];
                delete geojson.features[0].properties["stroke-opacity"];
                delete geojson.features[0].properties["stroke-width"];
                delete geojson.features[0].properties.styleHash;
                delete geojson.features[0].properties.styleUrl;

                //calculate center of mass if geojson is polygon
                if (
                  geojson.features[0].geometry.type === "Polygon" ||
                  geojson.features[0].geometry.type === "MultiPolygon"
                ) {
                  var centerOfMass = centerofmass(geojson);
                  bus.$emit(
                    "plotGeojson",
                    geojson,
                    [
                      centerOfMass.geometry.coordinates[1],
                      centerOfMass.geometry.coordinates[0],
                    ],
                    "geojsonFlag"
                  );
                }
                //if linestring, calculate center of mass
                if (
                  geojson.features[0].geometry.type === "LineString" ||
                  geojson.features[0].geometry.type === "MultiLineString"
                ) {
                  //convert linestring to polygon
                  var linestring = geojson.features[0].geometry.coordinates;
                  var polygon = [];
                  polygon.push(linestring);
                  geojson.features[0].geometry.coordinates = polygon;
                  geojson.features[0].geometry.type = "Polygon";

                  var masscenter = centerofmass(geojson);
                  bus.$emit(
                    "plotGeojson",
                    geojson,
                    [
                      masscenter.geometry.coordinates[1],
                      masscenter.geometry.coordinates[0],
                    ],
                    "geojsonFlag"
                  );
                }
                //center is the point if geojson is point
                if (geojson.features[0].geometry.type === "Point") {
                  bus.$emit(
                    "plotGeojson",
                    geojson,
                    [
                      geojson.features[0].geometry.coordinates[1],
                      geojson.features[0].geometry.coordinates[0],
                    ],
                    "geojsonFlag"
                  );
                }
              });
          });
        };
        reader.readAsBinaryString(this.filestoImport[0]);

        this.dialog = false;
      }
      if (getExtension === "txt") {
        if (this.selectedDatum === null) {
          this.message = "Datum Seçiniz";
          return;
        }
        if (this.selectedDatum != null) {
          this.filestoImport.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.coordinates = this.spliceIntoChunks(
                JSON.parse(
                  "[" +
                    e.target.result
                      .split("\n")
                      .map((line) => line.split("\t")) +
                    "]"
                ),
                3
              );
            };
            reader.readAsBinaryString(file);
          });
          this.dialog = false;
        }
      }
    },
  },
};
</script>
