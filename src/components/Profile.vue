<template>
  <v-row v-if="currentUser">
    <v-col cols="12" md="3">
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
          <v-row v-if="toggleList">
            <v-col cols="12">
              <v-list>
                <v-list-item v-for="(user, index) in users" :key="index">
                  <v-list-item-title sm="8" v-text="user.username">
                  </v-list-item-title>
                  <v-select
                    style="width: 230px !important"
                    :items="['User', 'Moderator', 'Admin']"
                    label="Rol"
                    @change="selectRole"
                  ></v-select>
                </v-list-item>
              </v-list>

              <v-card-actions>
                <v-btn
                  @click="updateUserDB"
                  color="primary"
                  class="mx-auto"
                  style="width: 100px"
                >
                  Güncelle
                </v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text v-if="message !== ''"
          ><p>{{ message }}</p>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="9" v-if="currentUser.roles[0] === 'ROLE_ADMIN'">
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
import UserService from "../services/user.service";

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
      users: [],
      userRoles: [],
      message: "",
      toggleList: false,
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
        vm.$router.push({ name: "giris" });
      } else {
        if (vm.$store.state.auth.user.roles.includes("ROLE_ADMIN")) {
          vm.retrieveTutorials();
        }
      }
      //get all users before route enter
      UserService.getAllUsers()
        .then((response) => {
          vm.users = response.data;
          if (vm.users.length > 0) {
            vm.toggleList = true;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
  },
  methods: {
    selectRole(event) {
      var role = null;
      if (event === "User") {
        role = 1;
      } else if (event === "Moderator") {
        role = 2;
      } else if (event === "Admin") {
        role = 3;
      }
      this.userRoles.push(role);
    },
    //fırst update each user role in user array with corresponding select value then update user db
    updateUserDB() {
      if (this.userRoles.length !== this.users.length) {
        this.message = "Lütfen tüm kullanıcıların rolünü seçiniz.";
        return;
      } else {
        this.message = "";
        this.users.forEach((user, i) => {
          this.users[i].role = this.userRoles[i];
          UserService.updateUser(user)
            .then(() => {})
            .catch((e) => {
              console.log(e);
            });
        });
      }
      this.toggleList = false;
      this.message = "Kullanıci rolleri başarıyla güncellendi.";
    },

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
        name: "calisma",
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
