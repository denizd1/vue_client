import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.get("/getcsrftoken").then(
  (response) => {
    console.log(response.data.csrfToken);
    instance.defaults.headers["X-CSRF-TOKEN"] = response.data.csrfToken;
  },
  (err) => {
    console.log(err);
  }
);
export default instance;
