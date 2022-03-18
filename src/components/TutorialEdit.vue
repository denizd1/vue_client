<template>
  <v-col v-if="currentTutorial" class="edit-form mx-auto py-3" cols="4">
    <p class="headline">Çalışmayı Düzenle</p>

    <v-form ref="form" lazy-validation>
      <template v-for="(val, key, index) in currentTutorial">
        <v-text-field
          class="pb-2"
          v-if="
            val !== null &&
            key !== 'id' &&
            key !== 'published' &&
            key !== 'createdAt' &&
            key !== 'updatedAt'
          "
          v-model="currentTutorial[key]"
          :key="index"
          :label="headers[index]"
          :rules="[(v) => !!v || 'Bu alan boş bırakılamaz.']"
          required
        ></v-text-field>
      </template>

      <label><strong>Durum:</strong></label>
      {{ currentTutorial.published ? "Yayında" : "Beklemede" }}

      <v-divider class="my-5"></v-divider>

      <v-btn
        v-if="currentTutorial.published"
        @click="updatePublished(false)"
        color="primary"
        small
        class="mr-2"
      >
        Yayından Kaldır
      </v-btn>

      <v-btn
        v-else
        @click="updatePublished(true)"
        color="primary"
        small
        class="mr-2"
      >
        Yayınla
      </v-btn>

      <v-btn color="error" small class="mr-2" @click="deleteTutorial">
        Sil
      </v-btn>

      <v-btn color="success" small @click="updateTutorial"> Güncelle </v-btn>
    </v-form>

    <p class="mt-3">{{ message }}</p>
  </v-col>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
// import _ from "lodash";
export default {
  name: "tutorial",
  data() {
    return {
      currentTutorial: null,
      message: "",
      headers: [
        "id",
        "Nokta/Kuyu/Profil Adı",
        "Yöntem",
        "Alt Yöntem",
        "Çalışma Amacı",
        "Satılabilirlik",
        "Ham Veri",
        "Çalışma Tarihi",
        "Proje Kodu",
        "Kuyu Arşiv No",
        "Jeofizik Arşiv No",
        "Derleme No",
        "CD No",
        "İl",
        "İlçe",
        "x",
        "y",
        "z",
        "Profil Başlangıç (x)",
        "Profil Başlangıç (y)",
        "Profil Bitiş (x)",
        "Profil Bitiş (y)",
        "Zone",
        "Datum",
        "1/500000",
        "1/100000",
        "1/25000",
        "Ölçülen Parametre(ler)",
        "Açılım Yönü",
        "Açılım Yöntemi",
        "Frekans Aralığı",
        "MT Ölçü Süresi (saat)",
        "Z Bileşeni",
        "AMT Ölçüsü",
        "AMT Ölçü Süresi",
        "TEM Ölçüsü",
        "Kalibrasyon Dosyası",
        "Veri Formatı",
        "Derinlik (m) - AB/2 (m)",
        "Derinlik (m) GR",
        "Derinlik (m) NEU",
        "Derinlik (m) DEN",
        "Derinlik (m) RES",
        "Derinlik (m) SP",
        "Derinlik (m) CAL",
        "Derinlik (m) TERM",
        "Derinlik (m) SGR",
        "Derinlik (m) CBL",
        "Derinlik (m) SON",
        "Derinlik (m) CCL",
        "Hat Boyu (m)",
        "Kayıt Boyu (sn)",
        "Sweep Süresi (sn)",
        "Sweep Tipi",
        "Sweep Sayısı",
        "Sweep Frekansları (hz)",
        "Sweep Taper (ms)",
        "Yayım Tipi",
        "Offset (m)",
        "Jeofon Dizilimi",
        "Grup Aralığı (m)",
        "Atış Aralığı (m)",
        "Örnekleme Aralığı (ms)",
        "Ekipman",
        "Enerji Kaynağı",
        "Km^2",
        "Profil Boyu (km)",
        "Elektrot Aralığı",
        "Dizilim Türü",
        "Seviye Sayısı",
        "Profil Aralığı",
        "A1",
        "A2",
        "A3",
        "A4",
        "Ölçü Karne No",
        "Dış Loop Boyutu",
        "published",
        "createdAt",
        "updatedAt",
      ],
    };
  },
  methods: {
    // filterCurrenttutorial() {
    //   return _.omitBy(
    //     this.modifyTutorial,
    //     (v) => _.isUndefined(v) || _.isNull(v) || v === ""
    //   );
    // },
    // renameKeys(obj) {
    //   var keys = Object.keys(obj);
    //   var newObj = {};
    //   for (let index = 0; index < keys.length; index++) {
    //     newObj[this.headers[index]] = obj[keys[index]]
    //       ? obj[keys[index]]
    //       : null;
    //   }
    //   return newObj;
    // },
    getTutorial(id) {
      TutorialDataService.get(id)
        .then((response) => {
          this.currentTutorial = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updatePublished(status) {
      var data = {
        id: this.currentTutorial.id,
        title: this.currentTutorial.title,
        description: this.currentTutorial.description,
        details: this.currentTutorial.details,
        published: status,
      };

      TutorialDataService.update(this.currentTutorial.id, data)
        .then((response) => {
          this.currentTutorial.published = status;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updateTutorial() {
      TutorialDataService.update(this.currentTutorial.id, this.currentTutorial)
        .then((response) => {
          console.log(response.data);
          this.message = "İçerik Başarıyla Güncellendi";
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteTutorial() {
      TutorialDataService.delete(this.currentTutorial.id)
        .then((response) => {
          console.log(response.data);
          this.$router.push({ name: "tutorials" });
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.getTutorial(this.$route.params.id);
  },
  // beforeRouteEnter(to, from, next) {
  //   next((vm) => {
  //     if (vm.$store.state.auth.user) {
  //       vm.getTutorial(vm.$route.params.id);
  //       vm.notNullcurrentTutorial = vm.filterCurrenttutorial();
  //     } else {
  //       next({ name: "login" });
  //     }
  //   });
  // },
};
</script>

<style>
.edit-form {
  position: relative;
  z-index: 1;
  min-height: 100%;
}
</style>
