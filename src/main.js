import "@babel/polyfill";
import Vue from "vue";
import "./plugins/vuetify";
import mainLayout from "./MainLayout.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

Vue.config.productionTip = false;

// INITIALISE FIREBASE HERE
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import fbConfig from "@/../firebaseConfig";

// IDEA: this 'if' prevents an occasional "Firebase application already initialized" error
if (!firebase.apps.length) {
	firebase.initializeApp(fbConfig);
}

new Vue({
	router,
	store,
	render: h => h(mainLayout)
}).$mount("#app");
