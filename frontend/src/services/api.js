import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const runPrediction = async (features) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict`, { features });
        return response.data;
    } catch (error) {
        console.error("Error calling inference API:", error);
        throw error;
    }
};
