<template>
  <div>
    <v-expansion-panels v-if="isMobile && newData">
      <v-expansion-panel>
        <v-expansion-panel-header> Proje Detayları </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-simple-table>
            <template v-slot:default>
              <tbody v-if="newData">
                <tr v-for="(val, key, index) in newData" :key="index">
                  <td v-if="val !== null">
                    {{ headers[index] }}
                  </td>
                  <td v-if="val !== null">
                    {{ val }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-simple-table v-else>
      <template v-slot:default>
        <tbody v-if="newData">
          <tr v-for="(val, key, index) in newData" :key="index">
            <td v-if="val !== null">
              {{ headers[index] }}
            </td>
            <td v-if="val !== null">
              {{ val }}
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
export default {
  name: "DetailTable",
  props: ["currentTutorial"],
  data() {
    return {
      isMobile: false,
      newData: null,

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
  beforeDestroy() {
    if (typeof window === "undefined") return;

    window.removeEventListener("resize", this.onResize, { passive: true });
  },

  mounted() {
    this.onResize();

    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeMount() {
    this.newData = Object.fromEntries(
      Object.entries(this.currentTutorial).filter(
        ([key]) =>
          !key.includes("id") &&
          !key.includes("updatedAt") &&
          !key.includes("createdAt") &&
          !key.includes("published") &&
          !key.includes("lat") &&
          !key.includes("lon")
      )
    );
  },
  methods: {
    onResize() {
      this.isMobile = window.innerWidth < 600;
    },
  },
};
</script>
