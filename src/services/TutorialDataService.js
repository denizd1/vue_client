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
    if (params && params.requestFlag === "excel") {
      return api.get("/tutorials/getall", {
        params,
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Custom content type for Excel download
        },
        responseType: "blob", // Important
      });
    } else {
      return api.get("/tutorials/getall", {
        params,
        headers: {
          "x-access-token": user.accessToken,
          // Other headers for non-Excel requests
        },
      });
    }
  }
  findAllGeo(params) {
    if (params && params.requestFlag === "excel") {
      return api.get("/tutorials/findAllGeo", {
        params,
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Custom content type for Excel download
        },
        responseType: "blob", // Important
      });
    } else {
      return api.get("/tutorials/findAllGeo", {
        params,
        headers: {
          "x-access-token": user.accessToken,
          // Other headers for non-Excel requests
        },
      });
    }
  }

  get(id) {
    return api.get(`/tutorials/${id}`, {
      headers: { "x-access-token": user.accessToken },
    });
  }

  getAllunPublished(params) {
    return api.get(
      "/tutorials/unpublished",
      { params },
      { headers: { "x-access-token": user.accessToken } }
    );
  }
  //make create function asynchronus to wait for the response

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

  //get distinct
  // distinct(params) {
  //   return api.get(
  //     "/tutorials/distinct",
  //     { params },
  //     {
  //       headers: { "x-access-token": user.accessToken },
  //     }
  //   );
  // }

  //get number of tutorials for each alt_yontem
  AltYontemCount() {
    return api.get("/tutorials/AltYontemCount", {
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
