<template>
	<div id="main">
		<div class="inner">
			<h1 id="text02">Hi again! :)</h1>
			<h2 class='subheading'> Log in here:</h2>
			<v-alert :value="errorInForm"
			 type="error"
			 transition="scale-transition">
				Error during submission! Try again.
			</v-alert>
			<v-form ref="form"
			 v-model="valid">
				<v-text-field v-model="email"
				 :rules="emailRules"
				 label="E-mail"
				 color="success"
				 light
				 outline
				 required></v-text-field>

				<!-- TODO: Remember to bring back the pass show/hide once icon system fixed -->
				<v-text-field v-model="password"
				 :rules="[passwordRules.required]"
				 :type="showPassword ? 'text' : 'password'"
				 color="success"
				 light
				 outline
				 name="input-10-1"
				 label="Password"
				 @click:append="showPassword = !showPassword"></v-text-field>

				<v-checkbox v-model="persistentLogin"
				 class="my-0"
				 light
				 label="Keep me logged in"
				 required></v-checkbox>

				<v-btn :disabled="!valid"
				 @click="loginFormSubmit"
				 light
				 :class="increaseSubmitBtnSize"
				 color="green"
				 :loading="isLoading">
					Log in !
				</v-btn>
				<v-btn light
				 :class="clearFormBtnDisappear"
				 v-if="!formDuringSubmission"
				 :loading="isLoading"
				 @click="clearForm">Clear</v-btn>
			</v-form>

			<small>No account yet?
				<router-link to="/register">
					Create one here!
				</router-link>
			</small>
			<br>
			<!-- TODO: implement fully the"password reset" feature -->
			<passwordReset></passwordReset>
		</div>
	</div>
</template>

<script>
import passwordReset from "@/components/passwordReset";

export default {
  components: { passwordReset },
  data: () => ({
    valid: true,
    email: "",
    emailRules: [
      v => !!v || "Field cannot be empty",
      v => /.+@.+/.test(v) || "Incorrect e-mail address"
    ],
    password: "",
    passwordRules: {
      required: value => !!value || "Field cannot be empty"
    },
    showPassword: false,
    persistentLogin: false,
    errorInForm: false,
    formDuringSubmission: false
  }),
  methods: {
    loginFormSubmit() {
      if (this.$refs.form.validate()) {
        this.formDuringSubmission = true;
        console.log("Form accepted ! Triggering FB function...");
        this.$store
          .dispatch("logIn", {
            email: this.email,
            password: this.password,
            persistentLogin: this.persistentLogin
          })
          .then(result => {
            console.log("result of promise:", result);
            if (result === true) {
              this.clearForm();
              this.errorInForm = false;
              this.$router.push("/");
            } else {
              this.errorInForm = true;
            }
          });
        this.clearForm();
      }
    },
    clearForm() {
      this.$refs.form.reset();
      this.persistentLogin = false;
    }
  },
  computed: {
    // TODO: implement upon vuex creation
    isLoading() {
      return this.$store.state.loadingState;
    },
    clearFormBtnDisappear() {
      if (!this.formDuringSubmission) {
        return;
      }
      return {
        transform: "scaleX(0)"
      };
    },
    increaseSubmitBtnSize() {
      if (!this.formDuringSubmission) {
        return;
      }
      return {
        transform: "translateX(60px) scaleX(1.6)"
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/myFormsStyles.scss";
</style>