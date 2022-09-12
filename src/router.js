import Vue from "vue";
import Router from "vue-router";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
// import store from '@/store/index.js';
Vue.use(Router);

export const router = new Router({
  // mode: "history",
  routes: [
    {
      path: "/calismalar",
      alias: "/calismalar",
      name: "calismalar",
      meta: {
        breadCrumb: [
          {
            text: "Anasayfa",
          },
        ],
      },
      component: () => import("./components/TutorialsList"),
    },
    {
      path: "/calismalar/duzenle/:id",
      name: "duzenle",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Anasayfa",
              to: { name: "projeler" },
            },
            {
              text: "Düzenle",
            },
          ];
        },
      },
      component: () => import("./components/TutorialEdit"),
    },
    {
      path: "/calisma/:id",
      name: "calisma",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Anasayfa",
              to: { name: "calismalar" },
            },
            {
              text: "Çalışma",
            },
          ];
        },
      },
      component: () => import("./components/Tutorial"),
    },
    {
      path: "/ekle",
      name: "ekle",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Anasayfa",
              to: { name: "calismalar" },
            },
            {
              text: "Ekle",
            },
          ];
        },
      },
      component: () => import("./components/AddTutorial"),
    },
    {
      path: "/",
      name: "anasayfa",
      component: Login,
    },
    {
      path: "/giris",
      name: "giris",
      component: Login,
    },
    {
      path: "/kaydol",
      component: Register,
    },
    {
      path: "/profil",
      name: "profil",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Anasayfa",
              to: { name: "calismalar" },
            },
            {
              text: "Profil",
            },
          ];
        },
      },
      // lazy-loaded
      component: () => import("./components/Profile"),
    },
  ],
});
