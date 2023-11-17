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
        requiresAuth: true,
        breadCrumb: [
          {
            text: "Anasayfa",
          },
        ],
      },
      //not use lazy load
      component: () => import("./components/TutorialsList"),
    },
    //rapor-dokumu
    {
      path: "/rapor-dokumu",
      name: "rapor-dokumu",
      meta: {
        requiresAuth: true,
        breadCrumb() {
          return [
            {
              text: "Anasayfa",
              to: { name: "calismalar" },
            },
            {
              text: "Rapor Dokümü",
            },
          ];
        },
      },
      component: () => import("./components/RaporDokumu"),
    },
    {
      path: "/calismalar/duzenle/:id",
      name: "duzenle",
      meta: {
        requiresAuth: true,
        breadCrumb() {
          return [
            {
              text: "Anasayfa",
              to: { name: "calismalar" },
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
        requiresAuth: true,
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
        requiresAuth: true,
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
      meta: {
        requiresAuth: true,
      },
      component: () => import("./components/TutorialsList"),
    },
    {
      path: "/giris",
      name: "giris",
      component: Login,
      meta: {
        hideNavbar: true,
      },
    },
    {
      path: "/giris",
      component: Register,
      meta: {
        hideNavbar: true,
      },
    },
    {
      path: "/profil",
      name: "profil",
      meta: {
        requiresAuth: true,
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

router.beforeEach((to, from, next) => {
  const publicPages = ["/giris"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");

  // trying to access a restricted page + not logged in + access token expired
  // redirect to login page
  if (authRequired && !loggedIn) {
    return next("/giris");
  }

  next();
});
