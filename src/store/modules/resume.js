/*
 * @File: 
 * @Description: 
 * @Author: guyawei (1972065889@qq.com)
 * @Date: 2026-04-24 23:15:49
 * @LastEditTime: 2026-04-25 14:44:58
 * @LastEditors: guyawei (1972065889@qq.com)
 * @FilePath: \filesearch\resume-frontend\src\store\modules\resume.js
 */
import { getResumeList } from '@/api/resume';

const resume = {
  namespaced: true,
  state: {
    list: [],
    loading: false,
    total: 0,
    page: 1,
    size: 10,
  },
  mutations: {
    SET_LIST(state, list) {
      state.list = list;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_TOTAL(state, total) {
      state.total = total;
    },
    SET_PAGE(state, page) {
      state.page = page;
    },
    SET_SIZE(state, size) {
      state.size = size;
    },
  },
  actions: {
    async fetchList({ commit, state }, { page = state.page, size = state.size } = {}) {
      commit('SET_LOADING', true);
      try {
        const res = await getResumeList(page, size);
        commit('SET_LIST', res.data.items || res);
        if (res.data && res.data.total !== undefined) {
          commit('SET_TOTAL', res.data.total);
        }
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
};

export default resume;
