import api from "./api";
let user = JSON.parse(localStorage.getItem("user"));
import { bus } from "../main";

class UploadFilesService {
  async upload(file) {
    let formData = new FormData();

    formData.append("file", file);
    formData.append("user", user.username);

    await api.post("/tutorials/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-access-token": user.accessToken,
      },
    });
    bus.$emit("alldone");
  }
}

export default new UploadFilesService();
