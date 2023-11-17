//this store module is used to store parameters for search.
//these parameters are 'il', 'ilce', 'yontem' and 'coords'

const initialState = {
  il: null,
  ilce: null,
  yontem: [],
  coords: null,
  calisma_tarihi: null,
  calisma_amaci: null,
  proje_kodu: null,
  kuyu_arsiv_no: null,
  jeofizik_arsiv_no: null,
  derleme_no: null,
  cd_no: null,
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
    updateCoords(state, payload) {
      state.coords = payload;
    },
    updateWorkType(state, payload) {
      state.calisma_amaci = payload;
    },
    updateWorkDate(state, payload) {
      state.calisma_tarihi = payload;
    },
    updateProjectCode(state, payload) {
      state.proje_kodu = payload;
    },
    updateLogNo(state, payload) {
      state.kuyu_arsiv_no = payload;
    },
    updateGeoNo(state, payload) {
      state.jeofizik_arsiv_no = payload;
    },
    updateDerleme(state, payload) {
      state.derleme_no = payload;
    },
    updateCd(state, payload) {
      state.cd_no = payload;
    },
  },
};
