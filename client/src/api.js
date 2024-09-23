import axios from "axios";

export const googleAuth = (code) => {
  return axios.get(`http://localhost:4000/auth/google?code=${code}`);
};