<template>
  <v-col v-if="newData" class="mx-auto py-3" sm="8" md="6" lg="4">
    <v-form ref="form" lazy-validation>
      <template v-for="(val, key, index) in newData">
        <v-text-field
          class="pb-2"
          v-if="val !== null"
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
import { bus } from "../main";
export default {
  name: "tutorial",
  data() {
    return {
      currentTutorial: null,
      newData: null,
      message: "",
      headers: [
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
      ],
    };
  },
  methods: {
    updatePublished(status) {
      var data = {
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
      console.log(this.currentTutorial);
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

  async beforeRouteEnter(to, from, next) {
    let fetchTutorial = await TutorialDataService.get(to.params.id);

    next((vm) => {
      var thisPerson = vm.$store.state.auth.user;
      if (thisPerson) {
        var thisAdmin = thisPerson.roles.includes("ROLE_ADMIN");
        var thisMod = thisPerson.roles.includes("ROLE_MODERATOR");
        if (thisAdmin || thisMod) {
          vm.currentTutorial = fetchTutorial.data;
          vm.newData = Object.fromEntries(
            Object.entries(vm.currentTutorial).filter(
              ([key]) =>
                !key.includes("id") &&
                !key.includes("updatedAt") &&
                !key.includes("createdAt") &&
                !key.includes("published") &&
                !key.includes("lat") &&
                !key.includes("lon")
            )
          );
          bus.$emit("reRender");
        } else next({ name: "login" });
      } else next({ name: "login" });
    });
  },
};
</script>
