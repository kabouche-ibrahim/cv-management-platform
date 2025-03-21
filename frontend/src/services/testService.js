import axios from 'axios';

const API_URL = 'http://localhost:4000/tests';

export const testService = {
  async createTest(testData) {
    const response = await axios.post(API_URL, testData);
    return response.data;
  },

  async getAllTests() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async getTestById(testId) {
    console.log('Getting test by ID:', testId);
    const response = await axios.get(`${API_URL}/${testId}`); 
    return response.data;
},

  async updateTest(id, testData) {
    const response = await axios.patch(`${API_URL}/${id}`, testData);
    return response.data;
  },

  async deleteTest(id) {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  async submitTest(submitData) {
    const response = await axios.post(`${API_URL}/submit`, submitData);
    return response.data;
  },

  async getTestByLink(testLink) {
    console.log('Requesting test with link:', testLink);
    const response = await axios.get(`${API_URL}/take/${testLink}`);
    return response.data;
  },

  async generateTestLink(testId, jobOfferId, cvId) {
    const response = await axios.post(`${API_URL}/${testId}/generate-link`, {
      jobOfferId,
      cvId
    });
    console.log('Generated link response:', response.data); // Debug log
    return response.data;
  }
};