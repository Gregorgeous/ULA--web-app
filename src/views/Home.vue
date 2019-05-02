<template>
	<div>

		<h1 class='greetings-header'
		 v-if="currentUser.fullName">Hello, {{currentUser.fullName}}!</h1>

		<v-card class="recorder-card mx-auto"
		 dark
		 max-width="400">
			<v-card-title class="recorder-card__header">

				<span class="headline">Start recording</span>
			</v-card-title>
			<v-divider color='black'></v-divider>
			<v-card-text class="headline font-weight-bold">
				<v-layout row>
					<v-flex class='text-xs-center'>
						<!-- {{recordingTimeObject.hours}}:{{recordingTimeObject.minutes}}:{{recordingTimeObject.seconds}} -->
					</v-flex>
				</v-layout>
				<v-layout row>
					<v-flex class='text-xs-center'>
						<audio></audio>
					</v-flex>
				</v-layout>
			</v-card-text>
			<v-card-actions class='recorder-card__rec-buttons-area'>

				<v-btn class='rec_btns__record-btn'
				 @click="startRecording"
				 fab
				 v-if="!isRecordingOn"
				 small
				 color="red">
				</v-btn>
				<v-btn class='rec_btns__pause-btn'
				 fab
				 v-if="isRecordingOn"
				 small
				 @click="pauseRecording"
				 color="blue-grey darken-1">
					<v-icon>
						mdi-pause
					</v-icon>
				</v-btn>
				<v-btn class='rec_btns__stop-btn'
				 @click="stopRecording"
				 fab
				 v-if="isRecordingOn || recordingPaused"
				 small
				 color="blue-grey darken-1">
					<v-icon>
						mdi-stop
					</v-icon>
				</v-btn>
			</v-card-actions>
		</v-card>

		<v-layout row
		 justify-center>
			<v-flex xs6>
				<transition name='slide-in'>
					<v-card class='audio-playback-card mt-5 mx-auto'
					 v-if="recordedAudio !== null"
					 style="max-width: 200px;">
						<v-card-text class='text-xs-center'>
							<v-layout justify-center="">
								file recorded
							</v-layout>
							<!-- <v-layout>
								file duration: {{recordedAudio.audioObj["duration"]}}
							</v-layout>
							<v-layout>
								CurrentTime {{recordedAudio.audioObj["currentTime"]}}
							</v-layout> -->
						</v-card-text>
						<v-card-actions class="audio-playback-card__rec-buttons-area">
							<v-btn class='audio-playback_btns__stop-btn'
							 @click="playCreatedAudio"
							 fab
							 v-if="!audioPlay"
							 small
							 color="blue-grey darken-1">
								<v-icon>
									mdi-play
								</v-icon>
							</v-btn>
							<v-btn class='audio-playback_btns__stop-btn'
							 @click="pauseCreatedAudio"
							 fab
							 v-if="audioPlay"
							 small
							 color="blue-grey darken-1">
								<v-icon>
									mdi-pause
								</v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</transition>
			</v-flex>

		</v-layout>

		<v-layout justify-center>
			<v-flex xs6
			 class='text-transcript-card--flex'>

				<transition name='slide-in'>
					<v-card class='text-transcript-card mt-5 mx-auto'
					 v-if="recordedAudio !== null && !userRequestedTranscription"
					 style="max-width: 200px;">
						<v-card-text class='text-xs-center'>
							<v-layout>
								Make text transcription
							</v-layout>
						</v-card-text>
						<v-card-actions class="text-transcript-card__rec-buttons-area">
							<v-btn class='text-transcript_btns__stop-btn'
							 fab
							 small
							 @click="userRequestedTranscription = true"
							 color="blue-grey darken-1">
								<v-icon>
									mdi-file-document-box
								</v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</transition>
			</v-flex>
		</v-layout>

		<v-layout class='mt-5'
		 v-if="nativeTextTranscription.length > 0 && userRequestedTranscription">
			<v-flex>
				<transition name='slide-in'>
					<v-card class='transcribed-text-card'>
						<v-card-title class="transcribed-text-card__title">
							This is the text transcription of the audio file:
						</v-card-title>
						<v-divider color='black'
						 class='transcribed-text-card__divider'></v-divider>
						<v-card-text class="transcribed-text-card__body">
							<p v-for="(word,index) in nativeTextTranscription"
							 :key="index">{{word}}</p>
						</v-card-text>
					</v-card>
				</transition>
			</v-flex>

		</v-layout>

		<v-layout>
			<saveDialog :dialog='saveRecordingDialog'
			 :native-text-transcription='nativeTextTranscription'
			 :recorded-audio='recordedAudio'
			 @discard-save-dialog='discardTheRecording'></saveDialog>
		</v-layout>

	</div>
</template>

<script>
import { recordAudio } from "./../recordingModule";
import { log, print } from "util";
import { setInterval, clearInterval } from "timers";

