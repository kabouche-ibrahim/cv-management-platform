import axios from 'axios';

const FILE_SERVER_URL = 'http://localhost:8000';

export class CVService {
  static async uploadCV(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
 
      const fileResponse = await axios.post(`${FILE_SERVER_URL}/upload-resume`, formData, {
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