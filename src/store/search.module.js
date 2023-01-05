//this store module is used to store parameters for search.
//these parameters are 'il', 'ilce', 'yontem'

const initialState = {
  il: null,
  ilce: null,
  yontem: [],
};

export const searchParam = {
  state: initialState,
  namespaced: true,
  mutations: {
    updateCity(state, payload) {
      state.il = payload;
    },
    updateDistrict(state, payload) {
      state.ilce = payload;
    },
    updateMethod(state, payload) {
      state.yontem = payload;
    },
  },
};
