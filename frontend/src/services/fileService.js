import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fileService = {
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file, file.name);
    });
    
    const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  uploadVideo: async (video) => {
    const formData = new FormData();
    formData.append('video', video);
    
    const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
