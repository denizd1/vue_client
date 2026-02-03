import api from "./api";

// Yardımcı fonksiyonlar (sınıf dışına)
function isLoggedIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.accessToken;
}

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.accessToken ? { "x-access-token": user.accessToken } : {};
}
class ProjectMethodDataService {
  // ======================
  // 1) Genel Liste
  getAll(params) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get("/project-methods", { params, headers: getAuthHeaders() });
  }
  // ======================
  // 2) Sütunlardan Tekil Değerler
  getUniqueValues(params) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get("/project-methods/unique-values", {
      headers: getAuthHeaders(),
      params,
    });
  }
}

export default new ProjectMethodDataService();
