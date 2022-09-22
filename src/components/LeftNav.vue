<template>
  <v-card>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      bottom
      temporary
      app
      style="z-index: 200 !important"
    >
      <v-divider class="mt-0"></v-divider>
      <v-list v-if="!currentUser">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list dense v-if="currentUser" class="pt-0">
        <v-list-item link :to="{ name: 'profil' }">
          <v-list-item-content>
            <v-row>
              <v-col sm="1" lg="2"
                ><v-avatar color="primary" size="36"
                  ><span class="white--text">{{
                    currentUser.username.split(".")[0].charAt(0) +
                    (currentUser.username.split(".")[1]
                      ? currentUser.username.split(".")[1].charAt(0)
                      : "")
                  }}</span></v-avatar
                ></v-col
              >
              <v-col cols="10" class="mt-1"
                ><v-list-item-title class="text-h6">
                  {{ currentUser.username }}
                </v-list-item-title>
                <v-list-item-subtitle>{{
                  currentUser.email
                }}</v-list-item-subtitle></v-col
              >
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="currentUser" link :to="{ name: 'calismalar' }">
          <v-list-item-icon>
            <v-icon>mdi-folder-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Çalışmalar</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="isUseradmin || isUsermoderator"
          link
          :to="{ name: 'ekle' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-archive-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Yeni Çalışma Ekle</v-list-item-title>
        </v-list-item>
        <v-list-item link @click.prevent="logOut">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Çıkış</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-group
          prepend-icon="mdi-math-compass"
          :value="false"
          no-action
          v-if="showNavelement"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Ölçek</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item
              v-for="(scaleControl, index) in scaleControls"
              :key="index"
            >
              <v-list-item-title v-text="scaleControl.label">
              </v-list-item-title>
              <v-checkbox
                style="z-index: 89"
                v-model="scaleControl.checked"
                :color="scaleControl.color"
                :input-value="scaleControl.factor"
                :disabled="scaleControl.visibility"
                @change="
                  triggerChange(
                    $event,
                    scaleControl.checked,
                    scaleControl.factor
                  )
                "
              >
              </v-checkbox>
            </v-list-item>
          </v-list>
        </v-list-group>

        <v-list-group
          prepend-icon="mdi-sine-wave"
          :value="false"
          no-action
          v-if="showNavmethod"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Yöntem</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item
              v-for="(geoMethods, index) in methodSelect"
              :key="index"
            >
              <v-list-item-title v-text="geoMethods.name"> </v-list-item-title>

              <v-checkbox
                style="z-index: 89"
                @change="
                  handleMethodChange(geoMethods.name, geoMethods.checked)
                "
                v-model="geoMethods.checked"
              >
              </v-checkbox>
            </v-list-item>
          </v-list>
        </v-list-group>

        <v-list-group
          prepend-icon="mdi-city-variant-outline"
          :value="false"
          no-action
          v-if="showNavcity"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>İl / İlçe</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list>
            <v-list-item>
              <v-select
                style="display: block"
                item-text="il"
                :items="cities"
                single-line
                placeholder="İl Seçiniz"
                @change="handleCityChange"
              ></v-select>
            </v-list-item>
            <v-list-item>
              <v-select
                style="display: block"
                v-if="fillDistrict.length"
                item-text="ilceleri"
                :items="fillDistrict"
                single-line
                placeholder="İlçe seçiniz"
                @change="handleDistrictChange"
              ></v-select>
            </v-list-item>
          </v-list>
        </v-list-group>
        <v-list-item>
          <v-btn color="success" class="mr-4" @click="clearNav">
            Seçimleri Temizle
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar style="z-index: 6" flat app>
      <v-img
        class="mta-logo mx-auto"
        src="../assets/logo.png"
        alt="MTA logo"
      ></v-img>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
  </v-card>
</template>
<script>
import EventBus from "../common/EventBus";
import { bus } from "../main";
import citiesJson from "../data/cities_of_turkey.json";

