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
  mutations: {},
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
});
