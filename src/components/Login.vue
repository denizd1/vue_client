<template>
  <v-row class="justify-center">
    <v-col cols="8" md="4">
      <v-tabs
        dark
        class="rounded rounded-b-0"
        style="opacity: 0.8"
        centered
        v-model="tab"
      >
        <v-tab dark href="#giris">Giriş</v-tab>
        <v-tab dark href="#kaydol">Kaydol</v-tab>
      </v-tabs>
      <v-tabs-items
        v-model="tab"
        style="background-color: transparent !important"
      >
        <v-tab-item value="giris">
          <v-card
            dark
            class="mx-auto pa-5 rounded-t-0"
            elevation="2"
            style="z-index: 99; opacity: 0.8"
          >
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                color="blue darken-2"
                v-model="user.username"
                label="Kullanıcı Adı"
                :rules="nameRules"
                prepend-icon="mdi-account-box"
                v-on:keydown.native.enter="validate"
                required
              ></v-text-field>

              <v-text-field
                color="blue darken-2"
                v-model="user.password"
                label="Şifre"
                :rules="passwordRules"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append="showPassword = !showPassword"
                v-on:keydown.native.enter="validate"
                required
              ></v-text-field>
              <div class="text-center">
                <v-btn
                  :disabled="!valid"
                  color="success"
                  class="mr-4"
                  @click="validate"
                >
                  Giriş Yap
                </v-btn>
              </div>
              <v-alert
                v-if="message"
                class="mt-3"
                dense
                border="left"
                type="warning"
              >
                {{ message }}
              </v-alert>
            </v-form>
            <p style="margin: 20px 0 0 0" class="font-weight-thin text-center">
              ProjectHub | MTA Jeofizik
            </p>
          </v-card>
        </v-tab-item>
        <v-tab-item value="kaydol" style="background: transparent !important">
          <register></register>
        </v-tab-item>
      </v-tabs-items>
    </v-col>
  </v-row>
</template>

<script>
import User from "../models/user";
import Register from "./Register.vue";

export default {
  name: "Login",
  data() {
    return {
      valid: true,
      message: "",
      showPassword: false,
      user: new User("", ""),
      nameRules: [(v) => !!v || "Bu alan boş bırakılamaz."],
      passwordRules: [(v) => !!v || "Bu alan boş bırakılamaz."],
    };
  },
  components: {
    Register,
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
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.$route.fullPath === "/?tab=giris") {
        vm.$router.push("/giris?tab=giris");
      }
    });
  },
  created() {
    if (this.loggedIn) {
      this.$router.push("/calismalar");
    }
  },
  methods: {
    validate() {
      if (!this.$refs.form.validate()) {
        return;
      } else {
        if (this.user.username && this.user.password) {
          this.$store.dispatch("auth/login", this.user).then(
            () => {
              this.$router.push("/calismalar");
            },
            (error) => {
              this.message =
                (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
                error.message ||
                error.toString();
            }
          );
        }
      }
    },
  },
};
</script>
