import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const predictTraffic = async (features = []) => {
  try {
    const response = await axios.post(`${API_URL}/predict`, {
      features: features
    });
    return response.data;
  } catch (error) {
    console.error('Error predicting traffic:', error);
    throw error;
  }
};
