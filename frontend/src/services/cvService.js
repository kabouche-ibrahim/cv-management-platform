import axios from 'axios';

const FILE_SERVER_URL = 'http://localhost:8000';

export class CVService {
  static async uploadCV(file, jobOfferId = null) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const url = jobOfferId 
        ? `${FILE_SERVER_URL}/upload-resume?job_offer_id=${jobOfferId}`
        : `${FILE_SERVER_URL}/upload-resume`;
        
      const fileResponse = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return fileResponse.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}