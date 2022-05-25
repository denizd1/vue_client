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
      path: "/tutorials-list",
      alias: "/tutorials-list",
      name: "tutorials-list",
      meta: {
        breadCrumb: [
          {
            text: "Çalismalar",
          },
        ],
      },
      component: () => import("./components/TutorialsList"),
    },
    {
      path: "/tutorials/edit/:id",
      name: "tutorial-edit",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Çalismalar",
              to: { name: "tutorials-list" },
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
      path: "/tutorials/:id",
      name: "tutorial",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Çalismalar",
              to: { name: "tutorials-list" },
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
      path: "/add",
      name: "add",
      meta: {
        breadCrumb() {
          return [
            {
              text: "Çalısmalar",
              to: { name: "tutorials-list" },
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
      name: "home",
      component: Login,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      component: Register,
    },
    {
      path: "/profile",
      name: "profile",
      meta: {
        breadCrumb: [
          {
            text: "Profil",
          },
        ],
      },
      // lazy-loaded
      component: () => import("./components/Profile"),
    },
  ],
});
