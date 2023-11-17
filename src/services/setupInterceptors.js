import axiosInstance from "./api";
import TokenService from "./token.service";

const setup = (store, router) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = TokenService.getLocalAccessToken();
      if (token) {
        config.headers["x-access-token"] = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      if (originalConfig.url !== "/auth/signin" && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          TokenService.removeUser();
          store.dispatch("auth/logout");
          router.push("/giris"); // Redirect to the login page
        } else if (err.response.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true;

          try {
            const rs = await axiosInstance.post("/auth/refreshtoken", {
              refreshToken: TokenService.getLocalRefreshToken(),
            });

            const { accessToken } = rs.data;

            store.dispatch("auth/refreshToken", accessToken);
            TokenService.updateLocalAccessToken(accessToken);

            // Reattempt the original request with the new token
            originalConfig.headers["x-access-token"] = accessToken;
            return axiosInstance(originalConfig);
          } catch (_error) {
            TokenService.removeUser();
            store.dispatch("auth/logout");
            router.push("/giris");
            return Promise.reject(_error);
          }
        }
      }

      return Promise.reject(err);
    }
  );
};

export default setup;
