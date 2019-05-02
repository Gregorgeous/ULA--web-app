<template>
	<div>
		<v-list class="rec-list">
			<h1 class="text-xs-center mb-2">Your recordings</h1>
			<v-divider class="mb-2"></v-divider>
			<v-list-tile :key="item.title"
			 v-for="(item,index)  in listOfRecordings"
			 @click="redirectToFile(index)">
				<v-list-tile-content class="rec-list__list-content">
					<v-list-tile-title> {{item.title}}
					</v-list-tile-title>
				</v-list-tile-content>
			</v-list-tile>
		</v-list>
	</div>
</template>

<script>
export default {
  components: {},
  data: () => ({}),
  methods: {
    redirectToFile(fileURL) {
      this.$router.push({
        name: "recording-item",
        params: { audiotitle: fileURL }
      });
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    },
    listOfRecordings() {
      return this.$store.state.currentUser.userTextTranscriptions;
    }
  },
  mounted() {
    this.$store.dispatch("fetchUserRecordings");
  }
};
</script>


<style lang="scss" scoped>
</style>