export default {
  components: { saveDialog },
  data: () => ({
    recorder: null,
    recordingPaused: false,
    recordedAudio: null,
    audioPlay: false,
    userRequestedTranscription: false,
    nativeSpeechRecognition: null,
    nativeTextTranscription: [],
    saveRecordingDialog: false,
    speechRecognitionEnded: false
  }),
  methods: {
    async startRecording() {
      if (this.recordingPaused) {
        return this.resumeRecording();
      }
      this.recorder = await this.recordAudio();
      this.recorder.start();
      this.speechRecognitionEnded = false;
      this.nativeSpeechToText();
    },
    async pauseRecording() {
      this.recorder.pause();
      this.recordingPaused = true;
      this.stopNativeSpeechToText();
    },
    async resumeRecording() {
      this.recorder.resume();
      this.recordingPaused = false;
      this.speechRecognitionEnded = false;
      this.nativeSpeechToText();
    },
    async stopRecording() {
      this.recordingPaused = false;
      this.recordedAudio = await this.recorder.stop();
      this.stopNativeSpeechToText();
      this.openSaveRecordingDialog();
    },
    openSaveRecordingDialog() {
      this.saveRecordingDialog = true;
    },
    discardTheRecording() {
      this.saveRecordingDialog = false;
      this.nativeTextTranscription = [];

      // TODO: check if the below is needed (coz currently I think it breaks the recorder for the next recordings..)
      // this.recorder = null;
      // this.recordingPaused = false;
      // this.recordedAudio = null;
      // this.audioPlay = false;
      // this.userRequestedTranscription = false;
      // this.nativeSpeechRecognition = null;
    },
    nativeSpeechToText() {
      if (this.nativeSpeechRecognition == null) {
        return console.log("speech recognition not supported in your browser");
        alert("speech recognition not supported in your browser");
        this.nativeTextTranscription.push(
          "speech recognition is not supported in your browser"
        );
      }
      this.nativeSpeechRecognition.start();
    },
    stopNativeSpeechToText() {
      if (this.nativeSpeechRecognition == null) {
        return;
      }
      this.speechRecognitionEnded = true;
      this.nativeSpeechRecognition.stop();
    },
    recordAudio() {
      return recordAudio();
    },
  },
  mounted() {
    window.SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    this.nativeSpeechRecognition = new SpeechRecognition();
    this.nativeSpeechRecognition.lang = "en-US";
    this.nativeSpeechRecognition.continuous = true;
    this.nativeSpeechRecognition.maxAlternatives = 1;
    this.nativeSpeechRecognition.onresult = event => {
      console.log("this is the result");
      console.log(event);
      this.nativeTextTranscription.push(event.results[0][0].transcript);
      console.log("Stop happened");
      this.nativeSpeechRecognition.stop();
    };

    this.nativeSpeechRecognition.onspeechend = () => {
      this.nativeSpeechRecognition.stop();
    };

    this.nativeSpeechRecognition.onaudiostart = event => {
      //Fired when the user agent has started to capture audio.
      console.log("SpeechRecognition.onaudiostart");
    };

    this.nativeSpeechRecognition.onaudioend = event => {
      //Fired when the user agent has finished capturing audio.
      console.log("SpeechRecognition.onaudioend");
      setTimeout(() => {
        if (!this.speechRecognitionEnded) {
          console.log("start happened");
          this.nativeSpeechToText();
        }
      }, 1000);
    };

    this.nativeSpeechRecognition.onend = event => {
      //Fired when the speech this.nativeSpeechRecognition service has disconnected.
      console.log("SpeechRecognition.onend");
    };

    this.nativeSpeechRecognition.onnomatch = event => {
      //Fired when the speech this.nativeSpeechRecognition service returns a final result with no significant this.nativeSpeechRecognition. This may involve some degree of this.nativeSpeechRecognition, which doesn't meet or exceed the confidence threshold.
      console.log("SpeechRecognition.onnomatch");
    };

    this.nativeSpeechRecognition.onsoundstart = event => {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log("SpeechRecognition.onsoundstart");
    };

    this.nativeSpeechRecognition.onsoundend = event => {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log("SpeechRecognition.onsoundend");
    };
  }
};
</script>


<style lang="scss" scoped>
.greetings-header {
  align-self: center;
  display: block;
  margin: auto;
  text-align: center;
  margin-bottom: 15vh;
}
.recorder-card {
  transition: all 0.4s ease;
  &__header {
    // TODO: make this a sass mixin
    display: flex;
    justify-content: center;
  }

  &__rec-buttons-area {
    display: flex;
    justify-content: space-evenly;
  }
  .rec_btns {
    &__record-btn {
      position: relative;
      &::after {
        content: "";
        position: absolute;
        width: 15px;
        height: 15px;
        background: white;
        border-radius: 50%;
      }
    }
  }
}

// TODO: refactor to make it DRY ! (you repeat some styles..)
.audio-playback-card {
  &__rec-buttons-area {
    display: flex;
    justify-content: space-evenly;
  }
}

.slide-in-enter-active,
.slide-in-leave-active {
  transition: opacity 0.4s ease-in, transform 0.4s ease-in;
}
.slide-in-enter,
.slide-in-leave-to {
  opacity: 0;
  transform: translateY(-70px);
}

.text-transcript-card {
  &--flex {
    display: flex;
    align-items: stretch;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.transcribed-text-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__divider {
    width: 100%;
  }

  &__body {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    p {
      margin: 0 5px;
    }
  }
}
</style>
