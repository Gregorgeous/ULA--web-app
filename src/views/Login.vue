<template>
	<v-layout class='mt-1'
	 column
	 justify-center
	 align-center>
		<v-flex xs12
		 sm8
		 md6>
			<loginForm></loginForm>
		</v-flex>
	</v-layout>
</template>

<script>
import loginForm from "@/components/loginForm";
export default {
  components: {
    loginForm
  }
};
</script>
