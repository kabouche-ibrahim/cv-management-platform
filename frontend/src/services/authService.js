import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('Auth service response:', response); 
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      throw new Error('No data in response');
    } catch (error) {
      console.error('Auth service error:', error);
      throw error;
    }
  },

  async register(userData) {
    return axios.post(`${API_URL}/auth/register`, {
      ...userData,
      role: userData.role // Use the role directly from userData
    });
  },

  async getHRUsers() {
    return axios.get(`${API_URL}/auth/hr-users`);
  },

  async deleteUser(userId) {
    return axios.delete(`${API_URL}/auth/users/${userId}`);
  },

  async updateUser(userId, userData) {
    return axios.put(`${API_URL}/auth/users/${userId}`, userData);
  },

  logout() {
    localStorage.removeItem('user');
  },


  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
};