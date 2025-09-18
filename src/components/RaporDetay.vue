<template>
  <v-card :loading="loading" class="mx-auto my-12" max-width="374" v-if="rapor">
    <v-card-text>
      <v-list dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title
              >Rapor Adı: {{ rapor.rapor_adi }}</v-list-item-title
            >
            <v-list-item-title
              >Bilimsel Derleme No:
              {{ rapor.bilimsel_derleme_no }}</v-list-item-title
            >
            <v-list-item-title
              >Jeofizik Arşiv No:
              {{ rapor.jeofizik_arsiv_no }}</v-list-item-title
            >
            <v-list-item-title
              >Kuyu Logu Rapor No:
              {{ rapor.kuyu_logu_rapor_no }}</v-list-item-title
            >
            <v-list-item-title
              >İl / İlçe: {{ rapor.il }} / {{ rapor.ilce }}</v-list-item-title
            >
            <v-list-item-title
              >Yazarlar: {{ rapor.yazarlar }}</v-list-item-title
            >
            <v-list-item-title
              >Yöntemler: {{ rapor.kullanilan_yontemler }}</v-list-item-title
            >
            <!-- Add more fields as needed -->
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
<script>
import RaporDataService from "../services/RaporDataService";
export default {
  name: "RaporDetay",

  data() {
    return {
      rapor: null,
      componentKey: 0,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      var thisPerson = vm.$store.state.auth.user;
      var thisAdmin = thisPerson.roles.includes("ROLE_ADMIN");
      var thisMod = thisPerson.roles.includes("ROLE_MODERATOR");

      if (thisPerson) {
        RaporDataService.get(to.params.id).then((response) => {
          if (thisAdmin || thisMod) {
            vm.rapor = response.data;
          }
        });
      } else {
        next({ name: "giris" });
      }
    });
  },
};
</script>
