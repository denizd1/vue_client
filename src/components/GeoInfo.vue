<template>
  <v-dialog
    v-model="fetchDone"
    @keydown.esc="fetchDone = false"
    max-width="470"
  >
    <v-card>
      <v-card-title
        >Birim Bilgisi
        <v-spacer></v-spacer>
        <v-btn icon @click="closeCard">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="unitname !== ''">
          <span class="subtitle-1"> Birim Adı:</span> {{ unitname }}
        </div>
        <div v-if="unitdescrip !== ''">
          <span class="subtitle-1"> Açıklama:</span> {{ unitdescrip }}
        </div>
        <div v-if="age !== ''">
          <span class="subtitle-1"> Yaş:</span> {{ age }}
        </div>
        <div v-if="elevation !== ''">
          <span class="subtitle-1"> Yükseklik:</span> {{ elevation }}
        </div>

        <div v-if="lith !== ''">
          <span class="subtitle-1"> Litoloji:</span> {{ lith }}
        </div>
        <v-divider class="mt-2 mb-2"></v-divider>
        <div v-for="region in regions" :key="region.boundary_id">
          <h3>{{ region.name }}</h3>
          <div v-if="region.boundary_group !== ''">
            <span class="subtitle-1">Grup:</span> {{ region.boundary_group }}
          </div>
          <div v-if="region.boundary_type !== ''">
            <span class="subtitle-1">Tip:</span> {{ region.boundary_type }}
          </div>
          <div v-if="region.boundary_class !== ''">
            <span class="subtitle-1">Sınıf:</span> {{ region.boundary_class }}
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="orange lighten-2" text> Kaynak </v-btn>

        <v-spacer></v-spacer>

        <v-btn icon @click="show = !show">
          <v-icon>{{ show ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-show="show">
          <v-divider></v-divider>

          <v-card-text>
            <!-- kaynak -->
            <div v-if="refauthor !== ''">
              <span class="subtitle-1"> Yazar:</span> {{ refauthor }}
            </div>
            <div v-if="reftitle !== ''">
              <span class="subtitle-1"> Başlık:</span> {{ reftitle }}
            </div>
            <div v-if="refyear !== ''">
              <span class="subtitle-1"> Yıl:</span> {{ refyear }}
            </div>
            <div v-if="refurl !== ''">
              <span class="subtitle-1"> Url:</span> {{ refurl }}
            </div>
            <div v-if="refsource !== ''">
              <span class="subtitle-1"> Kaynak:</span> {{ refsource }}
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "GeoInfo",
  props: ["geoInfoCoords"],

  data() {
    return {
      unitname: "",
      unitdescrip: "",
      age: "",
      elevation: "",
      descrip: "",
      lith: "",
      refauthor: "",
      reftitle: "",
      refyear: "",
      refurl: "",
      refsource: "",
      regions: [],
      fetchDone: false,
      show: false,
    };
  },
  methods: {
    closeCard() {
      // Reset data and hide the v-card
      this.fetchDone = false;
      this.unitname = "";
      this.unitdescrip = "";
      this.age = "";
      this.elevation = "";
      this.lith = "";
      this.refauthor = "";
      this.reftitle = "";
      this.refyear = "";
      this.refurl = "";
      this.refsource = "";
      this.regions = [];
    },
  },
  watch: {
    geoInfoCoords: function (newVal) {
      const url = `https://macrostrat.org/api/v2/mobile/map_query_v2?lat=${newVal.lat}&lng=${newVal.lng}&z=${newVal.zoom}`;

      // const url = `https://macrostrat.org/api/geologic_units/map/?lat=${clickedCoordinates.lat}&lng=${clickedCoordinates.lng}&response=long`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          // Log the data to the console
          const mapData = data.success.data.mapData[0];

          this.unitname = mapData.name;
          this.unitdescrip = mapData.descrip;
          this.age = mapData.age;
          this.elevation = data.success.data.elevation;
          this.lith = mapData.lith;
          this.refauthor = mapData.ref.authors;
          this.reftitle = mapData.ref.ref_title;
          this.refyear = mapData.ref.ref_year;
          this.refurl = mapData.ref.url;
          this.refsource = mapData.ref.ref_source;
          this.regions = data.success.data.regions;

          // Set fetchDone to true to render the v-card
          this.fetchDone = true;
        });
    },
  },
};
</script>
