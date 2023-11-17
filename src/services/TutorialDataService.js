import api from "./api";

class TutorialDataService {
  getAll(params) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.get(
        "/tutorials",
        { params },
        { headers: { "x-access-token": user.accessToken } }
      );
    } else {
      // Handle the case when the user is not logged in
      // You might want to return a promise that resolves to an empty response or handle it in some other way
      return Promise.resolve(null);
    }
  }

  findAllgetAll(params) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
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
    } else {
      // Handle the case when the user is not logged in
      // You might want to return a promise that resolves to an empty response or handle it in some other way
      return Promise.resolve(null);
    }
  }
  findAllGeo(params) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
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
    } else {
      // Handle the case when the user is not logged in
      // You might want to return a promise that resolves to an empty response or handle it in some other way
      return Promise.resolve(null);
    }
  }

  get(id) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.get(`/tutorials/${id}`, {
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      // Handle the case when the user is not logged in
      // You might want to return a promise that resolves to an empty response or handle it in some other way
      return Promise.resolve(null);
    }
  }

  getAllunPublished(params) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.get(
        "/tutorials/unpublished",
        { params },
        { headers: { "x-access-token": user.accessToken } }
      );
    } else {
      // Handle the case when the user is not logged in
      // You might want to return a promise that resolves to an empty response or handle it in some other way
      return Promise.resolve(null);
    }
  }
  //make create function asynchronus to wait for the response

  update(id, data) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.put(`/tutorials/${id}`, data, {
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      return Promise.resolve(null);
    }
  }

  delete(id) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.delete(`/tutorials/${id}`, {
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      return Promise.resolve(null);
    }
  }

  // deleteAll() {
  //   return api.delete(`/tutorials`, {
  //     headers: { "x-access-token": user.accessToken },
  //   });
  // }

  //get distinct
  distinct(params) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.get(
        "/tutorials/distinct",
        { params },
        {
          headers: { "x-access-token": user.accessToken },
        }
      );
    } else {
      return Promise.resolve(null);
    }
  }

  //get number of tutorials for each alt_yontem
  AltYontemCount() {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.get("/tutorials/AltYontemCount", {
        headers: { "x-access-token": user.accessToken },
      });
    } else {
      return Promise.resolve(null);
    }
  }

  findByTitle(title) {
    if (isLoggedIn()) {
      const user = JSON.parse(localStorage.getItem("user"));
      return api.get(`/tutorials?title=${title}`, {
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

export default new TutorialDataService();
