import { login } from '@/api/auth';
import { getToken, setToken, removeToken } from '@/utils/storage';

const auth = {
  namespaced: true,
  state: {
    token: getToken() || '',
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const res = await login(credentials);
      const token = res.token || res.data?.token;
      commit('SET_TOKEN', token);
      setToken(token);
      return token;
    },
    logout({ commit }) {
      commit('SET_TOKEN', '');
      removeToken();
    },
  },
};

export default auth;
