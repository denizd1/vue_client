import api from './api';

class UserService {
  getPublicContent() {
    return api.get('/mtaapp/all');
  }

  getUserBoard() {
    return api.get('/mtaapp/user');
  }

  getModeratorBoard() {
    return api.get('/mtaapp/mod');
  }

  getAdminBoard() {
    return api.get('/mtaapp/admin');
  }
}

export default new UserService();
