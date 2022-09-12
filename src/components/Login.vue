<template>
  <v-card
    class="mx-auto pa-5 ma-5"
    max-width="400"
    elevation="2"
    style="z-index: 99"
  >
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="user.username"
        label="Kullanıcı Adı"
        :rules="nameRules"
        prepend-icon="mdi-account-box"
        required
      ></v-text-field>

      <v-text-field
        v-model="user.password"
        label="Şifre"
        :rules="passwordRules"
        prepend-icon="mdi-lock"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append="showPassword = !showPassword"
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
      <v-alert v-if="message" class="mt-3" dense border="left" type="warning">
        {{ message }}
      </v-alert>
    </v-form>
  </v-card>
</template>

<script>
import User from "../models/user";

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
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
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
