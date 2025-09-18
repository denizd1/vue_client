import api from "./api";

let user = JSON.parse(localStorage.getItem("user"));

class RaporDataService {
  getAll(params) {
    if (isLoggedIn()) {
      return api.get("/rapor", {
        params,
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      return Promise.resolve(null);
    }
  }
  get(id) {
    if (isLoggedIn()) {
      return api.get(`/rapor/${id}`, {
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      return Promise.resolve(null);
    }
  }
  getUniqueValues() {
    if (isLoggedIn()) {
      return api.get("/rapor/unique-values", {
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      return Promise.resolve(null);
    }
  }
}
// Function to check if the user is logged in
function isLoggedIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.accessToken;
}

export default new RaporDataService();
