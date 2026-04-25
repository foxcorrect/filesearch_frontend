import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import resume from './modules/resume';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    resume,
  },
});
