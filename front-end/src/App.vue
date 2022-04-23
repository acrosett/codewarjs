<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer v-model="drawer" fixed app>
        <v-list dense>
          <v-list-tile v-on:click>
            <v-list-tile-action>
              <v-icon>info</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>What is this?</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile v-on:click>
            <v-list-tile-action>
              <v-icon>settings_overscan</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Simulation</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile v-on:click>
            <v-list-tile-action>
              <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile v-on:click>
            <v-list-tile-action>
              <v-icon>description</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>API</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar color="teal" dark fixed app>
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title>Script Arena</v-toolbar-title>
      </v-toolbar>
      <v-content>
        <v-container fluid fill-height>
          <v-layout justify-center align-center>
            <v-flex text-xs-center d-flex xs12 sm12 md6>
              <screen title="Simulation"/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
      <v-footer color="teal" app>
        <span class="white--text">&copy; 2017</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
/* eslint-disable */
import screen from "./components/screen.vue";

export default {
  data: () => ({
    drawer: null
  }),
  props: {
    source: String
  },
  name: "app",
  components: {
    screen
  }
};
</script>

<style>
#app {
  text-align: center;
  font-family: helvetica;
}

h1 {
  color: rgb(0, 29, 0);
  font-weight: 600;
}
</style>
