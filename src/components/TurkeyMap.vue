<template>
  <v-col cols="12" style="height: 500px; width: 100%">
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
    >
      <v-icondefault></v-icondefault>
      <l-tile-layer :url="url" :attribution="attribution" />

      <v-marker-cluster ref="clusterRef">
        <v-marker
          v-for="marker in markers"
          :key="marker.id"
          :lat-lng="marker.latlng"
          :icon="marker.icon"
          :class="$style.baz"
        >
          <v-popup>
            <button @click="handlePopupClick(marker.id)">
              {{ marker.text }}
            </button>
          </v-popup>
        </v-marker>
      </v-marker-cluster>
      <l-polyline
        v-for="(line, index) in polyline"
        :key="index"
        :lat-lngs="line.latlngs"
        :color="line.color"
      />

      <l-geo-json
        v-if="showGeojson"
        :geojson="geojson"
        :options="options"
        :options-style="styleFunction"
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
  LMarker,
  LPolyline,
  LControlScale,
  LIconDefault,
  LPopup,
  LControl,
} from "vue2-leaflet";
import { ProfilePlotter } from "../common/ProfilePlotter.js";
import api from "../services/api";
import { Icon, icon } from "leaflet";
import { bus } from "../main";
// import * as L from "leaflet";

import citiesLatLongjson from "../data/cities_of_turkey.json";
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
  if (feature.properties.mytag === "datdat") {
    layer.on({
      click: function () {
        let params = {};
        params["geojson"] = v.geojson.features[0].geometry.coordinates[0];
        params["yontem"] = v.methodarr;
        params["userStatus"] = v.$store.state.auth.user.roles.includes(
          "ROLE_USER"
        )
          ? "user"
          : null;
        v.polyline = [];
        v.markers = [];
        TutorialDataService.findAllGeo(params)
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              //profileplotter.js ile nokta ve profilleri cizmek icin
              v.triggerExternalplot(response.data[i]);
            }
          })
          .catch((e) => {
            console.log(e);
          });
        bus.$emit(
          "areaJson",
          v.geojson.features[0].geometry.coordinates[0],
          v.methodarr
        );
      },
    });
  }

  if (feature.properties.mytag && feature.properties.mytag == "Cities") {
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
      v.selectedCityparam = feature.properties.name;
      v.selectedDistrict = null;

      v.dataService(feature.properties.name, null, v.methodarr);
      bus.$emit("searchParam", feature.properties.name, null, v.methodarr);
      bus.$emit("geojsonSelectCity", feature.properties.name);
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
    "v-marker-cluster": Vue2LeafletMarkerCluster,
    "v-marker": LMarker,
    "v-icondefault": LIconDefault,
    "v-popup": LPopup,
  },
  data() {
    return {
      polyline: [],
      responseData: null,
      markers: [],
      colorScale: ["e7d090", "e9ae7b", "de7062"],
      citiesLatLongjson: citiesLatLongjson,
      zoom: 6,
      center: [39.9208, 32.8541],
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      currentZoom: 6,
      mapOptions: {
        zoomSnap: 0.5,
      },
      geojson: null,
      showMap: true,
      showGeojson: false,
      searchParam: null,
      options: { onEachFeature: onEachFeature.bind(this) },

      methodarr: [],
      selectedCityparam: null,
      selectedDistrict: null,
      selectedJsonparam: null,
      geojsonSelector: false,
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
          text: "Havadan Jeofizik",
          icon: "/airborne.png",
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
      ],
    };
  },
  methods: {
    /*
    popup redirect to detail page
    */
    handlePopupClick(val) {
      let routeData = this.$router.resolve({
        name: "calisma",
        params: { id: val },
      });
      window.open(routeData.href, "_blank");
    },
    /*
    get data from data service
    */
    dataService(city, district, selectedMethod, requestFlag) {
      this.polyline = [];
      this.markers = [];
      if (city || district || selectedMethod) {
        let params = {};
        this.polyline = [];
        this.markers = [];

        params["il"] = city ? city : null;
        params["ilce"] = district ? district : null;
        params["yontem"] = selectedMethod ? selectedMethod : null;
        params["userStatus"] = this.$store.state.auth.user.roles.includes(
          "ROLE_USER"
        )
          ? "user"
          : null;
        params["requestFlag"] = requestFlag ? requestFlag : null;
        TutorialDataService.findAllgetAll(params)
          .then((response) => {
            this.responseData = response.data;

            for (let i = 0; i < this.responseData.length; i++) {
              //profileplotter.js ile nokta ve profilleri cizmek icin
              this.triggerExternalplot(this.responseData[i]);
            }
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
      var methodIcon = this.iconFunc(currentTutorial);

      this.markers.push({
        id: currentTutorial.id,
        latlng: [currentTutorial.lon, currentTutorial.lat],
        text: currentTutorial.nokta_adi,
        icon: methodIcon,
      });
    },
    iconFunc(currentTutorial) {
      var customicon = null;
      if (currentTutorial.yontem == "Sismik Yöntemler") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: seismicIcon,
          iconUrl: seismicIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            seismicIcon,
            shadowUrl,
          })
        );
      }
      if (currentTutorial.yontem == "Elektrik ve Elektromanyetik Yöntemler") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: emIcon,
          iconUrl: emIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            emIcon,
            shadowUrl,
          })
        );
      }
      if (currentTutorial.yontem == "Kuyu Ölçüleri") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: welllogIcon,
          iconUrl: welllogIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            welllogIcon,
            shadowUrl,
          })
        );
      }
      if (currentTutorial.alt_yontem == "Gravite") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: gravIcon,
          iconUrl: gravIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            gravIcon,
            shadowUrl,
          })
        );
      }
      if (currentTutorial.alt_yontem == "Manyetik") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: magIcon,
          iconUrl: magIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            magIcon,
            shadowUrl,
          })
        );
      }
      if (currentTutorial.alt_yontem == "Radyometri") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: radioIcon,
          iconUrl: radioIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            radioIcon,
            shadowUrl,
          })
        );
      }
      if (currentTutorial.alt_yontem == "Havadan Manyetik") {
        Icon.Default.mergeOptions({
          iconRetinaUrl: airBorneIcon,
          iconUrl: airBorneIcon,
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        });
        customicon = icon(
          Object.assign({}, Icon.Default.prototype.options, {
            airBorneIcon,
            shadowUrl,
          })
        );
      }
      return customicon;
    },
    /*

    /*
    asnyc function to get data from data service
    */
    async scaleService(val) {
      const response = await api.get(`/getGeoJson${val}`);

      const data = await response.data;

      // this.$refs.map.mapObject.invalidateSize();
      this.geojson = data;
      this.showGeojson = true;
      this.$refs.map.setCenter([39.9208, 32.8541]);
      this.$refs.map.setZoom(6);
      // if (val === 0 && this.selectedCityparam != null) {
      //   setTimeout(() => {
      //     this.map._layers[this.selectedCityparam]._path.classList.add(
      //       "selected"
      //     );
      //   }, 200);
      // }
    },
  },

  computed: {
    styleFunction() {
      return () => {
        return {
          weight: 2,
          color: "#ECEFF1",
          opacity: 1,
          fillColor: "#068d8d",
          fillOpacity: 0.4,
        };
      };
    },
  },
  mounted() {
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
    bus.$on("cityorDistrictChanged", (city, district) => {
      this.geojsonSelector = false;
      this.selectedCityparam = city;
      this.selectedDistrict = district;
      this.methodarr = [];
      this.polyline = [];
      this.markers = [];
      this.scaleService(0);
      setTimeout(() => {
        if (this.$refs.map) {
          this.map._layers[this.selectedCityparam]._path.classList.add(
            "selected"
          );
        }
      }, 200);
      this.dataService(city, district, this.methodarr, null);
      bus.$emit("searchParam", city, district, this.methodarr);
      console.log(this.map);
    });

    bus.$on("fireScalechange", (val) => {
      bus.$emit("clearMap");
      bus.$emit("clearAll");
      this.changeScale(val);
    });
    bus.$on("methodParam", (name, checked, city, district) => {
      if (checked === true) {
        if (!this.methodarr.includes(name)) {
          this.methodarr.push(name);
        }
      } else {
        this.methodarr = this.methodarr.filter((e) => e !== name);
      }
      if (this.geojsonSelector === true) {
        let params = {};
        params["geojson"] = this.geojson.features[0].geometry.coordinates[0];
        params["yontem"] = this.methodarr;
        this.polyline = [];
        this.markers = [];
        bus.$emit(
          "areaJson",
          this.geojson.features[0].geometry.coordinates[0],
          this.methodarr
        );
        TutorialDataService.findAllGeo(params)
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              //profileplotter.js ile nokta ve profilleri cizmek icin
              this.triggerExternalplot(response.data[i]);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
      if (this.geojsonSelector === false) {
        this.dataService(city, district, this.methodarr, null);
        bus.$emit("searchParam", city, district, this.methodarr);
      }

      if (this.methodarr.length == 0) {
        this.polyline = [];
        this.markers = [];
      }
    });
    bus.$on("hideGeojson", (data) => {
      this.showGeojson = data;
    });
    bus.$on("plotGeojson", (data, center, flag) => {
      if (flag === "geojsonFlag") {
        this.geojsonSelector = true;
      }
      this.polyline = [];
      this.markers = [];
      this.methodarr = [];
      this.selectedCityparam = null;
      this.selectedDistrict = null;
      this.$refs.map.setCenter(center);
      this.$refs.map.setZoom(12);
      this.geojson = data;
      this.showGeojson = true;
    });
    bus.$on("clearMap", () => {
      this.polyline = [];
      this.markers = [];
      this.methodarr = [];
      this.showGeojson = false;
      this.geojson = null;
      this.geojsonSelector = false;
      this.$refs.clusterRef.mapObject.refreshClusters();
    });
    bus.$on("clearAll", () => {
      this.polyline = [];
      this.markers = [];
      this.methodarr = [];
      this.showGeojson = false;
      this.geojson = null;
      this.geojsonSelector = false;
      this.$refs.map.setCenter([39.9208, 32.8541]);
      this.$refs.map.setZoom(6);
      this.$refs.clusterRef.mapObject.refreshClusters();
    });
    bus.$on("searchDatatoMap", (param) => {
      this.methodarr = [];
      this.polyline = [];
      this.markers = [];
      this.selectedCityparam = null;
      this.selectedDistrict = null;
      this.showGeojson = false;
      this.geojsonSelector = false;
      this.geojson = null;
      this.$refs.clusterRef.mapObject.refreshClusters();
      this.dataService(param, null, null, "userSearch");
    });
  },
};
</script>
<style>
.selected {
  fill-opacity: 0;
}
/* .hoverstyle {
  fill: #ca3d3d;
} */
.pseudoClass {
  fill: #068d8d;
}
.leaflet-marker-icon {
  width: 42px !important;
  height: 42px !important;
}
.legend {
  padding: 5px;
  background: rgba(255, 255, 255, 0.8);
}
</style>
<style module>
.baz >>> .leaflet-marker-icon {
  width: 42px !important;
  height: 42px !important;
}
</style>
