<template>
  <div style="height: 500px; width: 100%">
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="width: 100%, height: 100%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer :url="url" :attribution="attribution" />

      <l-marker v-if="markerLatlong" :lat-lng="markerLatlong" />
      <l-polyline
        v-if="polyline"
        :lat-lngs="polyline.latlngs"
        :color="polyline.color"
      />
      <l-geo-json
        v-if="showGeojson"
        :geojson="geojson"
        :options-style="styleFunction"
      />

      <l-control-scale
        position="topright"
        :imperial="false"
        :metric="true"
      ></l-control-scale>
    </l-map>
  </div>
</template>

<script>
import {
  LGeoJson,
  LMap,
  LTileLayer,
  LMarker,
  LPolyline,
  LControlScale,
} from "vue2-leaflet";
import { Icon } from "leaflet";
import { ProfilePlotter } from "../common/ProfilePlotter.js";
import citiesLatLongjson from "../../../app/cities_of_turkey.json";

// import * as L from "leaflet";
delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
  name: "MapView",
  props: ["currentTutorial"],
  components: {
    LGeoJson,
    LMap,
    LTileLayer,
    LMarker,
    LPolyline,
    LControlScale,
  },
  data() {
    return {
      markerLatlong: null,
      polyline: null,
      zoom: 11.5,
      loading: false,
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      currentZoom: 11.5,
      citiesLatLongjson: citiesLatLongjson,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      geojson: null,
      showGeojson: false,
    };
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    triggerExternalplot(currentTutorial) {
      var params = ProfilePlotter(currentTutorial);
      this.center = [currentTutorial.lon, currentTutorial.lat];
      this.currentCenter = [currentTutorial.lon, currentTutorial.lat];
      this.markerLatlong = [currentTutorial.lon, currentTutorial.lat];

      this.polyline = params.polyline;
      if (params.geoJson != null) {
        this.geojson = params.geoJson;
        this.showGeojson = true;
      }
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
  beforeMount() {
    {
      this.triggerExternalplot(this.currentTutorial);
    }
  },
};
</script>
<style>
@import "~leaflet/dist/leaflet.css";
</style>
