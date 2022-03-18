<template>
  <v-col cols="12" md="8">
    <v-col cols="4" class="float-left pl-0">
      <v-select
        v-model="city_id"
        item-value="plaka"
        item-text="il"
        :items="cities"
        single-line
        @change="handleChange"
      ></v-select>
    </v-col>
    <v-col cols="4" class="float-left pl-0">
      <v-select
        v-if="fillDistrict"
        v-model="district_id"
        item-value="plaka"
        item-text="ilceleri"
        :items="fillDistrict"
        single-line
      ></v-select>
    </v-col>
  </v-col>
</template>
<script>
import citiesJson from "../data/cities_of_turkey.json";
export default {
  data() {
    return {
      cities: citiesJson,
      city_id: 1,
      district_id: 1,
      fillDistrict: [],
    };
  },
  methods: {
    handleChange(event) {
      this.cities.filter((elem) => {
        if (elem.plaka === event) {
          this.fillDistrict = elem.ilceleri;
        }
      });
      var self = this;
      self.district_id = event;
    },
  },
  beforeMount: function () {
    var self = this;
    self.handleChange(self.city_id);
  },
  name: "SearchDetail",
};
</script>
