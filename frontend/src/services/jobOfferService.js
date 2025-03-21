import axios from 'axios';

const API_URL = 'http://localhost:4000/job-offers';

export const jobOfferService = {
  async createJobOffer(jobOfferData) {
    const response = await axios.post(API_URL, jobOfferData);
    return response.data;
  },

  async getAllJobOffers() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async deleteJobOffer(id) {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  async updateJobOffer(id, jobOfferData) {
    const response = await axios.patch(`${API_URL}/${id}`, jobOfferData);
    return response.data;
  },

  async getJobOfferById(id) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async getCvsByJobOfferId(id) {
    const response = await axios.get(`${API_URL}/${id}/cvs`);
    return response.data;
  }
};