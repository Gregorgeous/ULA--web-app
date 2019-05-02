import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/storage";
import "firebase/firestore";
import "firebase/auth";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		recordingTime: {
			hours: 0,
			minutes: 0,
			seconds: 0
		},
		isRecordingOn: false,
		loadingState: false,
		userLoggedIn: false,
		currentUser: {
			fullName: "",
			email: ""
		},
		loadedAudioFile: null
	},
	mutations: {
		changeRecordingStateTo(state, boolean) {
			state.isRecordingOn = boolean;
		},
		changeLoadingState(state, boolStatus) {
			state.loadingState = boolStatus;
		},
		setCurrentUser(state, payload) {
			state.currentUser = payload;
			state.userLoggedIn = true;
		},
		setLoadAudioFile(state, payload) {
			state.loadedAudioFile = payload;
		},
		logout(state) {
			state.currentUser = {
				fullName: null,
				email: null,
				userTextTranscriptions: {},
				userSummaryURLs: []
			};
			state.userLoggedIn = false;
		},
		setOneUserSummary(state, payload) {
			// IDEA: NOTE: THIS WON'T WORK DUE TO JS' BROKEN OBJECTS REACTIVITY SYSTEM (lack of "getter" and "setter" watchers on objects in JS)!
			//
			// state.currentUser.userTextTranscriptions[
			// 	payload.transcriptionTitle
			// ].summary = payload.summary;
			// state.currentUser.userTextTranscriptions[
			// 	payload.transcriptionTitle
			// ].keywords = payload.keywords;
			// IDEA: Instead, you need to create a brand new object below. NOW this will make the computed property on ULARecordingItem correctly reactive to changes.
			let oldTT =
				state.currentUser.userTextTranscriptions[payload.transcriptionTitle];
			state.currentUser.userTextTranscriptions[payload.transcriptionTitle] = {
				...oldTT,
				summary: payload.summary,
				keywords: payload.keywords
			};
		}
	},
	actions: {
		fetchUserDbDataFromUid({ commit }, uid) {
			return firebase
				.firestore()
				.collection("Users")
				.doc(`${uid}`)
				.get()
				.then(userAccount => {
					console.log("This is what I got fetching user's account");
					console.log(userAccount.data());
					if (userAccount.exists) {
						commit("setCurrentUser", userAccount.data());
						commit("changeLoadingState", false);
						return true;
					}
					// TODO: ensure this case is handled by the front-facing login form !
					else {
						console.log(
							"ERROR: couldn't find this authenticated user's account in the firestore..."
						);
						return false;
					}
				})
				.catch(dbFetchError => {
					console.log(
						"Error while fetching users's account data by their uid: ",
						dbFetchError
					);
					commit("changeLoadingState", false);
					return false;
				});
		},
		checkCurrentUser() {
			let user = firebase.auth().currentUser;
			if (user) {
				return user;
			}
			return firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					return user;
				} else {
					return null;
				}
			});
		},
	}
});
