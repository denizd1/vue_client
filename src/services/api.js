import axios from "axios";

const instance = axios.create({
  baseURL: "http://10.68.19.149:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
