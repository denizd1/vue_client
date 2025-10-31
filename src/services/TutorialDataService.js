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

class TutorialDataService {
  // ======================
  // 1) Genel Liste
  // ======================
  getAll(params) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get("/tutorials", { params, headers: getAuthHeaders() });
  }

  // ======================
  // 2) Tüm Kayıtlar (Excel veya normal)
  // ======================
  findAllgetAll(params) {
    if (!isLoggedIn()) return Promise.resolve(null);

    const config = {
      params,
      headers: getAuthHeaders(),
    };

    // Excel export isteği
    if (params?.requestFlag === "excel") {
      config.responseType = "blob";
      config.headers["Content-Type"] = "application/json";
    }

    return api.get("/tutorials/getall", config);
  }

  // ======================
  // 3) Geo tabanlı kayıtlar (Excel dahil)
  // ======================
  findAllGeo(params) {
    if (!isLoggedIn()) return Promise.resolve(null);

    const config = {
      params,
      headers: getAuthHeaders(),
    };

    if (params?.requestFlag === "excel") {
      config.responseType = "blob";
      config.headers["Content-Type"] = "application/json";
    }

    return api.get("/tutorials/findAllGeo", config);
  }

  // ======================
  // 4) Tek kayıt
  // ======================
  get(id) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get(`/tutorials/${id}`, { headers: getAuthHeaders() });
  }

  // ======================
  // 5) Yayında olmayanlar
  // ======================
  getAllunPublished(params) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get("/tutorials/unpublished", {
      params,
      headers: getAuthHeaders(),
    });
  }

  // ======================
  // 6) Güncelle
  // ======================
  update(id, data) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.put(`/tutorials/${id}`, data, { headers: getAuthHeaders() });
  }

  // ======================
  // 7) Sil
  // ======================
  delete(id) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.delete(`/tutorials/${id}`, { headers: getAuthHeaders() });
  }

  // ======================
  // 8) Distinct filtre değerleri
  // ======================
  distinct(params) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get("/tutorials/distinct", {
      params,
      headers: getAuthHeaders(),
    });
  }

  // ======================
  // 9) Alt yöntem sayısı
  // ======================
  AltYontemCount() {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get("/tutorials/AltYontemCount", {
      headers: getAuthHeaders(),
    });
  }

  // ======================
  // 8) 🔥 Toplu Silme (Yeni)
  // ======================
  bulkDelete(data) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.post("/tutorials/bulk-delete", data, {
      headers: getAuthHeaders(),
    });
  }

  // ======================
  // 10) Title’a göre arama
  // ======================
  findByTitle(title) {
    if (!isLoggedIn()) return Promise.resolve(null);
    return api.get(`/tutorials?title=${title}`, {
      headers: getAuthHeaders(),
    });
  }
}

export default new TutorialDataService();
