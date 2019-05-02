<template>
	<v-app dark>

		<v-toolbar class="mainNav"
		 color='black'
		 fixed
		 app>
			<router-link class='mainNav__logo-link'
			 :to="{name:'home'}">
				<ULALOGO class='mainNav__logo-link--logo'></ULALOGO>
			</router-link>
			<v-btn color="primary"
			 outline
			 small
			 fab
			 v-if="isLogged"
			 @click="logout"
			 class="mainNav__logout-btn white--text">
				<v-icon>mdi-logout</v-icon>
			</v-btn>
		</v-toolbar>
		<v-navigation-drawer class="sideNav"
		 mini-variant
		 permanent
		 app>
			<v-list>
				<v-list-tile v-for="(item, i) in items"
				 :to="item.to"
				 :key="i"
				 router
				 exact>
					<v-list-tile-action>
						<v-icon v-html="item.icon" />
					</v-list-tile-action>
					<v-list-tile-content>
						<v-list-tile-title v-text="item.title" />
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-navigation-drawer>
		<v-content id='main-background-window'>
			<v-container>
				<router-view />
			</v-container>
		</v-content>
		<v-footer app
		 class='footer'>
			<a class='caption'> Made by Grzegorz "Greg" Rybak</a>
		</v-footer>
	</v-app>
</template>

<script>
import ULALOGO from "./components/ULA-logo.svg";
// import ULALOGO2 from "./components/ULA-logo.svg.1";
export default {
  components: {
    ULALOGO
  },
  data() {
    return {
      items: [
        { icon: "mdi-radiobox-marked", title: "Welcome", to: "/" },
        {
          icon: "mdi-format-list-bulleted",
          title: "Inspire",
          to: "/recordings"
        }
      ]
    };
  },
  methods: {
    logout() {
      this.$router.replace("/login");
      this.$store.dispatch("logout");
    }
  },
  computed: {
    isLogged() {
      return this.$store.state.userLoggedIn;
    }
  },
  mounted() {}
};
</script>

<style lang='scss' scoped>
$violet-dark: #361f2f;
$violet-light: #ff6bd3;
#app {
  background-repeat: no-repeat;
  background-size: cover;
}

.footer {
  padding: 0 10px;
}

.sideNav {
  height: unset !important;
  margin-top: 0px;
  transform: translateX(0px);
  width: 80px;
  border-bottom-right-radius: 8%;
  box-shadow: 3px 3px 30px rgba(0, 0, 0, 0.8);
}

.mainNav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  z-index: 3;
  position: relative;
  padding-left: 0 !important;
  &__logo-link {
    height: 100%;
    width: 125px;
    display: flex;
    position: relative;
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      transform: translateY(64px);
      background-image: linear-gradient(
        0deg,
        darken($violet-light, 45%) 10%,
        transparent 78%
      );
      // background-image: linear-gradient(0deg, #ff6bd3 -16%, transparent 90%);
      transition: transform 0.4s ease;
      border-radius: 50%;
    }
    &:hover::after {
      transform: translateY(26px);
      // background-color: black;
    }
    &--logo {
      height: 100%;
    }
  }

  &__logout-btn {
    position: absolute;
    top: 5px;
    right: 15px;
  }
}
.hidden {
  display: none;
}

.footer {
  background: #331d2c;
  .caption {
    color: #cbcbcb;
  }
}
#main-background-window {
  padding: 60px 0px 32px !important;
  background-image: linear-gradient(black, $violet-dark);
}
.container {
  min-height: calc(100vh - 95px);
  padding: 0 25px 25px 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

