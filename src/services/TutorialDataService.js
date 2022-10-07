import api from "./api";
let user = JSON.parse(localStorage.getItem("user"));

class TutorialDataService {
  getAll(params) {
    return api.get(
      "/tutorials",
      { params },
      { headers: { "x-access-token": user.accessToken } }
    );
  }

  findAllgetAll(params) {
    return api.get(
      "/tutorials/getall",
      { params },
      { headers: { "x-access-token": user.accessToken } }
    );
  }
  findAllGeo(params) {
    return api.get(
      "/tutorials/findAllGeo",
      { params },
      { headers: { "x-access-token": user.accessToken } }
    );
  }

  get(id) {
    return api.get(`/tutorials/${id}`, {
      headers: { "x-access-token": user.accessToken },
    });
  }

  getAllunPublished(params) {
    return (
      api.get("/tutorials/unpublished", { params }),
      { headers: { "x-access-token": user.accessToken } }
    );
  }

  create(data) {
    return api.post("/tutorials", data, {
      headers: { "x-access-token": user.accessToken },
    });
  }

  update(id, data) {
    return api.put(`/tutorials/${id}`, data, {
      headers: { "x-access-token": user.accessToken },
    });
  }

  delete(id) {
    return api.delete(`/tutorials/${id}`, {
      headers: { "x-access-token": user.accessToken },
    });
  }

  deleteAll() {
    return api.delete(`/tutorials`, {
      headers: { "x-access-token": user.accessToken },
    });
  }

  findByTitle(title) {
    return api.get(`/tutorials?title=${title}`, {
      headers: { "x-access-token": user.accessToken },
    });
  }
}

export default new TutorialDataService();
