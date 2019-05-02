<template>
	<div>

		<v-layout row
		 class="mb-2 mt-0 back-btn">
			<v-flex xs12
			 class="text-xs-center">
				<v-btn outline
				 to="/recordings"
				 color="#331d2c"
				 class="primary--text">
					<v-icon left
					 dark> mdi-undo</v-icon>
					Go back
				</v-btn>
			</v-flex>
		</v-layout>

		<v-layout row
		 class="mb-4"
		 justify-center>
			<v-flex xs12>
				<v-card>
					<v-card-title class='mb-2 text-xs-center'>
						<h1> {{thisUlaTranscription.title}} </h1>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text v-if="thisUlaTranscription.title != thisUlaTranscription.date">
						Made at: {{thisUlaTranscription.date}}
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>

		<v-divider class="my-3"></v-divider>

		<v-layout row
		 justify-center>
			<h1>Play recorded file</h1>
		</v-layout>

		<v-layout v-if="audioFile !== null"
		 row
		 class="audio-btns">
			<v-flex xs6
			 class="audio-btns__box">
				<v-btn @click="playAudioFile"
				 fab
				 v-if="!audioPlaying"
				 small
				 color="blue-grey darken-1">
					<v-icon>
						mdi-play
					</v-icon>
				</v-btn>
				<v-btn @click="pauseAudioFile"
				 fab
				 v-if="audioPlaying"
				 small
				 color="blue-grey darken-1">
					<v-icon>
						mdi-pause
					</v-icon>
				</v-btn>
				<v-btn @click="stopAudioFile"
				 fab
				 v-if="!audioPlaying && audioPaused"
				 small
				 color="blue-grey darken-1">
					<v-icon>
						mdi-stop
					</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>

		<v-divider class="my-3"></v-divider>

		<!-- <v-layout class="ma-1"
		 row
		 justify-center>
			<h2>Audio</h2>
		</v-layout> -->

		<v-layout class="ma-1"
		 row
		 justify-center>
			<h2>Text transcription</h2>
		</v-layout>

		<v-layout v-if="thisUlaTranscription.content">
			<v-flex>
				<v-card class='transcribed-text-card'>
					<v-card-text class="transcribed-text-card__body">
						<p>
							{{thisUlaTranscription.content}}</p>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>

		<v-layout v-else>
			<v-flex class="text-xs-center">
				<v-card class='transcribed-text-card'>
					<v-card-text class="transcribed-text-card__body">
						<p>
							No text transcription for this file ...
						</p>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>

		<v-layout class="ma-1"
		 row
		 justify-center>
			<h2>Summary</h2>
		</v-layout>

		<v-layout>
			<v-flex>
				<v-card class='transcribed-text-card'>
					<v-card-text class="transcribed-text-card__body">
						<p v-if="thisUlaTranscription.summary">
							{{thisUlaTranscription.summary}}</p>
						<p v-else>
							File is to short for a summary ...
						</p>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>

	</div>
</template>

<script>
import { Howl, Howler } from "howler";

export default {
  props: ["audiotitle"],
  data: () => ({
    recorder: null,
    ulaFileExists: true,
    audioFile: null,
    audioPlaying: false,
    audioPaused: false
  }),
  computed: {
    thisUlaTranscription() {
      let textTranscriptions = this.$store.state.currentUser
        .userTextTranscriptions;
      if (textTranscriptions) {
        return textTranscriptions[this.audiotitle];
      }
      return { title: "No data fetched yet", date: "today", content: "" };
    },
    thisUlaSummary() {
      let allSummaries = this.$store.state.summaries;
      if (allSummaries) {
        return allSummaries[this.audiotitle];
      } else return false;
    },
    thisUlaAudioFileURL() {
      return this.$store.state.loadedAudioFile;
    }
  },
  methods: {
    playAudioFile() {
      this.audioFile.play();
      this.audioPlaying = true;
    },
    pauseAudioFile() {
      this.audioFile.pause();
      this.audioPlaying = false;
      this.audioPaused = true;
    },
    stopAudioFile() {
      this.audioFile.stop();
      this.audioPlaying = false;
      this.audioPaused = false;
    },
    checkIfAudioFinished() {
      if (
        this.recordedAudio.audioObj.ended &&
        this.recordedAudio.audioObj.currentTime > 0
      ) {
        return true;
      } else {
        return false;
      }
    },
    fetchUserRecordingItem(titleOfTheULAFile) {
      let textTranscriptions = this.$store.state.currentUser
        .userTextTranscriptions;
      //   IDEA: If the file is not null (if it exists and is already in our memory) we just return it. Otherwise, we fetch for it.
      if (textTranscriptions && textTranscriptions[titleOfTheULAFile]) {
        this.ulaFileExists = true;
      }
      return this.$store
        .dispatch("fetchSingleRecording", this.audiotitle)
        .then(resultingBoolean => {
          console.log("Im happening");
          console.log(resultingBoolean);

          if (resultingBoolean) {
            this.ulaFileExists = true;
          }
          this.ulaFileExists = false;
        })
        .catch(err => {
          console.log("problem while fetching individual ULA file !");
          console.log(err);
          this.ulaFileExists = false;
        });
    }
  },
  created() {
    // IDEA: I really hope you can call ".then()" on this below.. :|
    this.fetchUserRecordingItem(this.audiotitle).then(url => {
      console.log("url:");
      console.log(url);
      this.audioFile = new Howl({
        src: [this.thisUlaAudioFileURL],
        format: ["mp3"],
        html5: true,
        onend: () => {
          this.audioPlaying = false;
          this.audioPaused = false;
        }
      });
    });
    // IDEA: Credit: https://www.creativebloq.com/advice/get-started-with-the-web-audio-api
    // FIXME: THIS BELOW TRIES TO MAKE AN AUDIO BUFFER - MAKE IT WORKING.
    // Setup the new Howl.
    // let test =
    //   "qQpuRjNJB0d5MXy6q2hTUwDr0Nb2/My recording at: 14:38:27 (30-04-2019)";
    // // BaQ Beatz - Cruisin.mp3
    // this.$store.dispatch("fetchSingleAudioFile", test).then(url => {
    //   console.log("I am working");
    //   this.audioFile = new Howl({
    //     src: [url],
    //     format: ["mp3"],
    //     html5: true,
    //     onend: () => {
    //       this.audioPlaying = false;
    //       this.audioPaused = false;
    //     }
    //   });
    // });
  }
};
</script>

<style lang="scss" scoped>
.back-btn {
  transform: translateY(-55px);
}

.audio-btns {
  justify-content: center;
  &__box {
    display: flex;
    justify-content: space-evenly;
  }
}
</style>
