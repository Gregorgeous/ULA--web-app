<template>
	<div id="main">
		<div class="inner">
			<h1 id="text02">Create the ULA account</h1>
			<v-alert :value="errorInForm"
			 type="error"
			 transition="scale-transition">
				Error during submission! Try again.
			</v-alert>
			<v-form ref="form"
			 v-model="valid">
				<v-text-field v-model="name"
				 :rules="nameRules"
				 outline
				 color="success"
				 label="Full name"
				 light
				 required></v-text-field>
				<v-text-field v-model="email"
				 :rules="emailRules"
				 label="E-mail"
				 color="success"
				 light
				 outline
				 required></v-text-field>
				<!-- TODO: Remember to bring back the pass show/hide once icon system fixed -->
				<v-text-field v-model="password"
				 :rules="[passwordRules.required, passwordRules.min,
				 () => {return !repeatedPassword ? true : repeatedPassword === password || 'Password needs to match the one provided below'}]"
				 :type="showPassword ? 'text' : 'password'"
				 color="success"
				 light
				 outline
				 name="input-10-1"
				 label="Provide password"
				 @click:append="showPassword = !showPassword"></v-text-field>
				<!-- TODO: Remember to bring back the pass show/hide once icon system fixed -->
				<v-text-field v-model="repeatedPassword"
				 :rules="[
				 repeatedPasswordRules.required, repeatedPasswordRules.min,
				 () => repeatedPassword === password || 'Passwords must match !']"
				 :type="showRepeatedPassword ? 'text' : 'password'"
				 color="success"
				 light
				 outline
				 name="input-10-1"
				 label="Repeat the password"
				 @click:append="showRepeatedPassword = !showRepeatedPassword"></v-text-field>
				<v-btn :disabled="!valid"
				 @click="registerFormSubmit"
				 light
				 :class="increaseSubmitBtnSize"
				 color="green"
				 :loading="isLoading">
					Create account !
				</v-btn>
				<v-btn light
				 :class="clearFormBtnDisappear"
				 v-if="!formDuringSubmission"
				 :loading="isLoading"
				 @click="clearForm">Clear</v-btn>
			</v-form>
			<small>Already have an account?
				<router-link to="/login">
					Log in here
				</router-link>
			</small>
			<br>
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
    name: "",
    nameRules: [v => !!v || "Field cannot be empty"],
    email: "",
    emailRules: [
      v => !!v || "Field cannot be empty",
      v => /.+@.+/.test(v) || "Incorrect e-mail address"
    ],
    password: "",
    passwordRules: {
      required: value => !!value || "Field cannot be empty",
      min: v => (v && v.length >= 6) || "At least 6 characters",
      emailMatch: () => "Incorrect email or password !"
    },
    showPassword: false,
    repeatedPassword: "",
    repeatedPasswordRules: {
      required: value => !!value || "Field cannot be empty",
      min: v => (v && v.length >= 6) || "At least 6 characters"
    },
    showRepeatedPassword: false,
    errorInForm: false,
    formDuringSubmission: false
  }),
  methods: {
    registerFormSubmit() {
      if (this.$refs.form.validate()) {
        this.formDuringSubmission = true;
        console.log("Form accepted ! Triggering FB function...");

        this.$store
          .dispatch("register", {
            email: this.email,
            password: this.password,
            fullName: this.name
          })
          .then(result => {
            console.log("result of promise", result);
            this.formDuringSubmission = false;
            if (result === true) {
              this.clearForm();
              this.errorInForm = false;
              // TODO: create a "Flash" message somehow so that it prompts the user the account was successfully created and asks them to log in now.
              this.$router.push("/login");
            } else {
              this.errorInForm = true;
            }
          });
      }
    },
    clearForm() {
      this.$refs.form.reset();
    }
  },
  computed: {
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