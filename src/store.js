import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/storage";
import "firebase/firestore";
import "firebase/auth";
import axios from "axios";
import sampleText from "./sampleText";

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
		createTheAccountInDb({ commit }, payload) {
			console.log("Im here !!");
			console.log("this is my payload");
			console.log(payload);
			return firebase
				.firestore()
				.collection("Users")
				.doc(`${payload.uid}`)
				.set({
					fullName: payload.fullName,
					email: payload.email
				})
				.then(() => {
					console.log("Account successfully created ");
					commit("changeLoadingState", false);
					return true;
				})
				.catch(err => {
					console.log(
						`There was an error in the "createTheAccountInDb" action: ${err}`
					);
					commit("changeLoadingState", false);
					return false;
				});
		},
		register({ commit, dispatch }, payload) {
			commit("changeLoadingState", true);
			return firebase
				.auth()
				.createUserWithEmailAndPassword(payload.email, payload.password)
				.then(res => {
					let uid = res.user.uid;
					let newUserObject = {
						...payload,
						uid
					};
					return dispatch("createTheAccountInDb", newUserObject);
				})
				.catch(err => {
					console.log(err);
					commit("changeLoadingState", false);
					return false;
				});
		},
		logIn({ commit }, payload) {
			commit("changeLoadingState", true);
			console.log("this is payload", payload);

			if (!payload.persistentLogin) {
				// IDEA: If user doesn't want to login persistenly, we set auth obj persistence to SESSION
				return firebase
					.auth()
					.setPersistence(firebase.auth.Auth.Persistence.SESSION)
					.then(function() {
						return loginAuthAndDbFlow();
					});
			} else {
				return firebase
					.auth()
					.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
					.then(function() {
						return loginAuthAndDbFlow();
					});
			}

			function loginAuthAndDbFlow() {
				return firebase
					.auth()
					.signInWithEmailAndPassword(payload.email, payload.password)
					.then(user => {
						user = user.user;
						return firebase
							.firestore()
							.collection("Users")
							.doc(`${user.uid}`)
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
					})
					.catch(authError => {
						console.log("Error in authenticating the user", authError);
						commit("changeLoadingState", false);
						return false;
					});
			}
		},
		logout({ commit }) {
			firebase.auth().signOut();
			commit("logout");
		},
		// ========= SAVE RECORDING'S AUDIO ==============
		// NOTE: Remember, it's an internal action, to be used only in scope of saveTranscriptToFirebase() action. That's why the "_" before action's name!
		_saveAudioBlobToStorage({ state }, payload) {
			console.log("here I am");
			let userID = payload.userID;
			let audioID = payload.audioID;
			let audioBlob = payload.audioObject.audioBlob;
			firebase
				.storage()
				.ref(`${userID}/${audioID}`)
				.put(audioBlob)
				.then(snapshot => {
					console.log("the file has been uploaded to storage !");
					console.log(snapshot);
				})
				.catch(err => {
					console.log("error while storing audio blob in Firebase Storage");
					console.log(err);
				});
		},
		// ========= SUMMARIZATION ==============
		// @param Payload nee	ded fields:
		// -  'wholeText': whole generated text transcription
		saveTranscriptToFirebase({ state, commit, dispatch }, payload) {
			return firebase.auth().onAuthStateChanged(function(user) {
				let uid = user.uid; // this is just for convenience
				let legalAudioTitle = validateAudioTitleForFirebase(payload.audioTitle);
				let legalAudioTimestamp = validateAudioTitleForFirebase(
					payload.audioTimestamp
				);
				let textToSummarize;
				if (payload.wordsArray && payload.wordsArray.join(". ") < 50) {
					console.log(
						"Text to short to be summarized. Providing sample text instead"
					);
					textToSummarize = sampleText;
				} else {
					// FIXME: This is a quick and dirty fix to add commas and make sentences out of the big chunk of text.
					// textToSummarize = makeSentencesFromText(payload.wordsArray);
					textToSummarize = payload.wordsArray.join(". ");
				}
				let dataToSendForSummary = {
					userID: uid,
					audioID: legalAudioTimestamp,
					audioTitle: legalAudioTitle,
					wholeText: textToSummarize
				};
				let dataToSendForAudio = {
					userID: uid,
					audioID: legalAudioTimestamp,
					audioTitle: legalAudioTitle,
					audioObject: payload.audioObject
				};
				dispatch("_saveAudioBlobToStorage", dataToSendForAudio);
				axios
					.post("http://127.0.0.1:5000/summarization", dataToSendForSummary)
					.then(responseObject => {
						let resSummaryPath = responseObject.data;
						let field = `userTextTranscriptions.${legalAudioTimestamp}`;
						// let dateForAudio = makeDateForAudio();
						let transcriptionObject = {
							title: legalAudioTitle,
							date: payload.audioTimestamp,
							content: payload.wholeText,
							pathToSummary: resSummaryPath,
							pathToAudio: `${uid}/${legalAudioTimestamp}`
						};

						firebase
							.firestore()
							.collection("Users")
							.doc(`${uid}`)
							.update({
								[field]: transcriptionObject
							})
							.catch(err => {
								console.log(
									"Error in saving the wholeTextTranscription to users account"
								);
								console.log(err);
								return false;
							});
					});
				return legalAudioTitle;
			});
		},
		// ========== user's recording list view actions ====
		async fetchUserRecordings({ dispatch }) {
			let currentUser = await this.dispatch("checkCurrentUser");
			this.dispatch("fetchUserDbDataFromUid", currentUser.uid);
		},
		fetchSingleRecording({ dispatch, state }, ulaFileName) {
			let currentUser = dispatch("checkCurrentUser");
			return dispatch("fetchUserDbDataFromUid", currentUser.uid).then(() => {
				let wantedULAFileExists =
					state.currentUser.userTextTranscriptions[ulaFileName];
				let summaryExists = wantedULAFileExists["pathToSummary"];
				let audioExists = wantedULAFileExists["pathToAudio"];

				if (wantedULAFileExists && summaryExists) {
					let payload = {
						pathToSummary: summaryExists,
						transcriptionTitle: ulaFileName
					};
					dispatch("fetchSingleSummary", payload).then(res => {
						return true;
					});
				}
				if (wantedULAFileExists && audioExists) {
					let audioPath = audioExists; // just an alias for better clarity.
					return dispatch("fetchSingleAudioFile", audioPath).then(result => {
						console.log("in chain, result");
						console.log(result);

						return result;
					});
				}
				return false;
			});
		},
		// TODO: FINISH THIS ! STEPS TO DO:
		// - Figure out how to run this AFTER "fetchSingleRecording" ACTION
		// - Create a mutation that saves the summary in the vuex store
		// - On ULARecordingItem view: add computed to hold the summary and keywords from the vuex state
		// - You might need some additional display logic on the view side as data comes with "\n" escape chars ...
		// - pray it'll all work ;p
		fetchSingleSummary({ commit }, payload) {
			let pathToSummary = payload.pathToSummary;
			let transcriptionTitle = payload.transcriptionTitle;
			return firebase
				.database()
				.ref(`${pathToSummary}`)
				.once("value")
				.then(resSnapshot => {
					let responseObject = resSnapshot.val();
					// IDEA: Remember responseObject gives you back an object like this {"keywords: ..., "summary": ...}
					let commitObj = {
						transcriptionTitle,
						summary: responseObject.summary,
						keywords: responseObject.keywords
					};
					commit("setOneUserSummary", commitObj);
				});
		},
		fetchSingleAudioFile({ commit }, audioURL) {
			return firebase
				.storage()
				.ref(audioURL)
				.getDownloadURL()
				.then(url => {
					console.log("this is the url");
					console.log(url);
					commit("setLoadAudioFile", url);
					return url;
				});
		}
	}
});

// Function Description: Arbitrarily divide the whole text into sentences by adding a full stop after every 8 words.
function makeSentencesFromText(wordsArray) {
	let sentencedStringArray = [];

	wordsArray.forEach((word, index) => {
		if (index % 8 == 0 && index != 0) {
			sentencedStringArray.push(".");
		}
		sentencedStringArray.push(word);
		// If it's the last word we also want to finish it all with a dot at the end.
		if (index == wordsArray.length - 1) {
			sentencedStringArray.push(".");
		}
	});

	return sentencedStringArray.join(" ");
}

function validateAudioTitleForFirebase(audioTitle) {
	let newAudioTitle;
	newAudioTitle = audioTitle.replace(/([*\[\]])/g, "");
	newAudioTitle = newAudioTitle.replace(/(\/)/g, "-");
	return newAudioTitle;
}

function makeDateForAudio() {
	let wholeDate = new Date();
	let timeFormat = wholeDate.toLocaleTimeString();
	let dateFormat = wholeDate.toLocaleDateString();
	return `${timeFormat} (${dateFormat})`;
}
