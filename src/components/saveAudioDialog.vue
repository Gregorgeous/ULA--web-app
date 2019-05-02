<template>
	<v-dialog v-model="dialog"
	 persistent>
		<v-card class="audio-save-dialog">
			<v-card-title class="audio-save-dialog__title">
				<span class="headline">Save ULA file</span>
			</v-card-title>
			<v-card-text>
				<v-container grid-list-md>
					<v-layout wrap>
						<v-flex xs12>
							<v-text-field label="File name:"
							 required
							 v-model="userGeneratedTitle"></v-text-field>
						</v-flex>
					</v-layout>
				</v-container>
			</v-card-text>
			<v-card-actions class="audio-save-dialog__action-btns">
				<v-btn color="red darken-3"
				 flat
				 @click="discardSaveDialog">Discard audio</v-btn>
				<v-btn color="green darken-3"
				 flat
				 @click="saveRecording">Save audio</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
  data: () => ({
    dateGeneratedTitle: "",
    originalTimestampAtAudioSave: null,
    userGeneratedTitle: ""
  }),
  props: ["dialog", "nativeTextTranscription", "recordedAudio"],
  methods: {
    async saveRecording() {
      let wordsArray = await this.nativeTextTranscription;
      let audioObject = await this.recordedAudio;
      let audioTimestamp = this.dateGeneratedTitle;
      let audioTitle = this.userGeneratedTitle;
      let wholeText = wordsArray.join(" ");
      this.$store
        .dispatch("saveTranscriptToFirebase", {
          wholeText,
          wordsArray,
          audioTitle,
          audioTimestamp,
          audioObject
        })
        .then(boolResult => {
          console.log("operations successful?");
          console.log(boolResult);

          // let urlOfTheCreatedFile = audioTitle.replace(/([*\[\]])/g, "");
          // urlOfTheCreatedFile = urlOfTheCreatedFile.replace(/(\/)/g, "-");

          this.$router.push({
            name: "recordings"
          });
        });
    },
    discardSaveDialog() {
      console.log("prop trigger");

      this.$emit("discard-save-dialog");
    }
  },
  watch: {
    dialog: function(triggered) {
      if (triggered) {
        let wholeDate = new Date();
        let timeFormat = wholeDate.toLocaleTimeString();
        let dateFormat = wholeDate.toLocaleDateString();
        this.originalTimestampAtAudioSave = wholeDate;
        let dateGeneratedTitle = `My recording at: ${timeFormat} (${dateFormat})`;
        this.dateGeneratedTitle = dateGeneratedTitle;
        this.userGeneratedTitle = dateGeneratedTitle;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.audio-save-dialog {
  // min-height: 325px;
  &__title {
    display: flex;
    justify-content: center;
  }

  &__action-btns {
    display: flex;
    justify-content: space-evenly;
  }
}
</style>
