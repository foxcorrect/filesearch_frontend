import { getResumeList, getResumeDetail, updateResume } from '@/api/resume';

const resume = {
  namespaced: true,
  state: {
    list: [],
    detail: null,
    loading: false,
  },
  mutations: {
    SET_LIST(state, list) {
      state.list = list;
    },
    SET_DETAIL(state, detail) {
      state.detail = detail;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchList({ commit }) {
      commit('SET_LOADING', true);
      try {
        const res = await getResumeList();
        commit('SET_LIST', res.data || res);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchDetail({ commit }, id) {
      const res = await getResumeDetail(id);
      commit('SET_DETAIL', res.data || res);
    },
    async updateDetail({ commit }, { id, data }) {
      const res = await updateResume(id, data);
      commit('SET_DETAIL', res.data || res);
      return res;
    },
  },
};

export default resume;
