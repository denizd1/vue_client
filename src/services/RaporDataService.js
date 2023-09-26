import api from "./api";

let user = JSON.parse(localStorage.getItem("user"));

class RaporDataService {
  getAll() {
    return api.get("/rapor", {
      headers: { "x-access-token": user.accessToken },
    });
  }
}

export default new RaporDataService();
