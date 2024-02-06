import api from "./api";

class UserService {
  getAllUsers() {
    return api.get("/users/userlist");
  }
  //user_role table is belongs to user and role table. we need to update user_role table when we update user table.
  updateUser(data) {
    return api.put("/users/updateUser", data);
  }
  forgotPassword(email) {
    return api.put("/users/forgotPassword", { email });
  }
  resetPassword(params) {
    return api.put("/users/resetPassword", params);
  }
}
//update user roles

export default new UserService();
