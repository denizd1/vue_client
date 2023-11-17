class TokenService {
  getLocalRefreshToken() {
    const user = this.getUser();
    return user ? user.refreshToken : null;
  }

  getLocalAccessToken() {
    const user = this.getUser();
    return user ? user.accessToken : null;
  }

  updateLocalAccessToken(token) {
    let user = this.getUser();
    if (user) {
      user.accessToken = token;
      this.setUser(user);
    }
  }

  getUser() {
    return JSON.parse(localStorage.getItem("user")) || {};
  }

  setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  removeUser() {
    localStorage.removeItem("user");
  }
}

export default new TokenService();
