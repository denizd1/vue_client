<template>
  <v-col cols="12" style="height: 80vh; width: 100vw">
    <l-map
      v-if="showMap"
      ref="map"
      :zoom="zoom"
      :no-blocking-animations="true"
      :center="center"
      :options="mapOptions"
      style="height: 100%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      @mousemove="updateCoordinates"
      @draw:created="onPolygonDrawn"
    >
      <l-control-fullscreen
        position="topleft"
        :options="{ title: { false: 'Tam Ekran', true: 'Normal Görünüm' } }"
      />
      <v-icondefault></v-icondefault>
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"
      />
      <l-control :position="'topright'">
        <div class="coordinates" v-if="coordinates">{{ coordinates }}</div>
      </l-control>
      <l-control-layers position="topright"></l-control-layers>

      <v-marker-cluster
        v-if="markerReady"
        ref="clusterRef"
        :options="clusterOptions"
      >
        <l-geo-json
          :key="clusterKey"
          :options="geoJsonOptions"
          :geojson="markers"
        ></l-geo-json>
      </v-marker-cluster>
      <l-polyline
        v-for="(line, index) in polyline"
        :key="index"
        :lat-lngs="line.line"
        :color="line.color"
      />

      <l-geo-json
        ref="geojsonLayer"
        v-if="showGeojson"
        :geojson="geojson"
        :options="options"
      />

      <l-control-scale
        position="topright"
        :imperial="false"
        :metric="true"
      ></l-control-scale>
      <l-control :position="'bottomleft'">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header> Semboller </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div
                class="overflow-auto"
                style="
                  max-height: 300px !important; /* Adjust the height as needed */
                "
              >
                <v-card class="pa-2" align-left tile>
                  <v-card-text>
                    <v-row
                      align="center"
                      v-for="(legendElement, index) in legend"
                      :key="index"
                    >
                      <v-col class="pa-1" cols="3">
                        <v-img
                          :src="require(`@/assets` + legendElement.icon)"
                          height="30"
                          width="30"
                        ></v-img>
                      </v-col>
                      <v-col class="text-caption pa-0 mt-1" cols="9">
                        {{ legendElement.text }}
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </l-control>

      <l-control :position="'bottomright'">
        <datato-geo-json></datato-geo-json>
      </l-control>
    </l-map>
  </v-col>
</template>

<script>
import Vue2LeafletMarkerCluster from "vue2-leaflet-markercluster";
import TutorialDataService from "../services/TutorialDataService";
import {
  LMap,
  LGeoJson,
  LTileLayer,
  LPolyline,
  LControlScale,
  LIconDefault,
  LControl,
  LControlLayers,
} from "vue2-leaflet";
import { ProfilePlotter } from "../common/ProfilePlotter.js";
import api from "../services/api";
import { Icon, icon } from "leaflet";
import L from "leaflet";
import { bus } from "../main";
import LControlFullscreen from "vue2-leaflet-fullscreen";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

import citiesLatLongjson from "../../../app/cities_of_turkey.json";
// import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete Icon.Default.prototype._getIconUrl;
import DatatoGeoJson from "../components/DatatoGeoJson.vue";
import seismicIcon from "../assets/seismic.png";
import emIcon from "../assets/battery.png";
import magIcon from "../assets/magnetic-field.png";
import welllogIcon from "../assets/drilling-rig.png";
import gravIcon from "../assets/gravity.png";
import radioIcon from "../assets/radiation-detector.png";
import airBorneIcon from "../assets/airborne.png";
import satelliteIcon from "../assets/satellite.png";
import susceptibilityIcon from "../assets/susceptibility.png";
import heliIcon from "../assets/heli.png";
import drone_magnetic from "../assets/drone_magnetic.png";
import drone_ortophoto from "../assets/drone_ortophoto.png";
import drone_radiometric from "../assets/drone_radiometric.png";

/*
Feature types:
  - point
  - line
  - polygon
  - multiPoint
  - multiLine
  - multiPolygon
  - geometryCollection
  - feature
  - featureCollection

  https://leafletjs.com/reference-1.3.0.html#geojson-properties
  https://leafletjs.com/examples/geojson/
  https://leafletjs.com/examples/geojson/geojson-simple.html
  https://leafletjs.com/examples/geojson/geojson-custom-icons.html
  https://leafletjs.com/examples/geojson/geojson-custom-markers.html
  https://leafletjs.com/examples/geojson/geojson-custom-markers-and-popups.html
*/