export default {
  name: "LeftNav",
  data() {
    return {
      cities: citiesJson,
      fillSubMethod: [],
      fillDistrict: [],
      mini: true,
      drawer: false,
      showNavelement: null,
      showNavmethod: null,
      showNavcity: null,
      citytoEmit: null,
      districtToEmit: null,
      menuItems: [
        {
          title: "Kaydol",
          path: "/kaydol",
          icon: "mdi-account-plus-outline",
        },
        { title: "Giriş Yap", path: "/giris", icon: "mdi-login" },
      ],
      //Farkli geojsonlar icin gereken parametreler
      scaleControls: [
        {
          id: 1,
          name: "yirmibesBin",
          factor: 25,
          label: "1/25.000",
          checked: false,
          visibility: false,
        },

        {
          id: 2,
          name: "yuzBin",
          factor: 100,
          label: "1/100.000",
          checked: false,
          visibility: false,
        },
        {
          id: 3,
          name: "besyuzBin",
          factor: 500,
          label: "1/500.000",
          checked: false,
          visibility: false,
        },
        {
          id: 4,
          name: "iller",
          factor: 0,
          label: "İl Sınırları",
          checked: false,
          visibility: false,
        },
      ],
      methodSelect: [
        { name: "Elektrik ve Elektromanyetik Yöntemler", checked: false },
        { name: "Potansiyel Alan Yöntemleri", checked: false },
        { name: "Sismik Yöntemler", checked: false },
        { name: "Kuyu Ölçüleri", checked: false },
      ],
    };
  },
  methods: {
    handleCityChange(event) {
      for (let i = 0; i < this.methodSelect.length; i++) {
        this.methodSelect[i].checked = false;
      }
      bus.$emit("cityorDistrictChanged", event, null);
      this.citytoEmit = event;

      for (let i = 0; i < this.scaleControls.length; i++) {
        if (
          this.scaleControls[i].name === "iller" &&
          this.scaleControls[i].checked != true
        ) {
          this.scaleControls[i].checked = true;
        } else {
          this.scaleControls[i].checked = false;
        }
      }

      for (let i = 0; i < this.cities.length; i++) {
        if (this.cities[i].il === event) {
          this.fillDistrict = this.cities[i].ilceleri;
        }
      }
      // var self = this;
      // self.district_id = event;
    },
    handleDistrictChange(event) {
      this.districtToEmit = event;
      bus.$emit("cityorDistrictChanged", this.citytoEmit, event);

      for (let i = 0; i < this.scaleControls.length; i++) {
        if (
          this.scaleControls[i].name === "iller" &&
          this.scaleControls[i].checked != true
        ) {
          this.scaleControls[i].checked = true;
        } else {
          this.scaleControls[i].checked = false;
        }
      }
    },
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/giris");
    },
    triggerChange(ev, checked, val) {
      if (checked === true) {
        for (let i = 0; i < this.scaleControls.length; i++) {
          if (val !== this.scaleControls[i].factor) {
            this.scaleControls[i].checked = false;
          }
        }
        bus.$emit("fireScalechange", val);
      } else {
        bus.$emit("hideGeojson", false);
      }
    },
    handleMethodChange(name, checked) {
      bus.$emit(
        "methodParam",
        name,
        checked,
        this.citytoEmit,
        this.districtToEmit
      );
    },
    clearNav() {
      this.citytoEmit = null;
      this.districtToEmit = null;
      this.fillDistrict = [];
      for (let i = 0; i < this.methodSelect.length; i++) {
        this.methodSelect[i].checked = false;
      }
      for (let i = 0; i < this.scaleControls.length; i++) {
        this.scaleControls[i].checked = false;
      }
      bus.$emit("clearAll", "fullClean");
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    isUseradmin() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_ADMIN");
      }
      return false;
    },
    isUsermoderator() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles.includes("ROLE_MODERATOR");
      }
      return false;
    },
  },
  mounted() {
    EventBus.on("logout", () => {
      this.logOut();
    });

    bus.$on("geojsonSelectCity", (geojsonCity) => {
      this.citytoEmit = geojsonCity;
    });

    // bus.$on("clearNav", () => {
    //   this.methodSelect.filter((item) => {
    //     item.checked = false;
    //   });
    //   this.scaleControls.filter((item) => {
    //     item.checked = false;
    //   });
    // });
  },
  beforeDestroy() {
    EventBus.remove("logout");
  },
  watch: {
    $route: function () {
      // Check if given route is true, if it is then hide Nav.
      if (this.$route.query.tab === "harita-gorunumu") {
        this.showNavelement = true;
        this.showNavmethod = true;
        this.showNavcity = true;
      } else {
        this.showNavelement = false;
        this.showNavmethod = false;
        this.showNavcity = false;
      }
      // if (!/tutorials-list/.test(window.location.href)) {
      //   this.showNavmethod = false;
      //   this.showNavcity = false;
      // } else {
      //   this.showNavmethod = true;
      //   this.showNavcity = true;
      // }
    },
  },
};
</script>
<style scoped>
.mta-logo {
  width: 50px;
  height: 50px;
  position: absolute;
  left: 48%;
}
</style>
