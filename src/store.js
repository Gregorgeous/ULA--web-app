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
  actions: {}
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
});
