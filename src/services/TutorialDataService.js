import api from "./api";

class TutorialDataService {
  getAll(params) {
    return api.get("/tutorials", { params });
  }

  findAllgetAll(params) {
    return api.get("/tutorials/getall", { params });
  }
  findAllGeo(params) {
    return api.get("/tutorials/findAllGeo", { params });
  }

  get(id) {
    return api.get(`/tutorials/${id}`);
  }

  create(data) {
    return api.post("/tutorials", data);
  }

  update(id, data) {
    return api.put(`/tutorials/${id}`, data);
  }

  delete(id) {
    return api.delete(`/tutorials/${id}`);
  }

  deleteAll() {
    return api.delete(`/tutorials`);
  }

  findByTitle(title) {
    return api.get(`/tutorials?title=${title}`);
  }
}

export default new TutorialDataService();
