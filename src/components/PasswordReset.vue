<template>
  <v-dialog
    v-model="show"
    max-width="470"
    dark
    class="rounded rounded-b-0"
    style="opacity: 0.8"
    centered
  >
    <v-card>
      <v-card-title>
        Şifremi Unuttum
        <v-spacer></v-spacer>
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text v-if="showform1">
        <v-form>
          <v-text-field
            v-model="email"
            label="Email"
            required
            prepend-icon="mdi-mail"
          ></v-text-field>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="forgotPassword">Kod Gönder</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
      <v-card-text v-if="showform2">
        <div>
          {{ email }} adresine gönderilen kod ile şifrenizi güncelleyiniz. Kod
          {{ countdown }} saniye sonra geçersiz olacaktır.
        </div>
        <v-spacer></v-spacer>

        <v-form>
          <v-text-field
            v-model="email"
            label="Email"
            required
            prepend-icon="mdi-mail"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Yeni Şifre"
            required
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            @click:append="showPassword = !showPassword"
          ></v-text-field>
          <v-text-field
            v-model="securitycode"
            label="Güvenlik Kodu"
            required
            prepend-icon="mdi-security"
          ></v-text-field>

          <v-card-actions class="justify-center">
            <v-btn color="primary" @click="resetPassword" class="mr-4"
              >Şifreyi Güncelle</v-btn
            >
            <v-btn v-if="countdown === 0" color="primary" @click="reSend"
              >Kodu Tekrar Gönder</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card-text>
      <v-card-text v-if="message">
        <v-alert class="mt-3" dense border="left" type="warning">
          {{ message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import userService from "../services/user.service";
import { bus } from "../main";

export default {
  name: "PasswordReset",
  data() {
    return {
      email: "",
      password: "",
      securitycode: "",
      show: false,
      showform1: true,
      showform2: false,
      showPassword: false,
      message: "",
      countdown: null,
      timer: null,
    };
  },
  watch: {
    showform2(val) {
      if (val) {
        this.countdown = 300;
        this.timer = setInterval(() => {
          this.countdown--;
          if (this.countdown === 0) {
            clearInterval(this.timer);
          }
        }, 1000);
      } else {
        clearInterval(this.timer);
      }
    },
  },

  methods: {
    reSend() {
      bus.$emit("loading", true);
      userService
        .forgotPassword(this.email)
        .then(() => {
          this.message = "";
          bus.$emit("loading", false);
          this.countdown = 300;
          this.timer = setInterval(() => {
            this.countdown--;
            if (this.countdown === 0) {
              clearInterval(this.timer);
            }
          }, 1000);
        })
        .catch((error) => {
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          bus.$emit("loading", false);
        });
    },
    forgotPassword() {
      bus.$emit("loading", true);
      // Perform password reset logic here
      // You can use the 'email' data property to access the entered email
      userService
        .forgotPassword(this.email)
        .then(() => {
          this.message = "";
          this.showform1 = false;
          this.showform2 = true;
        })
        .then(() => {
          bus.$emit("loading", false);
        })
        .catch((error) => {
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          bus.$emit("loading", false);
        });
    },
    resetPassword() {
      bus.$emit("loading", true);

      let params = {};
      params.email = this.email;
      params.password = this.password;
      params.securitycode = this.securitycode;
      // Perform password reset logic here
      // You can use the 'email' and 'password' data properties to access the entered values
      userService
        .resetPassword(params)
        .then(() => {
          this.message = "";

          this.show = false;
        })
        .then(() => {
          bus.$emit("loading", false);
        })
        .catch((error) => {
          this.message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          bus.$emit("loading", false);
        });
    },
  },
};
</script>
