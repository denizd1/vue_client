<template>
  <div>
    <v-overlay style="z-index: 6" v-show="loading">
      <v-layout align-center justify-center column fill-height>
        <v-flex row align-center>
          <v-progress-circular
            :size="100"
            :width="7"
            color="red"
            indeterminate
          ></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-overlay>
    <v-col
      sm="8"
      md="6"
      lg="4"
      align-center
      justify-center
      class="mx-auto text-center"
      v-if="!submitted"
    >
      <v-tabs
        align-center
        justify-center
        centered
        v-model="tab"
        background-color="transparent"
      >
        <v-tab href="#excel-import">Excel Import</v-tab>
      </v-tabs>
      <v-tabs-items
        style="background-color: transparent !important"
        v-model="tab"
      >
        <v-tab-item :key="1" value="excel-import">
          <v-file-input
            class="mt-3"
            counter
            clearable="true"
            label="Dosya Seçimi"
            placeholder="Yüklemek için xls ya da xlsx uzantılı bir Excel dosyası
            seçin."
            prepend-icon="mdi-paperclip"
            outlined
            :show-size="1000"
            @change="selectFile"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
          </v-file-input>
          <v-overlay style="z-index: 6" v-show="show">
            <v-layout align-center justify-center column fill-height>
              <v-flex row align-center justify-center>
                <v-card color="#ffffff">
                  <v-card-text class="justify-center" style="color: #00000099">
                    Lütfen dosya seçiniz!
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="secondary" text @click="show = false">
                      Kapat
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-flex>
            </v-layout>
          </v-overlay>
          <v-btn color="primary" @click="upload">Excel Import</v-btn>
        </v-tab-item>
      </v-tabs-items>
    </v-col>
    <v-col sm="8" md="6" lg="4" align-center class="mx-auto" v-else>
      <v-card class="text-center justify-center" v-if="allAdded">
        <v-card-title class="justify-center">
          Nokta(lar) Başarıyla Eklendi!
        </v-card-title>

        <v-card-subtitle>
          Yeni bir dosya yüklemek için 'Ekle' butonuna basın.
        </v-card-subtitle>

        <v-card-actions class="justify-center">
          <v-btn color="success" @click="newTutorial">Ekle</v-btn>
        </v-card-actions>
      </v-card>
      <v-card class="text-center justify-center" v-else>
        <v-card-title class="justify-center">
          Beklenmedik bir hata oluştu, lütfen yöneticinizle görüşün.
        </v-card-title>

        <v-card-subtitle>
          Yeni bir dosya yüklemek için 'Ekle' butonuna basın.
        </v-card-subtitle>

        <v-card-actions class="justify-center">
          <v-btn color="success" @click="newTutorial">Ekle</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </div>
</template>

<script>
import UploadService from "../services/UploadFilesService";

import { bus } from "../main";

// import { Base64 } from "js-base64";
export default {
  name: "add-tutorial",
  data() {
    return {
      currentFile: undefined,
      submitted: false,
      show: false,
      allAdded: false,
      loading: false,
    };
  },
  /*Check role before route enter */
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      var val = vm.$store.state.auth.user;
      if (!val) {
        vm.$router.push({ name: "giris" });
      } else if (val) {
        if (val.roles[0] == "ROLE_USER") {
          vm.$router.push({ name: "calismalar" });
        }
        if (val.roles[0] == "ROLE_ADMIN") {
          return;
        }
        if (val.roles[0] == "ROLE_MODERATOR") {
          return;
        }
      }
    });
  },
  computed: {
    tab: {
      set(tab) {
        this.$router.replace({ query: { ...this.$route.query, tab } });
      },
      get() {
        return this.$route.query.tab;
      },
    },
  },
  mounted() {
    bus.$on("alldone", () => {
      this.loading = false;
      this.submitted = true;
      this.allAdded = true;
    });
  },
  /*methods*/
  methods: {
    selectFile(file) {
      this.currentFile = file;
    },
    upload() {
      if (!this.currentFile) {
        this.show = true;
        return;
      }
      this.loading = true;

      UploadService.upload(this.currentFile, () => {})

        .then(() => {
          this.submitted = true;
          this.allAdded = true;
          this.loading = false;
        })
        .catch(() => {
          this.submitted = true;
          this.loading = false;
          this.currentFile = undefined;
        });
    },

    /**
     * To go back to import field in order to import new files
     */
    newTutorial() {
      bus.$emit("resetCount");
      this.filestoImport = [];
      this.submitted = false;
      this.showSubmit = false;
      this.dialog = false;
      this.loading = false;
      this.errorMessage = [];
      this.errorDialog = false;
    },
  },
};
</script>
