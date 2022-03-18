import Vue from 'vue';
import Router from 'vue-router';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
// import store from '@/store/index.js';
Vue.use(Router);

export const router = new Router({
  // mode: "history",
  routes: [
    {
      path: "/tutorials-list",
      alias: "/tutorials-list",
      name: "tutorials-list",
      component: () => import("./components/TutorialsList")
    },
    {
      path: "/tutorials/edit/:id",
      name: "tutorial-edit",
      component: () => import("./components/TutorialEdit")
    },
    {
      path: "/tutorials/:id",
      name: "tutorial",
      component: () => import("./components/Tutorial")
    },
    {
      path: "/add",
      name: "add",
      component: () => import("./components/AddTutorial")
    },
    {
      path: '/',
      name: 'home',
      component: Login
    },
    {
      path: '/login',
      name:'login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/profile',
      name: 'profile',
      // lazy-loaded
      component: () => import('./components/Profile')
    }
  ]
});
