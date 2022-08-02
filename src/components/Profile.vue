<template>
  <v-row style="position: relative; z-index: 99">
    <v-col cols="12" sm="3" v-if="currentUser">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <p class="black--text text-body-1">
                Kullanıcı Adı : {{ currentUser.username }}
              </p>
              <p class="black--text text-body-1">
                Email : {{ currentUser.email }}
              </p>
              <p class="black--text text-body-1 mb-0">
                Rol :
                {{
                  currentUser.roles[0] === "ROLE_ADMIN"
                    ? "Admin"
                    : currentUser.roles[0] === "ROLE_MODERATOR"
                    ? "Moderator"
                    : "Kullanıcı"
                }}
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="9" v-if="currentUser.roles[0] === 'ROLE_ADMIN'">
      <v-row class="px-3">
        <v-col cols="12" sm="12">
          <v-row>
            <v-col cols="4" sm="3">
              <v-select
                v-model="pageSize"
                :items="pageSizes"
                label="Öğe Sayısı"
                @change="handlePageSizeChange"
              ></v-select>
            </v-col>

            <v-col cols="8" sm="9">
              <v-pagination
                v-model="page"
                :length="totalPages"
                total-visible="7"
                next-icon="mdi-menu-right"
                prev-icon="mdi-menu-left"
                @input="handlePageChange"
              ></v-pagination>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="py-0" cols="12" sm="12">
          <p style="margin-bottom: 0px">
            Toplam {{ tutorialCount }} öğe bulundu.
          </p>
        </v-col>

        <v-col cols="12" sm="12">
          <v-card class="mx-auto" tile>
            <v-data-table
              v-model="selected"
              :headers="headers"
              :items="tutorials"
              disable-pagination
              :hide-default-footer="true"
              @click:row="handleClick"
              class="row-pointer mb-2 elevation-1"
              :key="componentKey"
              show-select
            >
            </v-data-table>
          </v-card>
          <!--update button-->
          <v-btn
            @click="updatePublished"
            color="primary"
            class="mx-auto"
            style="width: 100px"
          >
            Yayınla
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";

export default {
  name: "Profile",
  data() {
    return {
      tutorials: [],
      selected: [],
      page: 1,
      totalPages: 0,
      tutorialCount: 0,
      pageSize: 5,
      pageSizes: [5, 10, 15],
      componentKey: 0,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    headers() {
      const headers = [
        {
          text: "Nokta/Kuyu/Profil Adı",
          value: "nokta_adi",
          align: "start",
          sortable: false,
        },
        { text: "Yöntem", value: "yontem", sortable: false },
        { text: "Alt Yöntem", value: "alt_yontem", sortable: false },
        { text: "İl", value: "il", sortable: false },
        { text: "İlçe", value: "ilce", sortable: false, align: "end" },
      ];

      return headers;
    },
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!vm.$store.state.auth.user) {
        vm.$router.push({ name: "login" });
      } else {
        if (vm.$store.state.auth.user.roles.includes("ROLE_ADMIN")) {
          vm.retrieveTutorials();
        }
      }
    });
  },
  methods: {
    retrieveTutorials() {
      var params = null;

      params = {
        page: this.page - 1,
        size: this.pageSize,
      };

      TutorialDataService.getAllunPublished(params)
        .then((response) => {
          const { tutorials, totalPages, totalItems } = response.data;
          this.tutorials = tutorials.map(this.getDisplayTutorial);
          this.totalPages = totalPages;
          this.tutorialCount = totalItems;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    handleClick(value) {
      let routeData = this.$router.resolve({
        name: "tutorial",
        params: { id: value.id },
      });
      window.open(routeData.href, "_blank");
      // this.$router.push({ name: "tutorial", params: { id: value.id } });
    },
    handlePageChange(value) {
      this.page = value;
      this.retrieveTutorials();
    },

    handlePageSizeChange(size) {
      this.pageSize = size;
      this.page = 1;
      this.retrieveTutorials();
    },
    getDisplayTutorial(tutorial) {
      return {
        id: tutorial.id,
        nokta_adi: tutorial.nokta_adi, //.substr(0, 20), //+ "...",
        yontem: tutorial.yontem, //.substr(0, 20) + "...",
        alt_yontem: tutorial.alt_yontem, //.substr(0, 10), //+ "...",
        il: tutorial.il, //.substr(0, 10), //+ "...",
        ilce: tutorial.ilce, //.substr(0, 10), //+ "...",
      };
    },
    updatePublished() {
      var data = {
        published: true,
      };

      for (let i = 0; i < this.selected.length; i++) {
        TutorialDataService.update(this.selected[i].id, data)
          .then(() => {
            console.log("updated");
          })
          .catch((e) => {
            console.log(e);
          });
      }
      this.retrieveTutorials();
      this.selected = [];
    },
  },
};
</script>
