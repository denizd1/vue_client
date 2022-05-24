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
      <!-- <l-marker
            ref="marker"
            v-if="withTooltip != null"
            :lat-lng="withTooltip"
          /> -->
      <v-marker-cluster ref="clusterRef">
        <v-marker
          v-for="marker in markers"
          :key="marker.id"
          :lat-lng="marker.latlng"
          :icon="icon"
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
              <v-card
                v-for="(legendElement, index) in legend"
                :key="index"
                class="pa-2"
                align="left"
                tile
              >
                <img
                  :src="require(`@/assets` + legendElement.icon)"
                  height="20"
                  width="20"
                />
                <small class="pl-3">{{ legendElement.text }}</small>
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
        bus.$emit("areaJson", v.geojson.features[0].geometry.coordinates[0]);
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
      bus.$emit("searchParam", feature.properties.name);
      v.selectedCityparam = feature.properties.name;

      v.dataService(feature.properties.name, null, v.methodarr);
      bus.$emit("searchParam", feature.properties.name, "il");
    });
    // layer.on("mouseover", function (e) {
    //   document
    //     .querySelectorAll(".pseudoClass")
    //     .forEach((el) => el.classList.remove("pseudoClass"));
    //   e.originalEvent.target.classList.add("pseudoClass");
    // });
    // layer.on("mouseout", function (e) {
    //   document
    //     .querySelectorAll(".pseudoClass")
    //     .forEach((el) => el.classList.remove("pseudoClass"));
    //   e.originalEvent.target.classList.add("pseudoClass");
    // });
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
      icon: null,
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
          text: "Kuyu Ölçüleri",
          icon: "/drilling-rig.png",
        },
      ],
    };
  },
  methods: {
    handlePopupClick(val) {
      let routeData = this.$router.resolve({
        name: "tutorial",
        params: { id: val },
      });
      window.open(routeData.href, "_blank");
    },
    dataService(city, district, selectedMethod) {
      this.polyline = [];
      this.markers = [];
      if (city || district || selectedMethod.length != 0) {
        let params = {};
        this.polyline = [];
        this.markers = [];

        params["il"] = city;
        params["ilce"] = district;
        params["yontem"] = selectedMethod;
        params["userStatus"] = this.$store.state.auth.user.roles.includes(
          "ROLE_USER"
        )
          ? "user"
          : null;
        TutorialDataService.findAllgetAll(params)
          .then((response) => {
            this.responseData = response.data;

            for (let i = 0; i < this.responseData.length; i++) {
              //profileplotter.js ile nokta ve profilleri cizmek icin
              this.triggerExternalplot(this.responseData[i]);
            }

            // this.citiesLatLongjson.filter((elem) => {
            //   if (city === elem.il) {
            //     for (let i = 0; i < this.responseData.length; i++) {
            //       //profileplotter.js ile nokta ve profilleri cizmek icin
            //       this.triggerExternalplot(this.responseData[i]);
            //     }
            //   }
            // });
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    //farkli olceklerde parsel geojsonlari ve sehir geojsoni getirmek icin (checkbox change)
    changeScale(val) {
      // this.polyline = [];
      // this.markers = [];
      this.selectedJsonparam = val;
      this.scaleService(val);
    },
    triggerExternalplot(currentTutorial) {
      var params = ProfilePlotter(currentTutorial);
      if (params.polyline !== null) {
        this.polyline.push(params.polyline);
        this.markers.push({
          id: params.id,
          latlng: params.center,
          text: params.text,
        });
      }
      if (params.markerLatlong !== null) {
        this.markers.push({
          id: params.id,
          latlng: params.markerLatlong,
          text: params.text,
        });
        if (params.yontem == "Sismik Yöntemler") {
          Icon.Default.mergeOptions({
            iconRetinaUrl: seismicIcon,
            iconUrl: seismicIcon,
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          });
          this.generateIcon(seismicIcon, shadowUrl);
        }
        if (params.yontem == "Elektrik ve Elektromanyetik Yöntemler") {
          Icon.Default.mergeOptions({
            iconRetinaUrl: emIcon,
            iconUrl: emIcon,
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          });
          this.generateIcon(emIcon, shadowUrl);
        }
        if (params.yontem == "Kuyu Ölçüleri") {
          Icon.Default.mergeOptions({
            iconRetinaUrl: welllogIcon,
            iconUrl: welllogIcon,
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          });
          this.generateIcon(welllogIcon, shadowUrl);
        }
        if (params.altyontem == "Gravite") {
          Icon.Default.mergeOptions({
            iconRetinaUrl: gravIcon,
            iconUrl: gravIcon,
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          });
          this.generateIcon(gravIcon, shadowUrl);
        }
        if (params.altyontem == "Manyetik") {
          Icon.Default.mergeOptions({
            iconRetinaUrl: magIcon,
            iconUrl: magIcon,
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          });
          this.generateIcon(magIcon, shadowUrl);
        }
        if (params.altyontem == "Radyometri") {
          Icon.Default.mergeOptions({
            iconRetinaUrl: radioIcon,
            iconUrl: radioIcon,
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          });
          this.generateIcon(radioIcon, shadowUrl);
        }
      }
    },
    generateIcon(iconUrl, shadowUrl) {
      let customicon = icon(
        Object.assign({}, Icon.Default.prototype.options, {
          iconUrl,
          shadowUrl,
        })
      );

      this.icon = customicon;
    },
    //asenkron geojson servisi. (checkbox change)
    async scaleService(val) {
      const response = await api.get(`/getGeoJson${val}`);

      const data = await response.data;

      this.citiesGeojson = data;
      this.geojson = data;
      this.showGeojson = true;
      this.$refs.map.setCenter([39.9208, 32.8541]);
      this.$refs.map.setZoom(6);
      if (val === 0 && this.selectedCityparam != null) {
        setTimeout(() => {
          this.map._layers[this.selectedCityparam]._path.classList.add(
            "selected"
          );
        }, 100);
        // if (this.markers.length == 0 && this.polyline.length == 0) {
        //   this.dataService(
        //     this.selectedCityparam,
        //     this.selectedDistrict,
        //     this.methodarr
        //   );
        // }
      }
    },
  },
  watch: {
    methodarr: function () {
      if (
        this.geojson &&
        this.geojson.features[0].properties.mytag === "datdat"
      ) {
        let params = {};
        params["geojson"] = this.geojson.features[0].geometry.coordinates[0];
        params["yontem"] = this.methodarr;
        this.polyline = [];
        this.markers = [];
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
    },
    deep: true,
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
      }, 100);
    });
    bus.$on("cityChanged", (city) => {
      this.selectedCityparam = city;
      // this.geojson = null;
      this.methodarr = [];
      this.polyline = [];
      this.markers = [];
      if (this.$refs.map) {
        this.scaleService(0);
        setTimeout(() => {
          this.dataService(city, null, this.methodarr);
          bus.$emit("searchParam", city, "il");
        }, 100);
      }
    });
    bus.$on("districtChanged", (city, district) => {
      // this.geojson = null;
      this.polyline = [];
      this.markers = [];
      this.selectedDistrict = district;
      if (this.$refs.map) {
        this.scaleService(0);
        setTimeout(() => {
          this.map._layers[city]._path.classList.add("selected");
          this.dataService(city, district, this.methodarr);
          bus.$emit("searchParam", district, "ilce");
        }, 100);
      }
    });

    bus.$on("fireScalechange", (val) => {
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
      this.dataService(city, district, this.methodarr);
    });
    bus.$on("hideGeojson", (data) => {
      this.showGeojson = data;
    });
    bus.$on("plotGeojson", (data, center) => {
      this.$refs.map.setCenter(center);
      this.$refs.map.setZoom(12);
      this.geojson = data;
      this.showGeojson = true;
    });
    bus.$on("clearAll", () => {
      this.polyline = [];
      this.markers = [];
      this.showGeojson = false;
      this.geojson = null;
      this.$refs.clusterRef.mapObject.refreshClusters();
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
