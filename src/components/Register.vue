<template>
  <v-card
    class="mx-auto pa-5 ma-5"
    max-width="400"
    elevation="2"
    style="z-index: 99"
  >
    <v-form ref="form" v-model="valid" lazy-validation v-if="!submitted">
      <v-text-field
        v-model="user.username"
        label="Kullanıcı Adı"
        :rules="nameRules"
        required
      ></v-text-field>
      <v-text-field
        v-model="user.email"
        :rules="emailRules"
        label="E-mail"
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
          Kaydol
        </v-btn>
      </div>
      <v-alert v-if="message" class="mt-3" dense border="left" type="warning">
        {{ message }}
      </v-alert>
    </v-form>
    <div style="z-index: 99" v-else>
      <v-card-title class="justify-center"> Kaydınız Tamamlandı! </v-card-title>
    </div>
  </v-card>
</template>

<script>
import User from "../models/user";

export default {
  name: "Register",
  data() {
    return {
      valid: true,
      submitted: false,
      message: "",
      user: new User("", "", ""),
      nameRules: [(v) => !!v || "Bu alan boş bırakılamaz."],
      passwordRules: [(v) => !!v || "Bu alan boş bırakılamaz."],
      emailRules: [
        (v) => !!v || "Bu alan boş bırakılamaz.",
        (v) =>
          /.+@.+\..+/.test(v) || "Lütfen geçerli bir email adresi giriniz.",
      ],
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  mounted() {
    if (this.loggedIn) {
      this.$router.push("/tutorials-list");
    }
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("auth/register", this.user).then(
          (data) => {
            this.message = data.message;
            this.submitted = true;
            setTimeout(() => {
              this.$router.push("/login");
            }, 2000);
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
    },
  },
};
</script>
