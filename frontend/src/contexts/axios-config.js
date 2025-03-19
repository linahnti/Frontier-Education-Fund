import axios from "axios";

// Add request interceptor for all axios requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token issues
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration or authentication errors
    if (error.response && error.response.status === 401) {
      console.log("Authentication error detected");
      // You can handle token refresh here if needed
      // Or just alert the user that they need to log in again
      
      // Uncomment the following if you want to automatically redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;