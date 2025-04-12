import axios from 'axios';

const API_URL = 'http://localhost:4000/job-offers';

export const jobOfferService = {
  async createJobOffer(jobOfferData) {
    const { skills = [], ...rest } = jobOfferData;
    const response = await axios.post(API_URL, {
      ...rest,
      offerSkills: Array.isArray(skills) ? skills.map(skillName => ({
        skill: { skillName }
      })) : []
    });
    return response.data;
  },

  async getAllJobOffers() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async deleteJobOffer(id) {
    console.log('Sending delete request for job offer:', id);
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  async updateJobOffer(id, jobOfferData) {
    const { skills = [], ...rest } = jobOfferData;
    const response = await axios.patch(`${API_URL}/${id}`, {
      ...rest,
      offerSkills: Array.isArray(skills) ? skills.map(skillName => ({
        skill: { skillName }
      })) : []
    });
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