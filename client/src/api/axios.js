import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches the server port we set up
});

// We can add interceptors here later for JWT tokens
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;