function onEachFeature(feature, layer) {
  var v = this;
  var besyusucus = [
    12, 15, 19, 16, 13, 130, 131, 138, 166, 167, 168, 169, 170, 171, 172, 174,
    207, 208, 209, 210, 248, 249, 250, 251, 1, 3, 252, 291, 290, 4, 327, 326,
    325, 329, 330, 331, 356, 357, 39, 42, 45, 48, 43, 46, 49, 52, 149, 150, 151,
    152, 153, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 218, 219, 220,
    221, 222, 223, 224, 225, 226, 227, 257, 258, 259, 260, 262, 263, 264, 265,
    266, 267, 268, 269, 270, 271, 299, 300, 301, 302, 306, 307, 313, 334, 335,
    336, 337, 338,
  ];
  var noflight = [
    289, 7, 11, 14, 17, 20, 56, 10, 6, 21, 23, 25, 27, 29, 31, 33, 59, 61, 63,
    65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 90, 9, 24, 26, 88, 89, 91,
    127, 128, 164, 201, 242, 238, 240, 165, 203, 204, 244, 245, 280, 241, 243,
    279, 318, 354, 385, 386, 387, 388, 389, 390, 391, 413, 417, 418, 419, 420,
    421, 422, 426, 427, 428, 434,
  ];

  if (v.wordFlag === true) {
    if (besyusucus.includes(feature.properties.fid)) {
      layer.setStyle({
        weight: 2,
        color: "#ECEFF1",
        opacity: 1,
        fillColor: "red",
        fillOpacity: 0.4,
      });
    } else if (
      noflight.includes(feature.properties.fid) ||
      feature.properties.fid > 437
    ) {
      layer.setStyle({
        weight: 2,
        color: "#ECEFF1",
        opacity: 1,
        fillColor: "black",
        fillOpacity: 0.4,
      });
    } else {
      layer.setStyle({
        weight: 2,
        color: "#ECEFF1",
        opacity: 1,
        fillColor: "#068d8d",
        fillOpacity: 0.4,
      });
    }
  } else {
    layer.setStyle({
      weight: 2,
      color: "#ECEFF1",
      opacity: 1,
      fillColor: "#068d8d",
      fillOpacity: 0.4,
    });
  }

  if (feature.properties.mytag === "datdat") {
    layer.on({
      click: function () {
        bus.$emit("loading", true);

        v.$store.commit("searchParam/updateCity", null);
        v.$store.commit("searchParam/updateDistrict", null);
        v.$store.commit("searchParam/updateCoords", null);
        v.$store.commit("searchParam/updateWorkType", null);
        v.$store.commit("searchParam/updateWorkDate", null);
        v.$store.commit("searchParam/updateProjectCode", null);
        v.$store.commit("searchParam/updateLogNo", null);
        v.$store.commit("searchParam/updateGeoNo", null);
        v.$store.commit("searchParam/updateDerleme", null);
        v.$store.commit("searchParam/updateCd", null);

        let params = {};
        params["geojson"] = v.geojson.features[0].geometry.coordinates[0];
        params["yontem"] = v.$store.state.searchParam.yontem;
        params["userStatus"] = v.$store.state.auth.user.roles.includes(
          "ROLE_USER"
        )
          ? "user"
          : null;
        v.polyline = [];
        v.markers = [];
        v.markerReady = false;
        v.clusterKey++;
        TutorialDataService.findAllGeo(params)
          .then((response) => {
            v.markers = response.data.resPoints;
            v.polyline = response.data.resLines;
          })
          .then(() => {
            v.clusterKey++;
            v.markerReady = true;
          })
          .then(() => {
            bus.$emit("loading", false);
          })

          .catch((e) => {
            console.log(e);
          });
        bus.$emit("areaJson", v.geojson.features);
      },
    });
  } else if (feature.properties.mytag && feature.properties.mytag == "Cities") {
    layer._leaflet_id = feature.properties.name;
    layer.on("click", function (e) {
      document.querySelectorAll(".leaflet-interactive").forEach((el) => {
        el.classList.add("pseudoClass");
      });
      document
        .querySelectorAll(".selected")
        .forEach((el) => el.classList.remove("selected"));
      e.originalEvent.target.classList.add("selected");
      e.originalEvent.target.classList.remove("pseudoClass");
      // bus.$emit("searchParam", feature.properties.name);
      v.$store.commit("searchParam/updateCity", feature.properties.name);
      v.$store.commit("searchParam/updateDistrict", null);
      v.$store.commit("searchParam/updateCoords", feature.geometry.coordinates);
      v.$store.commit("searchParam/updateWorkType", null);
      v.$store.commit("searchParam/updateWorkDate", null);
      v.$store.commit("searchParam/updateProjectCode", null);
      v.$store.commit("searchParam/updateLogNo", null);
      v.$store.commit("searchParam/updateGeoNo", null);
      v.$store.commit("searchParam/updateDerleme", null);
      v.$store.commit("searchParam/updateCd", null);
      v.selectedCityparam = feature.properties.name;
      v.selectedDistrict = null;

      v.dataService(
        feature.properties.name,
        null,
        v.$store.state.searchParam.yontem
      );
      bus.$emit("searchParam");
      bus.$emit("geojsonSelectCity", feature.properties.name);
      bus.$emit("loading", true);
    });
  } else {
    layer.on({
      click: function (e) {
        if (!e.target.feature.properties.Name) {
          bus.$emit("loading", true);

          v.$store.commit("searchParam/updateCity", null);
          v.$store.commit("searchParam/updateDistrict", null);
          v.$store.commit("searchParam/updateCoords", null);
          v.$store.commit("searchParam/updateWorkType", null);
          v.$store.commit("searchParam/updateWorkDate", null);
          v.$store.commit("searchParam/updateProjectCode", null);
          v.$store.commit("searchParam/updateLogNo", null);
          v.$store.commit("searchParam/updateGeoNo", null);
          v.$store.commit("searchParam/updateDerleme", null);
          v.$store.commit("searchParam/updateCd", null);
          let params = {};
          if (v.selectedJsonparam === 1) {
            params["geojson"] = e.target.feature.properties.Id;
            bus.$emit("areaJson", e.target.feature.properties.Id);
          } else {
            params["geojson"] = e.target.feature.geometry.coordinates[0];
            bus.$emit("areaJson", e.target.feature);
          }
          params["yontem"] = v.$store.state.searchParam.yontem;
          params["userStatus"] = v.$store.state.auth.user.roles.includes(
            "ROLE_USER"
          )
            ? "user"
            : null;
          v.polyline = [];
          v.markers = [];
          v.markerReady = false;
          v.clusterKey++;
          TutorialDataService.findAllGeo(params)
            .then((response) => {
              v.markers = response.data.resPoints;
              v.polyline = response.data.resLines;
            })
            .then(() => {
              v.clusterKey++;
              v.markerReady = true;
            })
            .then(() => {
              bus.$emit("loading", false);
            })

            .catch((e) => {
              console.log(e);
            });
        }
      },
    });
  }
}
export default {
  name: "TurkeyMap",
  components: {
    LMap,
    LTileLayer,
    LPolyline,
    LGeoJson,
    LControlScale,
    LControl,
    DatatoGeoJson,
    LControlLayers,
    LControlFullscreen,
    "v-marker-cluster": Vue2LeafletMarkerCluster,
    "v-icondefault": LIconDefault,
  },
  data() {
    return {
      polyline: [],
      responseData: null,
      markers: null,
      colorScale: ["e7d090", "e9ae7b", "de7062"],
      citiesLatLongjson: citiesLatLongjson,
      zoom: 6,
      center: [39.9208, 32.8541],
      //url: "http://10.68.19.137:8081/styles/basic-preview/{z}/{x}/{y}@3x.png",
      // url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", // Tile layer URL

      // attribution:
      //   'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileProviders: [
        {
          name: "Topoğrafya",
          visible: true,
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
            'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
        {
          name: "Sokak",
          visible: false,
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        {
          name: "Uydu",
          visible: false,
          url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            'Map data: &copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        },
      ],
      currentZoom: 6,
      mapOptions: {
        zoomSnap: 0.5,
      },
      coordinates: "",
      geojson: null,
      showMap: true,
      showGeojson: false,
      searchParam: null,
      options: { onEachFeature: onEachFeature.bind(this) },
      markerReady: false,
      methodarr: null,
      wordFlag: false,
      selectedCityparam: null,
      selectedDistrict: null,
      selectedJsonparam: null,
      geojsonSelector: false,
      addedPolygonLayer: null,
      editFeatureGroup: null,
      calisma_amaci: null,
      calisma_tarihi: null,
      proje_kodu: null,
      kuyu_arsiv_no: null,
      jeofizik_arsiv_no: null,
      derleme_no: null,
      cd_no: null,
      clusterKey: 0,
      clusterOptions: {
        chunkedLoading: true,
        chunkInterval: 300,
        chunkDelay: 100,
      },
      legend: [
        {
          text: "Elektrik ve Elektromanyetik Yöntemler",
          icon: "/battery.png",
        },
        {
          text: "Gravite",
          icon: "/gravity.png",
        },
        {
          text: "Havadan Elektromanyetik",
          icon: "/heli.png",
        },
        {
          text: "Havadan Jeofizik",
          icon: "/airborne.png",
        },
        {
          text: "IHA (Manyetik)",
          icon: "/drone_magnetic.png",
        },
        {
          text: "IHA (Ortofoto)",
          icon: "/drone_ortophoto.png",
        },
        {
          text: "IHA (Radyometri)",
          icon: "/drone_radiometric.png",
        },
        {
          text: "Kuyu Ölçüleri",
          icon: "/drilling-rig.png",
        },
        {
          text: "Manyetik",
          icon: "/magnetic-field.png",
        },
        {
          text: "Radyometri",
          icon: "/radiation-detector.png",
        },
        {
          text: "Sismik Yöntemler",
          icon: "/seismic.png",
        },
        {
          text: "Suseptibilite",
          icon: "/susceptibility.png",
        },
        {
          text: "Uydu Görüntüsü",
          icon: "/satellite.png",
        },
        {
          text: "500 m Aralıklı Uçuşlar",
          icon: "/red.jpg",
        },
        {
          text: "1000 m Aralıklı Uçuşlar",
          icon: "/blue.jpg",
        },
        {
          text: "Uçuş Olmayan Alanlar",
          icon: "/black.jpg",
        },
      ],
      geoJsonOptions: {
        onEachFeature: (feature, layer) => {
          const div = document.createElement("div");

          const button = document.createElement("button");
          button.innerHTML = feature.properties.nokta_adi;
          button.onclick = () => {
            let routeData = this.$router.resolve({
              name: "calisma",
              params: {
                id: feature.properties.id,
              },
            });
            window.open(routeData.href, "_blank");
          };

          div.appendChild(button);
          layer.bindPopup(div);
          var customicon = null;

          if (feature.properties.yontem == "Sismik Yöntemler") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: seismicIcon,
              iconUrl: seismicIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                seismicIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (
            feature.properties.yontem == "Elektrik ve Elektromanyetik Yöntemler"
          ) {
            Icon.Default.mergeOptions({
              iconRetinaUrl: emIcon,
              iconUrl: emIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                emIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (feature.properties.alt_yontem == "Havadan Elektromanyetik") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: heliIcon,
              iconUrl: heliIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                heliIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (feature.properties.yontem == "Kuyu Ölçüleri") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: welllogIcon,
              iconUrl: welllogIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                welllogIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (feature.properties.alt_yontem == "Gravite") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: gravIcon,
              iconUrl: gravIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                gravIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (feature.properties.alt_yontem == "Manyetik") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: magIcon,
              iconUrl: magIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                magIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (feature.properties.alt_yontem == "Radyometri") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: radioIcon,
              iconUrl: radioIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                radioIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (feature.properties.alt_yontem == "Uydu Görüntüsü") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: satelliteIcon,
              iconUrl: satelliteIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                satelliteIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          if (
            feature.properties.alt_yontem.includes("Havadan") &&
            !feature.properties.alt_yontem.includes("Elektromanyetik")
          ) {
            Icon.Default.mergeOptions({
              iconRetinaUrl: airBorneIcon,
              iconUrl: airBorneIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                airBorneIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          //icon for susceptibility
          if (feature.properties.alt_yontem == "Suseptibilite") {
            Icon.Default.mergeOptions({
              iconRetinaUrl: susceptibilityIcon,
              iconUrl: susceptibilityIcon,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                susceptibilityIcon,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          //icon for drone magnetic
          if (
            feature.properties.alt_yontem == "IHA (Manyetik)" ||
            feature.properties.yontem == "IHA (Manyetik)"
          ) {
            Icon.Default.mergeOptions({
              iconRetinaUrl: drone_magnetic,
              iconUrl: drone_magnetic,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                drone_magnetic,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          //icon for drone ortophoto
          if (
            feature.properties.alt_yontem == "IHA (Ortofoto)" ||
            feature.properties.yontem == "IHA (Ortofoto)"
          ) {
            Icon.Default.mergeOptions({
              iconRetinaUrl: drone_ortophoto,
              iconUrl: drone_ortophoto,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                drone_ortophoto,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
          //icon for drone radiometric
          if (
            feature.properties.alt_yontem == "IHA (Radyometri)" ||
            feature.properties.yontem == "IHA (Radyometri)"
          ) {
            Icon.Default.mergeOptions({
              iconRetinaUrl: drone_radiometric,
              iconUrl: drone_radiometric,
              shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
              iconSize: [42, 42],
            });
            customicon = icon(
              Object.assign({}, Icon.Default.prototype.options, {
                drone_radiometric,
                shadowUrl,
              })
            );
            layer.setIcon(customicon);
          }
        },
      },
    };
  },
  methods: {
    removePolygonLayer() {
      if (this.addedPolygonLayer) {
        this.editFeatureGroup.removeLayer(this.addedPolygonLayer);
        this.addedPolygonLayer = null; // Reset the reference
      }
      this.polyline = [];
      this.markers = [];
      this.markerReady = false;
    },
    onPolygonDrawn(event) {
      this.showGeojson = false;
      this.geojson = null;
      this.geojsonSelector = false;
      const layer = event.layer;
      // Assuming "editableLayers" is your FeatureGroup where drawings are added
      this.addedPolygonLayer = layer;
      this.editFeatureGroup.addLayer(layer);
      layer.on("click", (e) => {
        const coordinates = e.target.getLatLngs(); // Get the polygon coordinates
        const outputCoordinates = coordinates[0].map((point) => [
          point.lng,
          point.lat,
        ]);
        // Handle the click event on the polygon here
        bus.$emit("loading", true);
        const newgeojson = {
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
                coordinates: [outputCoordinates],
              },
            },
          ],
        };
        this.geojson = newgeojson;
        this.geojsonSelector = true;

        bus.$emit("sendResults");

        bus.$emit("areaJson", newgeojson.features);
      });
    },
    updateCoordinates(event) {
      this.coordinates = `${event.latlng.lat.toFixed(
        4
      )}, ${event.latlng.lng.toFixed(4)}`;
    },
    /*
    get data from data service
    */
    dataService(
      city,
      district,
      selectedMethod,
      jeofizik_arsiv_no,
      calisma_amaci,
      calisma_tarihi,
      proje_kodu,
      kuyu_arsiv_no,
      derleme_no,
      cd_no,
      requestFlag
    ) {
      this.polyline = [];
      this.markers = [];
      this.markerReady = false;
      if (
        city ||
        district ||
        selectedMethod ||
        jeofizik_arsiv_no ||
        calisma_amaci ||
        calisma_tarihi ||
        proje_kodu ||
        kuyu_arsiv_no ||
        derleme_no ||
        cd_no
      ) {
        let params = {};
        this.polyline = [];
        this.markers = [];

        params["il"] = city;
        params["ilce"] = district ? district : null;
        params["yontem"] = selectedMethod ? selectedMethod : null;
        params["userStatus"] = this.$store.state.auth.user.roles.includes(
          "ROLE_USER"
        )
          ? "user"
          : null;
        params["calisma_amaci"] = calisma_amaci;
        params["calisma_tarihi"] = calisma_tarihi;
        params["proje_kodu"] = proje_kodu;
        params["kuyu_arsiv_no"] = kuyu_arsiv_no;
        params["jeofizik_arsiv_no"] = jeofizik_arsiv_no;
        params["derleme_no"] = derleme_no;
        params["cd_no"] = cd_no;
        params["requestFlag"] = requestFlag ? requestFlag : null;
        TutorialDataService.findAllgetAll(params)
          .then((response) => {
            this.markers = response.data.resPoints;
            this.polyline = response.data.resLines;
          })
          .then(() => {
            this.clusterKey++;
            this.markerReady = true;
          })

          .then(() => {
            bus.$emit("loading", false);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    /*
    map zoom and data update
    */
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    /*
    scale control
    */
    changeScale(val) {
      this.selectedJsonparam = val;
      this.scaleService(val);
    },
    /*
    trigger function from profileplotter.js
    plot profile and point
    */
    triggerExternalplot(currentTutorial) {
      var params = ProfilePlotter(currentTutorial);
      if (params.polyline !== null) {
        this.polyline.push(params.polyline);
      }
    },

    /*

    /*
    asnyc function to get data from data service
    */
    async scaleService(val) {
      this.removePolygonLayer();
      const response = await api.get(`/getGeoJson${val}`);

      const data = await response.data;

      // this.$refs.map.mapObject.invalidateSize();
      this.geojson = data;
      this.showGeojson = true;
      this.$refs.map.setCenter([39.9208, 32.8541]);
      this.$refs.map.setZoom(6);
      if (val === 0 && this.selectedCityparam != null) {
        this.$nextTick(() => {
          if (this.$refs.geojsonLayer && this.$refs.geojsonLayer.mapObject) {
            this.$refs.geojsonLayer.mapObject._layers[
              this.selectedCityparam
            ]._path.classList.add("selected");
          }
        });
      }
    },
    cleaner() {
      this.polyline = [];
      this.markers = [];
      this.methodarr = [];
      this.showGeojson = false;
      this.geojson = null;
      this.geojsonSelector = false;
      this.$store.commit("searchParam/updateCity", null);
      this.$store.commit("searchParam/updateDistrict", null);
      this.$store.commit("searchParam/updateCoords", null);
      this.$store.commit("searchParam/updateWorkType", null);
      this.$store.commit("searchParam/updateWorkDate", null);
      this.$store.commit("searchParam/updateProjectCode", null);
      this.$store.commit("searchParam/updateLogNo", null);
      this.$store.commit("searchParam/updateGeoNo", null);
      this.$store.commit("searchParam/updateDerleme", null);
      this.$store.commit("searchParam/updateCd", null);
    },
  },

  // computed: {
  //   styleFunction() {
  //     return () => {
  //       var style = null;
  //       // Iterate over the 'features' array
  //       for (const feature of this.geojson.features) {
  //         // Check if the 'fid' property matches the desired value
  //         console.log(feature.properties.fid);
  //         if (feature.properties.fid === 1) {
  //           style = {
  //             weight: 2,
  //             color: "red",
  //             opacity: 1,
  //             fillColor: "red",
  //             fillOpacity: 0.4,
  //           };
  //         } else {
  //           style = {
  //             weight: 2,
  //             color: "#ECEFF1",
  //             opacity: 1,
  //             fillColor: "#068d8d",
  //             fillOpacity: 0.4,
  //           };
  //         }
  //       }
  //       return style;
  //     };
  //   },
  // },

  mounted() {
    // Reference to the map instance
    const map = this.$refs.map.mapObject;
    // Create a FeatureGroup for editing
    this.editFeatureGroup = new L.FeatureGroup();
    map.addLayer(this.editFeatureGroup);
    // Initialize Leaflet Draw Toolbar
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false, // Disable intersecting polygons
          showArea: true, // Show area in the tooltip
        },
        polyline: false, // Disable drawing polylines
        circle: false, // Disable drawing circles
        marker: false, // Disable drawing markers
        circlemarker: false, // Disable drawing circle markers
      },
      edit: {
        featureGroup: this.editFeatureGroup, // Set the feature group for editing
        remove: true,
      },
    });

    map.addControl(drawControl);

    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject; // work as expected
    });
    bus.$on("renderMap", () => {
      setTimeout(() => {
        if (this.$refs.map) {
          //mapObject is a property that is part of leaflet
          this.$refs.map.mapObject.invalidateSize();
        }
      }, 200);
    });
    bus.$on("sendResults", () => {
      var city = this.$store.state.searchParam.il;
      var district = this.$store.state.searchParam.ilce;
      var method = this.$store.state.searchParam.yontem;
      this.calisma_amaci = this.$store.state.searchParam.calisma_amaci;
      this.calisma_tarihi = this.$store.state.searchParam.calisma_tarihi;
      this.proje_kodu = this.$store.state.searchParam.proje_kodu;
      this.kuyu_arsiv_no = this.$store.state.searchParam.kuyu_arsiv_no;
      this.jeofizik_arsiv_no = this.$store.state.searchParam.jeofizik_arsiv_no;
      this.derleme_no = this.$store.state.searchParam.derleme_no;
      this.cd_no = this.$store.state.searchParam.cd_no;
      this.markers = [];
      this.markerReady = false;
      if (method !== null) {
        const hasWord = method.some((element) =>
          element.includes("Rejyonel (2017 - 2022)")
        );
        if (hasWord) {
          this.wordFlag = true;
        } else {
          this.wordFlag = false;
        }
      }

      if (city !== null && district !== null) {
        this.geojsonSelector = false;
      }

      this.selectedCityparam = city;
      this.selectedDistrict = district;
      this.polyline = [];
      this.markers = [];
      this.markerReady = false;

      if (this.geojsonSelector === true) {
        let params = {};
        params["calisma_amaci"] = this.calisma_amaci;
        params["calisma_tarihi"] = this.calisma_tarihi;
        params["proje_kodu"] = this.proje_kodu;
        params["kuyu_arsiv_no"] = this.kuyu_arsiv_no;
        params["jeofizik_arsiv_no"] = this.jeofizik_arsiv_no;
        params["derleme_no"] = this.derleme_no;
        params["cd_no"] = this.cd_no;
        params["geojson"] = this.geojson.features[0].geometry.coordinates[0];
        params["yontem"] = method;
        //this.polyline = [];
        //this.markers = [];
        bus.$emit("areaJson", this.geojson.features);
        TutorialDataService.findAllGeo(params)
          .then((response) => {
            this.markers = response.data.resPoints;
            this.polyline = response.data.resLines;
          })
          .then(() => {
            this.clusterKey++;
            this.markerReady = true;
          })
          .then(() => {
            bus.$emit("loading", false);
          })
          .catch((e) => {
            console.log(e);
          });
      }
      if (this.geojsonSelector === false) {
        this.dataService(
          city,
          district,
          method,
          this.jeofizik_arsiv_no,
          this.calisma_amaci,
          this.calisma_tarihi,
          this.proje_kodu,
          this.kuyu_arsiv_no,
          this.derleme_no,
          this.cd_no,
          null
        );
        bus.$emit("searchParam");
      }

      if (method === null || method === undefined) {
        this.polyline = [];
        this.markers = [];
      }
    });

    bus.$on("fireScalechange", (val) => {
      this.changeScale(val);
    });

    bus.$on("hideGeojson", (data) => {
      this.showGeojson = data;
    });
    bus.$on("plotGeojson", (data, center, flag) => {
      if (flag === "geojsonFlag") {
        this.geojsonSelector = true;
      }
      // this.polyline = [];
      // this.markers = [];
      // this.methodarr = [];
      // this.markerReady = false;
      // this.clusterKey++;
      // bus.$emit("clearNavSelections");

      // this.selectedCityparam = null;
      // this.selectedDistrict = null;
      this.$refs.map.setCenter(center);
      this.$refs.map.setZoom(12);
      this.geojson = data;
      this.showGeojson = true;
    });
    bus.$on("clearMap", () => {
      this.cleaner();
      bus.$emit("clearNavSelections");
      this.removePolygonLayer();
    });
    bus.$on("clearAll", () => {
      bus.$emit("clearNavSelections");
      this.cleaner();

      this.removePolygonLayer();

      this.clusterKey++;
      this.$refs.map.setCenter([39.9208, 32.8541]);
      this.$refs.map.setZoom(6);
    });
    bus.$on("searchDatatoMap", (param) => {
      bus.$emit("clearMap");
      this.cleaner();
      this.selectedCityparam = null;
      this.selectedDistrict = null;
      this.removePolygonLayer();
      this.clusterKey++;
      this.dataService(
        param,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "userSearch"
      );
    });
  },
};
</script>
<style scoped>
.selected {
  fill-opacity: 0;
}
/* .hoverstyle {
  fill: #ca3d3d;
} */
.pseudoClass {
  fill: #068d8d;
}

.legend {
  padding: 5px;
  background: rgba(255, 255, 255, 0.8);
}
.coordinates {
  background-color: white;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}
.baz >>> .leaflet-marker-icon {
  width: 42px !important;
  height: 42px !important;
}
</style>
