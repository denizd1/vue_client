import axios from "axios";

export default axios.create({
  baseURL: "http://10.68.19.149:8080/api",
  headers: {
    "Content-type": "application/json",
  },
});
