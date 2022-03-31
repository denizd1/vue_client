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
        required
      ></v-text-field>

      <v-text-field
        v-model="user.password"
        label="Şifre"
        :rules="passwordRules"
        type="password"
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
      this.$router.push("/tutorials-list");
    }
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        if (this.user.username && this.user.password) {
          this.$store.dispatch("auth/login", this.user).then(
            () => {
              this.$router.push("/tutorials-list");
            },
            (error) => {
              console.log(error);
            }
          );
        }
      }
    },
  },
};
</script>
