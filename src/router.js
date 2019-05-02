import Vue from "vue";
import Router from "vue-router";
import store from "./store";
import firebase from "firebase/app";
import "firebase/auth";

import Home from "./views/Home.vue";

Vue.use(Router);

let router = new Router({
	mode: "history",
	base: process.env.BASE_URL,
	routes: [
		{
			path: "/",
			name: "home",
			component: Home,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: "/login",
			name: "login",
			component: () =>
				import(/* webpackChunkName: "login" */ "./views/Login.vue")
		},
		{
			path: "/register",
			name: "register",
			component: () =>
				import(/* webpackChunkName: "Register" */ "./views/Register.vue")
		}
	]
});

router.beforeEach((to, from, next) => {
	let currentUser = firebase.auth().currentUser;
	console.log("from router, that's currentuser: ", currentUser);
	if (!currentUser) {
		firebase.auth().onAuthStateChanged(function(user) {
			console.log("this is user info", user);
			if (!store.state.userLoggedIn && user) {
				store.dispatch("fetchUserDbDataFromUid", user.uid);
			}
			let requiresAuth = to.matched.some(record => record.meta.requiresAuth);
			if (requiresAuth && !user) next("login");
			else next();
		});
	} else {
		next();
	}
});

export default router;
