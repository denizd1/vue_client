import api from "./api";
import axios from "axios";
import { bus } from "../main";

let user = JSON.parse(localStorage.getItem("user"));
let counter = null;
//bus on resetcounter
bus.$on("resetCount", () => {
  counter = 0;
});

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
    return api.get(
      "/tutorials/unpublished",
      { params },
      { headers: { "x-access-token": user.accessToken } }
    );
  }
  //make create function asynchronus to wait for the response

  create(data, len) {
    return axios
      .all(
        data.map((data) =>
          api.post("/tutorials", data, {
            headers: { "x-access-token": user.accessToken },
          })
        )
      )
      .then(() => {
        counter++;
        if (counter === len) {
          bus.$emit("alldone");
        }
      })
      .catch((err) => console.log(err));
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
